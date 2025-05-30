# VinyLibrary

A web application to display, track, and count plays of your vinyl record collection.

## Features

- 📀 Display your vinyl collection with detailed information
- 🎵 Track play counts and listening history
- 👤 User authentication and personal collections

# Demo
website: https://demo.vinyl.aka.cy

username: demo

password: vkGU8$8c2si633H3%E%K!BVTpK55TVMQE9ufjgEA&Nz8p@3EPeQ6Mj^xu6wktYXM

restore file: https://demo.vinyl.aka.cy/demo_backup_20250530_085715_UTC+00_signed.zip

PS: The register new function and change password function are disabled in the demo site.
## Tech Stack

- **Backend**: Go lang
- **Frontend**: React (Next.js framework )
- **Database**: PostgreSQL
- **Web Server**: Nginx

## Installation Guide

This guide uses Ubuntu as an example and assumes you're logged in as root. The tutorial deploys both frontend and backend on a single node.

### Step 1: Install Go

1. Download and install Go 1.24.3:

```bash
cd ~
wget https://go.dev/dl/go1.24.3.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.24.3.linux-amd64.tar.gz
```

1. Add Go to your PATH:

```bash
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

1. Verify installation:

```bash
go version
```

### Step 2: Install Node.js and pnpm

1. Install Node Version Manager (nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
```

1. Install Node.js 24:

```bash
nvm install 24
nvm use 24
```

1. Enable and install pnpm:

```bash
corepack enable pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
```

1. Verify installations:

```bash
node -v
pnpm -v
```

### Step 3: Install and Configure PostgreSQL

1. Install PostgreSQL and dependencies:

```bash
apt update
apt install postgresql postgresql-contrib libpq-dev python3-dev build-essential
```

1. Configure PostgreSQL authentication:

```bash
vim /etc/postgresql/14/main/pg_hba.conf
```

Add these lines at the end of the file:

```conf
# VinyLibrary database access
host    your_db_name    your_db_username    0.0.0.0/0    scram-sha-256
host    your_db_name    your_db_username    ::/0         scram-sha-256
```

1. Create database and user:

```bash
su - postgres
psql
```

Execute the following SQL commands (replace placeholders with your actual values):

```sql
-- Create database and user
CREATE DATABASE your_db_name;
CREATE USER your_db_username WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_username;

-- Connect to the new database
\c your_db_name your_db_username

-- Create tables
CREATE TABLE vinyls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    artist VARCHAR(255),
    year INTEGER,
    vinyl_type VARCHAR(2),
    vinyl_number INTEGER,
    tracklist JSON,
    album_picture_url TEXT,
    play_num INTEGER DEFAULT 0,
    timebought TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10, 2),
    description TEXT,
    currency VARCHAR(10),
    status VARCHAR(10)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE play (
    id SERIAL PRIMARY KEY,
    vinyl_id INTEGER REFERENCES vinyls(id),
    user_id INTEGER REFERENCES users(id),
    play_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status BOOLEAN DEFAULT TRUE
);

\q
```

1. Exit and restart PostgreSQL:

```bash
exit  # Exit postgres user
systemctl restart postgresql
```

### Step 4: Deploy Backend

1. Clone the repository:

```bash
cd ~
git clone https://github.com/Doublefire-Chen/VinyLibrary
cd VinyLibrary/back-end/
```

1. Create environment configuration:

```bash
vim .env
```

Add the following configuration (replace with your actual values):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_username
DB_NAME=your_db_name
DB_PASSWORD="your_db_password"
DB_SSLMODE=disable
DOMAIN=https://your.domain
CAN_REGISTER=true
BACKUP_SALT="your_random_salt_string_here"
GO_PORT="127.0.0.1:1234"
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your.domain
NEXT_PUBLIC_PLAUSIBLE_SRC=http://your.plausible/js/script.js
```

1. Build the backend:

```bash
make build
```

1. Create systemd service:

```bash
vim /etc/systemd/system/vinyl-backend.service
```

Add the following service configuration:

```ini
[Unit]
Description=Vinyl Collection Backend API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/VinyLibrary/back-end
ExecStart=/root/VinyLibrary/back-end/bin/backend
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=vinyl-backend

# Environment variables
Environment=GIN_MODE=release
Environment=PORT=1234

[Install]
WantedBy=multi-user.target
```

1. Start the backend service:

```bash
systemctl daemon-reload
systemctl enable vinyl-backend
systemctl start vinyl-backend
systemctl status vinyl-backend
```

### Step 5: Deploy Frontend

1. Build the frontend:

```bash
cd ~/VinyLibrary/front-end/
vim .env
```
**Note**: Replace `your.domain` with your actual domain name throughout the configuration.

```
NEXT_PUBLIC_BACKEND_URL=https://your.domain
```

```bash
pnpm install
pnpm build
```

1. Deploy to web directory:

```bash
mkdir -p /var/www/vinyl
cp -r out/* /var/www/vinyl/
```

### Step 6: Configure Nginx

1. Install Nginx and SSL tools:

```bash
apt install nginx certbot python3-certbot-nginx
```

1. Create Nginx configuration:

```bash
vim /etc/nginx/sites-available/your.domain
```

**Note**: Replace `your.domain` with your actual domain name throughout the configuration.

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your.domain www.your.domain;
    return 301 https://your.domain$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name your.domain;
    
    # SSL Configuration (certificates will be added by certbot)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # File Upload Configuration
    client_max_body_size 100M;
    client_body_timeout 300s;
    client_header_timeout 60s;
    client_body_temp_path /tmp/nginx_uploads;
    client_body_buffer_size 128k;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes - proxy to Go backend
    location /api/ {
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Extended timeouts for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Static files
    location / {
        root /var/www/vinyl;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Logging
    access_log /var/log/nginx/vinyl_access.log;
    error_log /var/log/nginx/vinyl_error.log;
}
```

1. Enable the site and obtain SSL certificate:

```bash
# Enable the site
ln -s /etc/nginx/sites-available/your.domain /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d your.domain -d www.your.domain
```



## Usage

1. Navigate to `https://your.domain` in your web browser
2. Register a new account or log in
3. Start adding your vinyl records to your collection
4. Track plays and enjoy your digital vinyl library!

## Configuration

### Environment Variables

| Variable                | Description             | Default     |
| ----------------------- | ----------------------- | ----------- |
| `DB_HOST`               | PostgreSQL host         | `localhost` |
| `DB_PORT`               | PostgreSQL port         | `5432`      |
| `DB_USER`               | Database username       | -           |
| `DB_NAME`               | Database name           | -           |
| `DB_PASSWORD`           | Database password       | -           |
| `DOMAIN`                | Your domain URL         | -           |
| `CAN_REGISTER`          | Allow new registrations | `true`      |
| `BACKUP_SALT`           | Salt for security       | -           |
| `GO_PORT`               | Go backend port         | `127.0.0.1:1234` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL             | -           |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain | -           |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | Plausible analytics script URL | -           |


------

**Happy collecting! 🎵**

# VinyLibrary
Display and count the plays of your vinyl collection.



# How to install

This tutorial takes Ubuntu as an example. My user logged in is root. I did not test deploy frontend and backend separately. In principle it can. This tutorial is an example in one node.

## Install pre-requirement.

### Go language

1. Install go lang. You can also refer to go lang official install instructions(https://go.dev/doc/install)

   ```bash
   cd ~
   wget https://go.dev/dl/go1.24.3.linux-amd64.tar.gz
   rm -rf /usr/local/go && tar -C /usr/local -xzf go1.24.3.linux-amd64.tar.gz
   vim .bashrc
   ```

   ```bash
   export PATH=$PATH:/usr/local/go/bin # add this line at last
   ```

   ```bash
   source .bashrc
   go version # check if go is installed successfully
   ```

### pnpm

1.  Install nodejs and pnpm. You can also refer to their official install tutorial. nodejs(https://nodejs.org/en/download) and pnpm(https://pnpm.io/installation)

   ```bash
   # Download and install nvm:
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   
   # in lieu of restarting the shell
   \. "$HOME/.nvm/nvm.sh"
   
   # Download and install Node.js:
   nvm install 24
   
   # Verify the Node.js version:
   node -v # Should print "v24.1.0".
   nvm current # Should print "v24.1.0".
   
   # Download and install pnpm:
   corepack enable pnpm
   
   # Verify pnpm version:
   pnpm -v
   
   # Install pnpm
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   source /root/.bashrc
   ```

### PostgreSQL database installation and configuration

```bash
apt install libpq-dev
apt install python3.11-dev # Change the version number to your version
pip install psycopg2
sudo apt install build-essential # If that's not enough, you might additionally need to install
vim /etc/postgresql/14/main/pg_hba.conf
```

```conf
# add following lines at last to give permission for connection
host    your_db_name    your_db_username    0.0.0.0/0    scram-sha-256
host    your_db_name    your_db_username    ::/0    scram-sha-256
```

```bash
su - postgres
psql
```

```sql
CREATE DATABASE your_db_name;
CREATE USER your_username WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_username;
\c your_db_name your_db_username
CREATE TABLE vinyls (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) ,
    artist VARCHAR(255) ,
    year integer,
    vinyl_type VARCHAR(2),
    vinyl_number integer,
    tracklist JSON,
    album_picture_url TEXT,
    play_num integer,
    timebought timestamp with time zone,
    price DECIMAL(10, 2),
    description TEXT,
    currency VARCHAR(10),
    status VARCHAR(10)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username varchar(20) UNIQUE,
    password TEXT
);

CREATE TABLE play (
    id SERIAL PRIMARY KEY,
    vinyl_id integer REFERENCES vinyls(id),
    user_id integer REFERENCES users(id),
    play_time timestamp with time zone,
    status boolean
);
exit
```

```bash
exit # back to root user
service postgresql restart
```

## Deploy backend and frontend

```bash
cd ~
git clone https://github.com/Doublefire-Chen/VinyLibrary
cd VinyLibrary/back-end/
vim .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_username
DB_NAME=your_db_name
DB_PASSWORD="your_db_password"
DB_SSLMODE=disable
DOMAIN=https://your.domain
CAN_REGISTER = True
BACKUP_SALT = "generate a ramdom string used as salt for safety concern"
```

```bash
go build -ldflags "-X main.Version=$(git describe --tags --abbrev=0 --match 'backend-v*')" -o bin/backend
vim /etc/systemd/system/vinyl-backend.service
```

```service
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

```bash
sudo systemctl daemon-reload
sudo systemctl restart vinyl-backend
sudo systemctl status vinyl-backend
```

## Deploy frontend

```bash
cd ~/VinyLibrary/front-end/
pnpm install
pnpm build
mkdir /var/www/vinyl
mv out/* /var/www/vinyl/*
sudo apt install nginx python3-certbot-nginx certbot #install nginx if you did not install it before. You can also use other web server as well.
vim /etc/nginx/sites-available/your.domain
```

```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your.domain www.your.domain;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://your.domain$request_uri;
}

# HTTPS server configuration
server {
    listen 443 ssl http2;
    server_name your.domain;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your.domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # File Upload Configuration
    client_max_body_size 10M;          # Allow up to 100MB uploads
    client_body_timeout 120s;           # Timeout for reading client request body
    client_header_timeout 60s;          # Timeout for reading client request header
    
    # Large file handling
    client_body_temp_path /tmp/nginx_uploads;
    client_body_in_file_only clean;      # Store large uploads in temp files
    client_body_buffer_size 128k;        # Buffer size for request body

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # API routes - proxy to Go backend
    location /api/ {
        # Specific upload limits for API endpoints
        client_max_body_size 100M;
        client_body_timeout 300s;        # 5 minutes for large uploads
        
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Extended timeouts for file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;         # 5 minutes for sending to backend
        proxy_read_timeout 300s;         # 5 minutes for reading from backend
        
        # Enhanced buffer settings for large files
        proxy_buffering off;             # Disable buffering for uploads
        proxy_request_buffering off;     # Stream uploads directly to backend
        proxy_max_temp_file_size 0;      # Disable temp files for proxy
        
        # CORS headers (backup in case backend doesn't handle it)
        add_header 'Access-Control-Allow-Origin' 'https://your.domain' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://your.domain';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Specific upload endpoint with even more generous limits
    location /api/upload {
        client_max_body_size 500M;       # Allow up to 500MB for uploads
        client_body_timeout 600s;        # 10 minutes timeout
        
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Very generous timeouts for large file uploads
        proxy_connect_timeout 60s;
        proxy_send_timeout 600s;         # 10 minutes
        proxy_read_timeout 600s;         # 10 minutes
        
        # Optimized for streaming large files
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_max_temp_file_size 0;
        
        # Upload progress support
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:1234;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Quick timeouts for health checks
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }

    # Static files - serve from /var/www/vinyl
    location / {
        root /var/www/vinyl;
        index index.html index.htm;
        try_files $uri $uri.html $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            root /var/www/vinyl;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary "Accept-Encoding";
        }
        
        # Cache HTML files for shorter time
        location ~* \.(html|htm)$ {
            root /var/www/vinyl;
            expires 1h;
            add_header Cache-Control "public, max-age=3600";
        }
    }

    # Favicon
    location = /favicon.ico {
        root /var/www/vinyl;
        log_not_found off;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Robots.txt
    location = /robots.txt {
        root /var/www/vinyl;
        log_not_found off;
        access_log off;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    error_page 413 /413.html;            # Custom page for upload too large
    
    location = /404.html {
        root /var/www/vinyl;
        internal;
    }
    
    location = /50x.html {
        root /var/www/vinyl;
        internal;
    }
    
    location = /413.html {
        root /var/www/vinyl;
        internal;
    }

    # Logging
    access_log /var/log/nginx/vinyl_access.log;
    error_log /var/log/nginx/vinyl_error.log;
}

# Redirect www to non-www
server {
    listen 443 ssl http2;
    server_name www.your.domain;
    
    ssl_certificate /etc/letsencrypt/live/your.domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain/privkey.pem;
    
    return 301 https://your.domain$request_uri;
}
```

```bash
service nginx restart
```

Then you can go to https://your.domain to register, and happy with VinyLibrary!


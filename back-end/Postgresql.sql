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
    username varchar(12) PRIMARY KEY,
    password TEXT
);

CREATE TABLE play (
    id SERIAL PRIMARY KEY,
    vinyl_id integer REFERENCES vinyls(id),
    user_id integer REFERENCES users(id),
    play_time timestamp with time zone,
    status boolean
);
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    status TEXT,
    species TEXT,
    type TEXT,
    gender TEXT,
    origin TEXT,
    location TEXT,
    image TEXT,
    url TEXT,
    created TIMESTAMP
)
CREATE TABLE stations (
    id      BIGSERIAL PRIMARY KEY,
    code    VARCHAR(10) NOT NULL UNIQUE,
    name    VARCHAR(100) NOT NULL,
    city    VARCHAR(100) NOT NULL,
    state   VARCHAR(100) NOT NULL
);
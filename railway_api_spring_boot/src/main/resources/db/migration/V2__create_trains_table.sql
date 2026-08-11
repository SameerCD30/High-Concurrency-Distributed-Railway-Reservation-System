CREATE TABLE trains (
    id           BIGSERIAL PRIMARY KEY,
    number       VARCHAR(10) NOT NULL UNIQUE,
    name         VARCHAR(150) NOT NULL,
    train_type   VARCHAR(30)  -- e.g. RAJDHANI, EXPRESS, SUPERFAST
);
CREATE TABLE coaches (
    id           BIGSERIAL PRIMARY KEY,
    train_id     BIGINT NOT NULL REFERENCES trains(id),
    coach_number VARCHAR(10) NOT NULL,
    class_type   VARCHAR(10) NOT NULL,
    UNIQUE(train_id, coach_number)
);

CREATE TABLE seats (
    id           BIGSERIAL PRIMARY KEY,
    coach_id     BIGINT NOT NULL REFERENCES coaches(id),
    seat_number  INT NOT NULL,
    seat_type    VARCHAR(20),
    UNIQUE(coach_id, seat_number)
);

CREATE INDEX idx_seats_coach ON seats(coach_id);
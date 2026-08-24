CREATE TABLE train_instances (
    id             BIGSERIAL PRIMARY KEY,
    train_id       BIGINT NOT NULL REFERENCES trains(id),
    journey_date   DATE NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    UNIQUE(train_id, journey_date)
);

CREATE TABLE bookings (
    id                  BIGSERIAL PRIMARY KEY,
    pnr                 VARCHAR(20) NOT NULL UNIQUE,
    user_id             BIGINT,
    train_instance_id   BIGINT NOT NULL REFERENCES train_instances(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE passenger_bookings (
    id             BIGSERIAL PRIMARY KEY,
    booking_id     BIGINT NOT NULL REFERENCES bookings(id),
    seat_id        BIGINT REFERENCES seats(id),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age  INT NOT NULL,
    board_seq      INT NOT NULL,
    deboard_seq    INT NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
);

CREATE INDEX idx_pb_seat ON passenger_bookings(seat_id);
CREATE INDEX idx_pb_booking ON passenger_bookings(booking_id);
CREATE INDEX idx_bookings_train_instance ON bookings(train_instance_id);
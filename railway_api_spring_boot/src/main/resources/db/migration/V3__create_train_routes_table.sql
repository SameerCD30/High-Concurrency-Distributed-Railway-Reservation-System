CREATE TABLE train_routes (
    id              BIGSERIAL PRIMARY KEY,
    train_id        BIGINT NOT NULL REFERENCES trains(id),
    station_id      BIGINT NOT NULL REFERENCES stations(id),
    sequence_no     INT NOT NULL,
    arrival_time    TIME,
    departure_time  TIME,
    day_offset      INT NOT NULL DEFAULT 0,
    distance_km     INT NOT NULL,
    UNIQUE(train_id, sequence_no),
    UNIQUE(train_id, station_id)
);

CREATE INDEX idx_route_station_train ON train_routes(station_id, train_id);
CREATE INDEX idx_route_train_seq ON train_routes(train_id, sequence_no);
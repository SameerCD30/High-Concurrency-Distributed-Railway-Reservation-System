-- Stations
INSERT INTO stations (code, name, city, state) VALUES
('NDLS', 'New Delhi', 'Delhi', 'Delhi'),
('CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh'),
('PNBE', 'Patna Junction', 'Patna', 'Bihar'),
('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal');

-- Trains
INSERT INTO trains (number, name, train_type) VALUES
('12302', 'Howrah Rajdhani', 'RAJDHANI');

-- Route for train 12302 — look up IDs by code/number instead of hardcoding
INSERT INTO train_routes (train_id, station_id, sequence_no, arrival_time, departure_time, day_offset, distance_km)
VALUES
((SELECT id FROM trains WHERE number = '12302'), (SELECT id FROM stations WHERE code = 'NDLS'), 1, NULL, '16:55', 0, 0),
((SELECT id FROM trains WHERE number = '12302'), (SELECT id FROM stations WHERE code = 'CNB'),  2, '21:30', '21:35', 0, 440),
((SELECT id FROM trains WHERE number = '12302'), (SELECT id FROM stations WHERE code = 'PNBE'), 3, '04:00', '04:10', 1, 990),
((SELECT id FROM trains WHERE number = '12302'), (SELECT id FROM stations WHERE code = 'HWH'),  4, '10:05', NULL, 1, 1450);
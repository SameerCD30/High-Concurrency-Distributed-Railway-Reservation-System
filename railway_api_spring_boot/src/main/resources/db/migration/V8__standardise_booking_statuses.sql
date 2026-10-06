-- Fix the old typo: passengers were stored as WAITLIST, bookings as WAITLISTED
UPDATE passenger_bookings SET status = 'WAITLISTED' WHERE status = 'WAITLIST';

-- From now on the database itself rejects any status outside the allowed list
ALTER TABLE bookings
    ADD CONSTRAINT chk_bookings_status
        CHECK (status IN ('PENDING', 'CONFIRMED', 'WAITLISTED', 'CANCELLED'));

ALTER TABLE passenger_bookings
    ADD CONSTRAINT chk_passenger_bookings_status
        CHECK (status IN ('PENDING', 'CONFIRMED', 'WAITLISTED', 'CANCELLED'));
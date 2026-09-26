package com.Sameer.railway_api_spring_boot;

import com.Sameer.railway_api_spring_boot.repository.SeatRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class AvailabilityQueryTest {

    @Autowired
    private SeatRepo seatRepo;

    @Autowired
    private JdbcTemplate jdbc;

    private Long trainId;

    @BeforeEach
    void lookUpTrainId() {
        trainId = jdbc.queryForObject(
                "SELECT id FROM trains WHERE number = '12302'", Long.class);
    }

    @Test
    void dateWithNoBookingsHasEveryClassFullyAvailable() {
        LocalDate emptyDate = LocalDate.of(2030, 1, 1);

        assertEquals(72, seatRepo.countAvailableSeats(trainId, emptyDate, "SL", 1, 4));
        assertEquals(64, seatRepo.countAvailableSeats(trainId, emptyDate, "3A", 1, 4));
        assertEquals(46, seatRepo.countAvailableSeats(trainId, emptyDate, "2A", 1, 4));
    }

    @Test
    void matchesThePgAdminResultForTheConcurrencyTestDate() {
        LocalDate date = LocalDate.of(2026, 9, 20);

        assertEquals(52, seatRepo.countAvailableSeats(trainId, date, "SL", 1, 4));
    }
}
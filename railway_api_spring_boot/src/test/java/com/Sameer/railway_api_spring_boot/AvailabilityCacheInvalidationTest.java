package com.Sameer.railway_api_spring_boot;

import com.Sameer.railway_api_spring_boot.Service.AvailabilityService;
import com.Sameer.railway_api_spring_boot.Service.BookingService;
import com.Sameer.railway_api_spring_boot.Service.TrainSearchService;
import com.Sameer.railway_api_spring_boot.dto.BookingRequest;
import com.Sameer.railway_api_spring_boot.dto.BookingResponse;
import com.Sameer.railway_api_spring_boot.dto.TrainSearchResult;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
class AvailabilityCacheInvalidationTest {

    @Autowired
    private TrainSearchService trainSearchService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private StringRedisTemplate redis;

    @Autowired
    private JdbcTemplate jdbc;

    private final LocalDate date = LocalDate.of(2032, 3, 1);   // a date only this test uses
    private final List<String> pnrsToCleanUp = new ArrayList<>();

    private Long trainId;
    private Long fromStationId;
    private Long toStationId;
    private String slKey;

    @BeforeEach
    void setUp() {
        trainId = jdbc.queryForObject("SELECT id FROM trains WHERE number = '12302'", Long.class);
        fromStationId = jdbc.queryForObject("SELECT id FROM stations WHERE code = 'NDLS'", Long.class);
        toStationId = jdbc.queryForObject("SELECT id FROM stations WHERE code = 'HWH'", Long.class);
        slKey = AvailabilityService.cacheKey(trainId, date, "SL");
        redis.delete(slKey);   // start with an empty cache
    }

    @AfterEach
    void cleanUp() {
        for (String pnr : pnrsToCleanUp) {
            jdbc.update("DELETE FROM passenger_bookings WHERE booking_id = (SELECT id FROM bookings WHERE pnr = ?)", pnr);
            jdbc.update("DELETE FROM bookings WHERE pnr = ?", pnr);
        }
        redis.delete(slKey);
    }

    @Test
    void confirmedBookingClearsCacheSoNextSearchIsCorrect() {
        // 1. Search: fills the cache
        long before = slSeatsAvailable();
        assertEquals(String.valueOf(before), redis.opsForHash().get(slKey, "1-4"),
                "search should have cached the SL count");

        // 2. Book one SL seat
        BookingResponse response = bookingService.createBooking(slRequest());
        pnrsToCleanUp.add(response.getPnr());
        assertEquals("CONFIRMED", response.getStatus());

        // 3. The booking must have deleted the SL cache key
        assertFalse(redis.hasKey(slKey), "a confirmed booking should delete the SL cache key");

        // 4. The next search must show exactly one seat fewer, not a stale number
        assertEquals(before - 1, slSeatsAvailable());
    }

    private long slSeatsAvailable() {
        List<TrainSearchResult> results = trainSearchService.searchTrains(fromStationId, toStationId, date);
        TrainSearchResult train = results.stream()
                .filter(r -> r.getTrainId().equals(trainId))
                .findFirst()
                .orElseThrow();
        return train.getAvailableSeats().get("SL");
    }

    private BookingRequest slRequest() {
        BookingRequest req = new BookingRequest();
        req.setTrainId(trainId);
        req.setJourneyDate(date);
        req.setClassType("SL");
        req.setFromStationId(fromStationId);
        req.setToStationId(toStationId);
        req.setPassengerName("Cache Invalidation Test");
        req.setPassengerAge(30);
        return req;
    }
}
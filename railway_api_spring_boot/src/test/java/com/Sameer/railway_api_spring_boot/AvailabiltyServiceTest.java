package com.Sameer.railway_api_spring_boot;

import com.Sameer.railway_api_spring_boot.Service.AvailabilityService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class AvailabilityServiceTest {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private StringRedisTemplate redis;

    @Autowired
    private JdbcTemplate jdbc;

    private final LocalDate date = LocalDate.of(2030, 1, 1);   // nobody has booked this date
    private Long trainId;
    private String key;

    @BeforeEach
    void setUp() {
        trainId = jdbc.queryForObject("SELECT id FROM trains WHERE number = '12302'", Long.class);
        key = AvailabilityService.cacheKey(trainId, date, "SL");
        redis.delete(key);   // start with an empty cache
    }

    @AfterEach
    void cleanUp() {
        redis.delete(key);
    }

    @Test
    void missThenHitThenEvict() {
        // 1. MISS: nothing cached, so the answer comes from Postgres and gets stored
        assertEquals(72, availabilityService.getAvailableSeats(trainId, date, "SL", 1, 4));
        assertEquals("72", redis.opsForHash().get(key, "1-4"));

        Long ttl = redis.getExpire(key);
        assertTrue(ttl != null && ttl > 0 && ttl <= 600, "TTL should be set, got " + ttl);

        // 2. HIT: plant a fake number. If the service returns it, the answer came from Valkey
        redis.opsForHash().put(key, "1-4", "999");
        assertEquals(999, availabilityService.getAvailableSeats(trainId, date, "SL", 1, 4));

        // 3. EVICT: after deleting, the next call goes back to Postgres
        availabilityService.evict(trainId, date, "SL");
        assertEquals(72, availabilityService.getAvailableSeats(trainId, date, "SL", 1, 4));
    }
}
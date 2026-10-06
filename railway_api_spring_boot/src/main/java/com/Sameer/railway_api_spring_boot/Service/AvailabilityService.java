package com.Sameer.railway_api_spring_boot.Service;

import com.Sameer.railway_api_spring_boot.repository.SeatRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;
import java.time.LocalDate;

@Service
public class AvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(AvailabilityService.class);
    private static final Duration TTL = Duration.ofMinutes(10);

    private final StringRedisTemplate redis;
    private final SeatRepo seatRepo;
    private final boolean cacheEnabled;

    public AvailabilityService(StringRedisTemplate redis, SeatRepo seatRepo,
                               @Value("${availability.cache.enabled:true}") boolean cacheEnabled) {
        this.redis = redis;
        this.seatRepo = seatRepo;
        this.cacheEnabled = cacheEnabled;
    }

    public long getAvailableSeats(Long trainId, LocalDate journeyDate, String classType,
                                  int boardSeq, int deboardSeq) {
        if (!cacheEnabled) {
            return seatRepo.countAvailableSeats(trainId, journeyDate, classType, boardSeq, deboardSeq);
        }
        String key = cacheKey(trainId, journeyDate, classType);
        String field = boardSeq + "-" + deboardSeq;

        // 1. Try the cache first
        try {
            Object cached = redis.opsForHash().get(key, field);
            if (cached != null) {
                return Long.parseLong((String) cached);          // HIT
            }
        } catch (DataAccessException e) {
            log.warn("Cache read failed for {}, using Postgres", key, e);
            return seatRepo.countAvailableSeats(trainId, journeyDate, classType, boardSeq, deboardSeq);
        }

        // 2. MISS: ask Postgres, the source of truth
        long count = seatRepo.countAvailableSeats(trainId, journeyDate, classType, boardSeq, deboardSeq);

        // 3. Remember the answer for next time
        try {
            redis.opsForHash().put(key, field, String.valueOf(count));
            redis.expire(key, TTL);
        } catch (DataAccessException e) {
            log.warn("Cache write failed for {}", key, e);
        }
        return count;
    }

    public void evict(Long trainId, LocalDate journeyDate, String classType) {
        try {
            redis.delete(cacheKey(trainId, journeyDate, classType));
        } catch (DataAccessException e) {
            log.warn("Cache evict failed for {}", cacheKey(trainId, journeyDate, classType), e);
        }
    }

    public static String cacheKey(Long trainId, LocalDate journeyDate, String classType) {
        return "avail:" + trainId + ":" + journeyDate + ":" + classType;
    }
}
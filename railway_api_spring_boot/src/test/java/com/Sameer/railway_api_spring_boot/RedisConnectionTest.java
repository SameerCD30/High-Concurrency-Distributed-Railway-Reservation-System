package com.Sameer.railway_api_spring_boot;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class RedisConnectionTest {

    @Autowired
    private StringRedisTemplate redis;

    @Test
    void canWriteAndReadFromRedis() {
        redis.opsForValue().set("healthcheck:ping", "pong");

        String value = redis.opsForValue().get("healthcheck:ping");
        assertEquals("pong", value);

        redis.delete("healthcheck:ping");
    }
}
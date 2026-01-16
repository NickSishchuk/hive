package com.hive.controller;

import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    public HealthController(DataSource dataSource, RedisConnectionFactory redisConnectionFactory) {
        this.dataSource = dataSource;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "hive");
        response.put("timestamp", Instant.now().toString());

        // Check PostgreSQL
        Map<String, Object> postgresStatus = checkPostgres();
        response.put("postgres", postgresStatus);

        // Check Redis
        Map<String, Object> redisStatus = checkRedis();
        response.put("redis", redisStatus);

        // Overall status
        boolean allHealthy = "UP".equals(postgresStatus.get("status")) 
                          && "UP".equals(redisStatus.get("status"));
        response.put("status", allHealthy ? "UP" : "DOWN");

        return allHealthy 
            ? ResponseEntity.ok(response) 
            : ResponseEntity.status(503).body(response);
    }

    private Map<String, Object> checkPostgres() {
        Map<String, Object> status = new LinkedHashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(5);
            status.put("status", valid ? "UP" : "DOWN");
            if (valid) {
                status.put("database", connection.getCatalog());
            }
        } catch (Exception e) {
            status.put("status", "DOWN");
            status.put("error", e.getMessage());
        }
        return status;
    }

    private Map<String, Object> checkRedis() {
        Map<String, Object> status = new LinkedHashMap<>();
        try (var connection = redisConnectionFactory.getConnection()) {
            String pong = connection.ping();
            status.put("status", "PONG".equals(pong) ? "UP" : "DOWN");
        } catch (Exception e) {
            status.put("status", "DOWN");
            status.put("error", e.getMessage());
        }
        return status;
    }

}

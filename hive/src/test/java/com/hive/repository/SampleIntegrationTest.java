package com.hive.repository;

import com.hive.BaseIntegrationTest;
import com.hive.annotation.IntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

 // Sample integration test to verify Testcontainers setup.
@IntegrationTest
@DisplayName("Sample Integration Tests")
class SampleIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Test
    @DisplayName("PostgreSQL container is running and accessible")
    void postgres__Connection__Works() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection.isValid(5)).isTrue();
            assertThat(connection.getCatalog()).isEqualTo("hive_test");
        }
    }

    @Test
    @DisplayName("Redis container is running and accessible")
    void redis__Connection__Works() {
        // Arrange
        String key = "test:integration";
        String value = "Hello from integration test!";

        // Act
        redisTemplate.opsForValue().set(key, value);
        Object retrieved = redisTemplate.opsForValue().get(key);

        // Assert
        assertThat(retrieved).isEqualTo(value);

        // Cleanup
        redisTemplate.delete(key);
    }
}

package com.hive.e2e;

import com.hive.BaseIntegrationTest;
import com.hive.annotation.E2ETest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Sample E2E test to verify API test setup.
 * Replace with actual workflow tests as you build the application.
 */
@E2ETest
@DisplayName("Sample E2E Tests")
class SampleE2ETest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Health endpoint returns UP status")
    void healthEndpoint__WhenCalled__ReturnsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("hive"))
                .andExpect(jsonPath("$.postgres.status").value("UP"))
                .andExpect(jsonPath("$.redis.status").value("UP"));
    }

    @Test
    @DisplayName("Actuator health endpoint is accessible")
    void actuatorHealth__WhenCalled__ReturnsOk() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}

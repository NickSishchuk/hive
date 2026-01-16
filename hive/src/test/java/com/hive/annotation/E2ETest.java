package com.hive.annotation;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a test class as an end-to-end test.
 * E2E tests verify complete user workflows through the API layer.
 * 
 * Usage:
 * <pre>
 * {@code
 * @E2ETest
 * class MatchmakingE2ETest extends BaseIntegrationTest {
 *     @Autowired
 *     private MockMvc mockMvc;
 *     // ...
 * }
 * }
 * </pre>
 * 
 * Run with: mvn test -Dgroups="e2e"
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Tag("e2e")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public @interface E2ETest {
}

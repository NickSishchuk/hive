package com.hive.annotation;

import org.junit.jupiter.api.Tag;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a test class as an integration test.
 * Integration tests use real databases via Testcontainers.
 * 
 * Usage:
 * <pre>
 * {@code
 * @IntegrationTest
 * class MyRepositoryIntegrationTest extends BaseIntegrationTest {
 *     // ...
 * }
 * }
 * </pre>
 * 
 * Run with: mvn test -Dgroups="integration"
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Tag("integration")
@SpringBootTest
@Testcontainers
public @interface IntegrationTest {
}

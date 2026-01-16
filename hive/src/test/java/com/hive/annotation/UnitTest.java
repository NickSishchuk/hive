package com.hive.annotation;

import org.junit.jupiter.api.Tag;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a test class as a unit test.
 * Unit tests are fast, isolated, and mock all dependencies.
 * 
 * Usage:
 * <pre>
 * {@code
 * @UnitTest
 * class MyServiceTest {
 *     // ...
 * }
 * }
 * </pre>
 * 
 * Run with: mvn test -Dgroups="unit"
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Tag("unit")
public @interface UnitTest {
}

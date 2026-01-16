package com.hive.service;

import com.hive.annotation.UnitTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;


@UnitTest
@DisplayName("Sample Unit Tests")
class SampleUnitTest {

    @Test
    @DisplayName("Unit test setup works correctly")
    void unitTestSetup__Always__Works() {
        // Arrange
        int a = 2;
        int b = 3;

        // Act
        int result = a + b;

        // Assert
        assertThat(result).isEqualTo(5);
    }

    @Test
    @DisplayName("AssertJ assertions work correctly")
    void assertJ__StringAssertions__Work() {
        // Arrange
        String hive = "Hive Virtual Coworking";

        // Assert
        assertThat(hive)
                .isNotNull()
                .startsWith("Hive")
                .contains("Virtual")
                .endsWith("Coworking");
    }
}

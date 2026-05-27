package com.hive.session.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class SessionDtos {

    public record StartSessionResponse(
            UUID sessionId,
            UUID roomId,
            LocalDateTime startedAt
    ) {}

    public record EndSessionRequest(
            @NotNull(message = "pomodoroCount is required")
            @Min(value = 0, message = "pomodoroCount cannot be negative")
            Integer pomodoroCount
    ) {}

    public record EndSessionResponse(
            UUID sessionId,
            int durationMinutes,
            int pomodoroCount,
            LocalDateTime startedAt,
            LocalDateTime endedAt
    ) {}

    public record SessionHistoryItem(
            UUID sessionId,
            UUID roomId,
            int durationMinutes,
            int pomodoroCount,
            LocalDateTime startedAt,
            LocalDateTime endedAt
    ) {}

    public record StatsResponse(
            int totalMinutes,
            int totalSessions,
            int streakCurrent,
            int streakMax,
            int todayMinutes,
            int weekMinutes
    ) {}
}

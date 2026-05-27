package com.hive.session;

import com.hive.user.User;
import com.hive.user.UserStats;
import com.hive.user.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserStatsRepository userStatsRepository;

    /**
     * Called after a session is ended. Updates totals and recalculates streak.
     */
    public void recordSession(User user, int durationMinutes, int pomodoroCount) {
        UserStats stats = userStatsRepository.findById(user.getId())
                .orElseGet(() -> UserStats.builder().user(user).build());

        stats.setTotalMinutes(stats.getTotalMinutes() + durationMinutes);
        stats.setTotalSessions(stats.getTotalSessions() + 1);

        recalculateStreak(stats);

        userStatsRepository.save(stats);
    }

    private void recalculateStreak(UserStats stats) {
        LocalDate today = LocalDate.now();
        LocalDate last = stats.getLastActiveDate();

        if (last == null) {
            // First ever session
            stats.setStreakCurrent(1);
        } else if (last.equals(today)) {
            // Already counted today — no change
            return;
        } else if (last.equals(today.minusDays(1))) {
            // Consecutive day
            stats.setStreakCurrent(stats.getStreakCurrent() + 1);
        } else {
            // Gap — reset
            stats.setStreakCurrent(1);
        }

        stats.setLastActiveDate(today);

        if (stats.getStreakCurrent() > stats.getStreakMax()) {
            stats.setStreakMax(stats.getStreakCurrent());
        }
    }
}

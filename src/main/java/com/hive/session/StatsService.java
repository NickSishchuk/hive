package com.hive.session;

import com.hive.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatsService {
	private final UserStatsRepository userStatsRepository;

	public void recordSession(User user, int durationMinutes, int pomodoroCount) {
		UserStats stats = userStatsRepository.findById(user.getId()).orElseGet(() -> UserStats.builder().user(user).build());
		stats.setTotalMinutes(stats.getTotalMinutes() + durationMinutes);
		stats.setTotalSessions(stats.getTotalSessions() + 1);
		recalculateStreak(stats);
		userStatsRepository.save(stats);
	}

	private void recalculateStreak(UserStats stats) {
		LocalDate today = LocalDate.now();
		LocalDate last = stats.getLastActiveDate();
		if (last == null) {
			stats.setStreakCurrent(1);
		} else if (last.equals(today)) {
			return;
		} else if (last.equals(today.minusDays(1))) {
			stats.setStreakCurrent(stats.getStreakCurrent() + 1);
		} else {
			stats.setStreakCurrent(1);
		}
		stats.setLastActiveDate(today);
		if (stats.getStreakCurrent() > stats.getStreakMax()) stats.setStreakMax(stats.getStreakCurrent());
	}
}

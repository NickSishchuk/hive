package com.hive.session;

import com.hive.badge.BadgeRepository;
import com.hive.badge.UserBadge;
import com.hive.badge.UserBadgeRepository;
import com.hive.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StatsService {
	private final UserStatsRepository userStatsRepository;
	private final BadgeRepository badgeRepository;
	private final UserBadgeRepository userBadgeRepository;

	public void recordSession(User user, int durationMinutes, int pomodoroCount) {
		UserStats stats = userStatsRepository.findById(user.getId()).orElseGet(() -> UserStats.builder().user(user).build());
		boolean isFirstSession = stats.getTotalSessions() == 0;
		stats.setTotalMinutes(stats.getTotalMinutes() + durationMinutes);
		stats.setTotalSessions(stats.getTotalSessions() + 1);
		recalculateStreak(stats);
		userStatsRepository.save(stats);

		if (isFirstSession && pomodoroCount > 0) {
			System.out.println("DEBUG: Awarding first session badge for user " + user.getId() + " with pomodoroCount=" + pomodoroCount);
			awardFirstSessionBadge(user);
		} else {
			System.out.println("DEBUG: Badge conditions not met - isFirstSession=" + isFirstSession + ", pomodoroCount=" + pomodoroCount);
		}
	}

	private void awardFirstSessionBadge(User user) {
		var badge = badgeRepository.findByKey("first_session").orElse(null);
		if (badge != null && !userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
			var userBadge = UserBadge.builder()
					.userId(user.getId())
					.badgeId(badge.getId())
					.build();
			userBadgeRepository.save(userBadge);
		}
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

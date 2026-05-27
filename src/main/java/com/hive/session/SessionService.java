package com.hive.session;

import com.hive.common.exception.ResourceNotFoundException;
import com.hive.room.MatchmakingService;
import com.hive.session.dto.SessionDtos.*;
import com.hive.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {
	private final SessionRepository sessionRepository;
	private final UserStatsRepository userStatsRepository;
	private final StatsService statsService;
	private final MatchmakingService matchmakingService;

	@Transactional
	public StartSessionResponse startSession(User user) {
		if (sessionRepository.existsByUserAndEndedAtIsNull(user))
			throw new IllegalStateException("You already have an active session");
		var room = matchmakingService.findOrCreateRoom(user);
		var session = sessionRepository.save(Session.builder().user(user).room(room).startedAt(LocalDateTime.now()).build());
		return new StartSessionResponse(session.getId(), room.getId(), session.getStartedAt());
	}

	@Transactional
	public EndSessionResponse endSession(UUID sessionId, User user, EndSessionRequest request) {
		Session session = sessionRepository.findByIdAndUser(sessionId, user)
				.orElseThrow(() -> new ResourceNotFoundException("Session not found"));
		if (!session.isActive()) throw new IllegalStateException("Session is already ended");
		LocalDateTime now = LocalDateTime.now();
		int duration = (int) ChronoUnit.MINUTES.between(session.getStartedAt(), now);
		session.setEndedAt(now);
		session.setDurationMinutes(Math.max(duration, 1));
		session.setPomodoroCount(request.pomodoroCount());
		sessionRepository.save(session);
		statsService.recordSession(user, session.getDurationMinutes(), session.getPomodoroCount());
		return new EndSessionResponse(session.getId(), session.getDurationMinutes(), session.getPomodoroCount(), session.getStartedAt(), session.getEndedAt());
	}

	@Transactional(readOnly = true)
	public List<SessionHistoryItem> getHistory(User user) {
		return sessionRepository.findByUserOrderByStartedAtDesc(user).stream()
				.map(s -> new SessionHistoryItem(s.getId(), s.getRoom().getId(), s.getDurationMinutes(), s.getPomodoroCount(), s.getStartedAt(), s.getEndedAt()))
				.toList();
	}

	@Transactional(readOnly = true)
	public StatsResponse getStats(User user) {
		UserStats stats = userStatsRepository.findById(user.getId()).orElseGet(() -> UserStats.builder().user(user).build());
		int todayMinutes = sessionRepository.sumMinutesByUserSince(user, LocalDateTime.now().toLocalDate().atStartOfDay());
		int weekMinutes = sessionRepository.sumMinutesByUserSince(user, LocalDateTime.now().minusDays(7));
		return new StatsResponse(stats.getTotalMinutes(), stats.getTotalSessions(), stats.getStreakCurrent(), stats.getStreakMax(), todayMinutes, weekMinutes);
	}
}

package com.hive.session;

import com.hive.room.Room;
import com.hive.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "room_id", nullable = false)
	private Room room;
	@Column(name = "started_at", nullable = false)
	private Instant startedAt;
	@Column(name = "ended_at")
	private Instant endedAt;
	@Column(name = "duration_minutes")
	private int durationMinutes;
	@Column(name = "pomodoro_count")
	private int pomodoroCount;

	public boolean isActive() {
		return endedAt == null;
	}
}

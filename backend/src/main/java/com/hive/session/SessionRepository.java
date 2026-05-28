package com.hive.session;
import com.hive.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.*;
public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByUserOrderByStartedAtDesc(User user);
    Optional<Session> findByIdAndUser(UUID id, User user);
    boolean existsByUserAndEndedAtIsNull(User user);
    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM Session s WHERE s.user = :user AND s.startedAt >= :from AND s.endedAt IS NOT NULL")
    int sumMinutesByUserSince(User user, LocalDateTime from);
}

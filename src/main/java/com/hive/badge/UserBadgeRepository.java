package com.hive.badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;
public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadge.UserBadgeId> {
    List<UserBadge> findByUserId(UUID userId);
    boolean existsByUserIdAndBadgeId(UUID userId, UUID badgeId);
    @Query("SELECT COUNT(ub) > 0 FROM UserBadge ub JOIN ub.badge b WHERE ub.userId = :userId AND b.key IN :keys")
    boolean hasAnyBadge(UUID userId, Set<String> keys);
    @Query("""
            SELECT COUNT(s.user) FROM Session s
            JOIN UserBadge ub ON ub.userId = s.user.id
            JOIN ub.badge b
            WHERE s.room.id = :roomId AND s.endedAt IS NULL AND b.key IN :keys
            """)
    long countExperiencedInRoom(UUID roomId, Set<String> keys);
}

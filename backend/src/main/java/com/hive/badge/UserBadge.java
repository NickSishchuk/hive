package com.hive.badge;
import com.hive.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity @Table(name = "user_badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@IdClass(UserBadge.UserBadgeId.class)
public class UserBadge {
    @Id @Column(name = "user_id") private UUID userId;
    @Id @Column(name = "badge_id") private UUID badgeId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", insertable = false, updatable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "badge_id", insertable = false, updatable = false) private Badge badge;
    @Column(name = "earned_at") private LocalDateTime earnedAt;
    @PrePersist protected void onCreate() { earnedAt = LocalDateTime.now(); }
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class UserBadgeId implements Serializable {
        private UUID userId;
        private UUID badgeId;
    }
}

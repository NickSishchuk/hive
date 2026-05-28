package com.hive.user;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;
@Entity @Table(name = "user_stats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserStats {
    @Id @Column(name = "user_id") private UUID userId;
    @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "user_id") private User user;
    @Column(name = "total_minutes") private int totalMinutes;
    @Column(name = "total_sessions") private int totalSessions;
    @Column(name = "streak_current") private int streakCurrent;
    @Column(name = "streak_max") private int streakMax;
    @Column(name = "last_active_date") private LocalDate lastActiveDate;
}

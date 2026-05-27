package com.hive.badge;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
@Entity @Table(name = "badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Badge {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, unique = true, length = 50) private String key;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false) private String description;
    @Column(nullable = false, length = 10) private String icon;
}

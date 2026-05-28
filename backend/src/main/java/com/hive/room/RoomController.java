package com.hive.room;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.hive.session.SessionRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Room and session management")
@SecurityRequirement(name = "bearerAuth")
public class RoomController {
    private final SessionRepository sessionRepository;

    @GetMapping("/online-count")
    @Operation(summary = "Get count of currently active sessions")
    public Map<String, Long> onlineCount() {
        return Map.of("count", sessionRepository.countActiveSessions());
    }
}

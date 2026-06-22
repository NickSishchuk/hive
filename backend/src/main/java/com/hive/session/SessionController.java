package com.hive.session;
import com.hive.session.dto.SessionDtos.*;
import com.hive.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/sessions") @RequiredArgsConstructor
@Tag(name = "Sessions", description = "Work session lifecycle") @SecurityRequirement(name = "bearerAuth")
public class SessionController {
    private final SessionService sessionService;
    @PostMapping("/start") @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Start a new work session")
    public StartSessionResponse start(@AuthenticationPrincipal User user) { return sessionService.startSession(user); }
    @PatchMapping("/{id}/end") @Operation(summary = "End a session and save Pomodoro count")
    public EndSessionResponse end(@PathVariable UUID id, @AuthenticationPrincipal User user, @Valid @RequestBody EndSessionRequest request) { return sessionService.endSession(id, user, request); }
    @PatchMapping("/{id}/pomodoro") @Operation(summary = "Update Pomodoro count for an active session")
    public void updatePomodoro(@PathVariable UUID id, @AuthenticationPrincipal User user, @Valid @RequestBody UpdatePomodoroRequest request) { sessionService.updatePomodoroCount(id, user, request); }
    @GetMapping("/history") @Operation(summary = "Get session history for current user")
    public List<SessionHistoryItem> history(@AuthenticationPrincipal User user) { return sessionService.getHistory(user); }
}

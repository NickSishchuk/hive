package com.hive.user;
import com.hive.auth.dto.AuthDtos.UserDto;
import com.hive.session.SessionService;
import com.hive.session.dto.SessionDtos.StatsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and statistics")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final SessionService sessionService;
    @GetMapping("/me") @Operation(summary = "Get current user profile")
    public UserDto me(@AuthenticationPrincipal User user) {
        return new UserDto(user.getId().toString(), user.getEmail(), user.getName());
    }
    @GetMapping("/me/stats") @Operation(summary = "Get current user statistics and streaks")
    public StatsResponse stats(@AuthenticationPrincipal User user) { return sessionService.getStats(user); }
}

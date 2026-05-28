package com.hive.auth;
import com.hive.auth.dto.AuthDtos.*;
import com.hive.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
@Tag(name = "Auth", description = "Registration, login, token refresh and logout")
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) @Operation(summary = "Register a new user")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) { return authService.register(request); }
    @PostMapping("/login") @Operation(summary = "Login and receive tokens")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) { return authService.login(request); }
    @PostMapping("/refresh") @Operation(summary = "Refresh access token")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) { return authService.refresh(request); }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Invalidate refresh token")
    public void logout(@Valid @RequestBody RefreshRequest request) { authService.logout(request); }
    @PatchMapping("/change-password") @ResponseStatus(HttpStatus.NO_CONTENT) @Operation(summary = "Change current user password") @SecurityRequirement(name = "bearerAuth")
    public void changePassword(@AuthenticationPrincipal User user, @Valid @RequestBody ChangePasswordRequest request) { authService.changePassword(user, request); }
}

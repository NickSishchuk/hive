package com.hive.auth.dto;
import jakarta.validation.constraints.*;
public class AuthDtos {
    public record RegisterRequest(@Email(message="Invalid email") @NotBlank String email, @NotBlank @Size(min=2,max=100) String name, @NotBlank @Size(min=8) String password) {}
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record RefreshRequest(@NotBlank String refreshToken) {}
    public record AuthResponse(String accessToken, String refreshToken, UserDto user) {}
    public record UserDto(String id, String email, String name) {}
}

package com.hive.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @Email(message = "Invalid email")
            @NotBlank(message = "Email is required")
            String email,

            @NotBlank(message = "Name is required")
            @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
            String name,

            @NotBlank(message = "Password is required")
            @Size(min = 8, message = "Password must be at least 8 characters")
            String password
    ) {}

    public record LoginRequest(
            @Email(message = "Invalid email")
            @NotBlank(message = "Email is required")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record RefreshRequest(
            @NotBlank(message = "Refresh token is required")
            String refreshToken
    ) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            UserDto user
    ) {}

    public record UserDto(
            String id,
            String email,
            String name
    ) {}
}

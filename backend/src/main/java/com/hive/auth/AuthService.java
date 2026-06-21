package com.hive.auth;

import com.hive.auth.dto.AuthDtos.*;
import com.hive.common.config.JwtProperties;
import com.hive.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final UserStatsRepository userStatsRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtService jwtService;
	private final PasswordEncoder passwordEncoder;
	private final JwtProperties jwtProperties;

	@Transactional
	public AuthResponse register(RegisterRequest request) {
		try {
			log.info("Starting registration for email: {}", request.email());
			if (userRepository.existsByEmail(request.email())) throw new IllegalStateException("Email already in use");
			log.info("Email check passed, creating user");
			User user = userRepository.save(User.builder().email(request.email()).name(request.name()).passwordHash(passwordEncoder.encode(request.password())).build());
			log.info("User saved: {}", user.getId());
			userStatsRepository.save(UserStats.builder().user(user).build());
			log.info("UserStats saved");
			return buildAuthResponse(user);
		} catch (Exception e) {
			log.error("Registration failed", e);
			throw e;
		}
	}

	@Transactional
	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new IllegalStateException("Invalid email or password"));
		if (!passwordEncoder.matches(request.password(), user.getPasswordHash()))
			throw new IllegalStateException("Invalid email or password");
		return buildAuthResponse(user);
	}

	@Transactional
	public AuthResponse refresh(RefreshRequest request) {
		RefreshToken stored = refreshTokenRepository.findByToken(request.refreshToken()).orElseThrow(() -> new IllegalStateException("Invalid refresh token"));
		if (stored.isExpired()) {
			refreshTokenRepository.delete(stored);
			throw new IllegalStateException("Refresh token expired, please log in again");
		}
		User user = stored.getUser();
		refreshTokenRepository.delete(stored);
		return buildAuthResponse(user);
	}

	@Transactional
	public void logout(RefreshRequest request) {
		refreshTokenRepository.findByToken(request.refreshToken()).ifPresent(refreshTokenRepository::delete);
	}

	@Transactional
	public void changePassword(User user, ChangePasswordRequest request) {
		if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash()))
			throw new IllegalStateException("Current password is incorrect");
		user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
		userRepository.save(user);
	}

	private AuthResponse buildAuthResponse(User user) {
		String accessToken = jwtService.generateAccessToken(user);
		String rawRefresh = jwtService.generateRefreshToken();
		refreshTokenRepository.save(RefreshToken.builder().user(user).token(rawRefresh).expiresAt(LocalDateTime.now().plusDays(jwtProperties.getRefreshTokenExpirationDays())).build());
		return new AuthResponse(accessToken, rawRefresh, new UserDto(user.getId().toString(), user.getEmail(), user.getName()));
	}
}

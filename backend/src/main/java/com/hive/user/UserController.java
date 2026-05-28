package com.hive.user;

import com.hive.auth.dto.AuthDtos.UserDto;
import com.hive.session.SessionService;
import com.hive.session.dto.SessionDtos.StatsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and statistics")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

	private final SessionService sessionService;
	private final UserRepository userRepository;

	@GetMapping("/me")
	@Operation(summary = "Get current user profile")
	public UserDto me(@AuthenticationPrincipal User user) {
		return new UserDto(user.getId().toString(), user.getEmail(), user.getName());
	}

	@PatchMapping("/me")
	@Operation(summary = "Update current user profile")
	public UserDto updateMe(@AuthenticationPrincipal User user,
							@Valid @RequestBody UpdateMeRequest request) {
		if (request.name() != null) user.setName(request.name());
		if (request.email() != null) user.setEmail(request.email());
		User saved = userRepository.save(user);
		return new UserDto(saved.getId().toString(), saved.getEmail(), saved.getName());
	}

	@GetMapping("/me/stats")
	@Operation(summary = "Get current user statistics and streaks")
	public StatsResponse stats(@AuthenticationPrincipal User user) {
		return sessionService.getStats(user);
	}

	@DeleteMapping("/me")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	@Operation(summary = "Delete current user account")
	public void deleteMe(@AuthenticationPrincipal User user) {
		userRepository.delete(user);
	}

	public record UpdateMeRequest(
			@Email(message = "Invalid email") String email,
			@Size(min = 2, max = 100, message = "Name must be 2-100 characters") String name
	) {}
}
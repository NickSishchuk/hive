package com.hive.badge;

import com.hive.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/me/badges")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "User achievements")
@SecurityRequirement(name = "bearerAuth")
public class BadgeController {

	private final BadgeRepository badgeRepository;
	private final UserBadgeRepository userBadgeRepository;

	@GetMapping
	@Operation(summary = "Get all badges with earned status for current user")
	public List<BadgeResponse> myBadges(@AuthenticationPrincipal User user) {
		Set<UUID> earnedIds = userBadgeRepository.findByUserId(user.getId())
				.stream()
				.map(UserBadge::getBadgeId)
				.collect(Collectors.toSet());

		return badgeRepository.findAll().stream()
				.map(b -> new BadgeResponse(
						b.getId(),
						b.getKey(),
						b.getName(),
						b.getDescription(),
						b.getIcon(),
						earnedIds.contains(b.getId())
				))
				.toList();
	}

	public record BadgeResponse(
			UUID id,
			String key,
			String name,
			String description,
			String icon,
			boolean earned
	) {}
}
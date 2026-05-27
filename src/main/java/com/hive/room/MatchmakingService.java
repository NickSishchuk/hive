package com.hive.room;

import com.hive.badge.UserBadgeRepository;
import com.hive.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchmakingService {
	private static final Set<String> EXPERIENCED_BADGE_KEYS = Set.of("streak_7", "streak_30", "marathon", "century");
	private static final int MAX_EXPERIENCED_PER_ROOM = 2;
	private final RoomRepository roomRepository;
	private final UserBadgeRepository userBadgeRepository;

	@Transactional
	public Room findOrCreateRoom(User user) {
		boolean isExperienced = userBadgeRepository.hasAnyBadge(user.getId(), EXPERIENCED_BADGE_KEYS);
		for (Room candidate : roomRepository.findRoomsWithSpaceForUpdate()) {
			if (isCompatible(candidate, isExperienced)) {
				log.debug("Matchmaking: user {} -> existing room {}", user.getId(), candidate.getId());
				return candidate;
			}
		}
		Room newRoom = roomRepository.save(new Room());
		log.debug("Matchmaking: user {} -> new room {}", user.getId(), newRoom.getId());
		return newRoom;
	}

	private boolean isCompatible(Room room, boolean userIsExperienced) {
		if (!userIsExperienced) return true;
		return userBadgeRepository.countExperiencedInRoom(room.getId(), EXPERIENCED_BADGE_KEYS) < MAX_EXPERIENCED_PER_ROOM;
	}
}

package com.hive.room;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			SELECT r FROM Room r
			WHERE (SELECT COUNT(s) FROM Session s WHERE s.room = r AND s.endedAt IS NULL) < 10
			ORDER BY (SELECT COUNT(s) FROM Session s WHERE s.room = r AND s.endedAt IS NULL) DESC
			""")
	List<Room> findRoomsWithSpaceForUpdate();
}

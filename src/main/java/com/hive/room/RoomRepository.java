package com.hive.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    /**
     * Rooms with active sessions (ended_at IS NULL), grouped by occupancy.
     * Used by matchmaking in Phase 5 — already wired here.
     */
    @Query("""
            SELECT r FROM Room r
            WHERE (SELECT COUNT(s) FROM Session s
                   WHERE s.room = r AND s.endedAt IS NULL) < 10
            ORDER BY (SELECT COUNT(s) FROM Session s
                      WHERE s.room = r AND s.endedAt IS NULL) DESC
            """)
    List<Room> findRoomsWithSpace();
}

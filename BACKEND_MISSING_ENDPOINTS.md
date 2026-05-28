# Backend — Missing Endpoints & Required Changes

Current status of the frontend: all pages are built and wired to the API.
This file describes what the backend still needs to implement for full functionality.

---

## [PRIORITY 1] LiveKit Integration — modify `startSession`

The frontend's `POST /api/sessions/start` exists and works, but the browser
needs a LiveKit token to join the video room. Without this, the room page loads
but shows no video.

### 1. Add the Maven dependency

In `pom.xml`:
```xml
<dependency>
    <groupId>io.livekit</groupId>
    <artifactId>livekit-server</artifactId>
    <version>0.6.1</version>
</dependency>
```

### 2. Add LiveKit config properties

In `application.yml`:
```yaml
livekit:
  url:        ${LIVEKIT_URL:https://your-project.livekit.cloud}
  api-key:    ${LIVEKIT_API_KEY:your_api_key}
  api-secret: ${LIVEKIT_API_SECRET:your_api_secret}
  ws-url:     ${LIVEKIT_WS_URL:wss://your-project.livekit.cloud}
```

Add a properties class (`com.hive.common.config.LiveKitProperties`):
```java
@Getter @Setter @Component
@ConfigurationProperties(prefix = "livekit")
public class LiveKitProperties {
    private String url;
    private String apiKey;
    private String apiSecret;
    private String wsUrl;
}
```

### 3. Update `StartSessionResponse`

In `SessionDtos.java`, add two fields:
```java
public record StartSessionResponse(
    UUID sessionId,
    UUID roomId,
    LocalDateTime startedAt,
    String livekitToken,   // JWT the browser uses to join the LiveKit room
    String livekitUrl      // wss://... URL the browser connects to
) {}
```

### 4. Update `SessionService.startSession()`

```java
import io.livekit.server.AccessToken;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;

@Service @RequiredArgsConstructor
public class SessionService {

    // add to existing fields:
    private final LiveKitProperties livekitProperties;

    @Transactional
    public StartSessionResponse startSession(User user) {
        if (sessionRepository.existsByUserAndEndedAtIsNull(user))
            throw new IllegalStateException("You already have an active session");

        var room    = matchmakingService.findOrCreateRoom(user);
        var session = sessionRepository.save(
            Session.builder()
                .user(user)
                .room(room)
                .startedAt(LocalDateTime.now())
                .build()
        );

        String livekitToken = generateLiveKitToken(user, room.getId());

        return new StartSessionResponse(
            session.getId(),
            room.getId(),
            session.getStartedAt(),
            livekitToken,
            livekitProperties.getWsUrl()
        );
    }

    private String generateLiveKitToken(User user, UUID roomId) {
        try {
            AccessToken token = new AccessToken(
                livekitProperties.getApiKey(),
                livekitProperties.getApiSecret()
            );
            token.setName(user.getName());
            token.setIdentity(user.getId().toString());
            token.addGrants(new RoomJoin(true), new RoomName(roomId.toString()));
            return token.toJwt();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate LiveKit token", e);
        }
    }
}
```

---

## [PRIORITY 2] `PATCH /api/auth/change-password`

**Where it's used:** Settings page → "Змінити пароль" button opens a modal with
three fields (current password, new password, confirm). The modal is fully built;
it just gets a 404 right now.

**Frontend calls:** `PATCH /api/auth/change-password`

**Request body:**
```json
{ "currentPassword": "string", "newPassword": "string" }
```

**Validation:**
- `currentPassword` must match the stored hash — return `409` with a readable
  message if it doesn't (the modal displays this message to the user)
- `newPassword`: `@NotBlank`, `@Size(min = 8)`

**Success response:** `204 No Content`

**Suggested implementation** (add to `AuthController`):
```java
@PatchMapping("/change-password")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void changePassword(
    @AuthenticationPrincipal User user,
    @Valid @RequestBody ChangePasswordRequest request
) {
    if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash()))
        throw new IllegalStateException("Current password is incorrect");
    user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    userRepository.save(user);
}

public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 8) String newPassword
) {}
```

Inject `UserRepository` into `AuthController`, or move logic into `AuthService`.

---

## [PRIORITY 3] `DELETE /api/users/me`

**Where it's used:** Settings page → "Видалити акаунт" opens a confirmation modal
with a red "Видалити" button. The modal is fully built; clicking confirm gets a 404.
On success, the frontend logs the user out and redirects to `/`.

**Frontend calls:** `DELETE /api/users/me`

**Request body:** none

**Success response:** `204 No Content`

**Note:** No migration needed. `V1__init_schema.sql` already defines
`ON DELETE CASCADE` on all child tables (`sessions`, `refresh_tokens`,
`user_stats`, `user_badges`), so deleting the `User` row is sufficient.

**Suggested implementation** (add to `UserController`):
```java
@DeleteMapping("/me")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteMe(@AuthenticationPrincipal User user) {
    userRepository.delete(user);
}
```

---

## [PRIORITY 4] `GET /api/rooms/online-count`

**Where it's used:** Home page shows "Зараз працюють — 247 онлайн".
The `247` is currently hardcoded. This endpoint would make it real.

**Frontend calls:** `GET /api/rooms/online-count`

**Success response:**
```json
{ "count": 12 }
```

**Step 1** — add to `SessionRepository`:
```java
@Query("SELECT COUNT(s) FROM Session s WHERE s.endedAt IS NULL")
long countActiveSessions();
```

**Step 2** — new controller:
```java
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms")
@SecurityRequirement(name = "bearerAuth")
public class RoomController {
    private final SessionRepository sessionRepository;

    @GetMapping("/online-count")
    public Map<String, Long> onlineCount() {
        return Map.of("count", sessionRepository.countActiveSessions());
    }
}
```

**Frontend wiring** (once endpoint exists) — in `src/api/session.js` add:
```js
export const getOnlineCount = () =>
  client.get('/rooms/online-count').then((r) => r.data.count)
```
Then in `HomePage.jsx`, replace the hardcoded `247` with a `useQuery` for this.

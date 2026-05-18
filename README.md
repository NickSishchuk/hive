# 🐝 Hive — Virtual Coworking Backend

Spring Boot + PostgreSQL backend for the Hive virtual coworking platform.

## Stack

- Java 21
- Spring Boot 3.4.5
- Spring Security + JWT (jjwt 0.12.6)
- Spring Data JPA + Hibernate
- PostgreSQL 16
- Flyway (migrations)
- Lombok

---

## Getting started

### 1. Start the database

```bash
docker compose up -d
```

PostgreSQL will be available at `localhost:5432`.  
pgAdmin at `http://localhost:5050` (admin@hive.local / admin).

### 2. Run the app

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Or from your IDE — set the active profile to `dev`.

### 3. Check it's running

```
GET http://localhost:8080/api/health
```

Expected response:
```json
{ "status": "UP", "app": "Hive" }
```

---

## Database migrations

Flyway runs automatically on startup. Migration files live in:

```
src/main/resources/db/migration/
  V1__init_schema.sql   — full schema
  V2__seed_badges.sql   — default badges
```

---

## Project structure

```
com.hive
├── HiveApplication.java
├── common/
│   ├── HealthController.java
│   ├── config/
│   │   ├── JwtProperties.java
│   │   └── SecurityConfig.java       ← temporary (permits all), replaced in Phase 3
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── ResourceNotFoundException.java
├── auth/       ← Phase 3
├── user/       ← Phase 4
├── room/       ← Phase 5
├── session/    ← Phase 4
└── badge/      ← Phase 6
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `hive` | Database name |
| `DB_USER` | `hive` | DB username |
| `DB_PASSWORD` | `hive` | DB password |
| `JWT_SECRET` | `your-256-bit-secret-...` | **Change in production** |

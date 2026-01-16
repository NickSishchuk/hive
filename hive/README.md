# Hive - Virtual Coworking Platform

A virtual coworking platform for productivity based on the "body doubling" effect.

## Tech Stack

- **Java 21** - LTS version
- **Spring Boot 3.4** - Web framework
- **Spring Data JPA** - Hibernate ORM
- **Spring Data Redis** - Redis connectivity
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching & session store

## Project Structure

```
hive/
├── src/main/java/com/hive/
│   ├── HiveApplication.java        # Main entry point
│   ├── config/
│   │   └── RedisConfig.java        # Redis configuration
│   └── controller/
│       └── HealthController.java   # Custom health endpoint
├── src/main/resources/
│   ├── application.yml             # Main configuration
│   └── application-docker.yml      # Docker-specific config
├── pom.xml                         # Maven dependencies
├── Dockerfile                      # Multi-stage build
└── docker-compose.yml              # Container orchestration
```

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- **hive-app** on `http://localhost:8080`
- **PostgreSQL** on `localhost:15432`
- **Redis** on `localhost:16379`

### Health Check Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Custom health check (Postgres + Redis status) |
| `GET /actuator/health` | Spring Actuator health check |

#### Example Response (`/api/health`)

```json
{
  "service": "hive",
  "timestamp": "2025-01-15T10:30:00Z",
  "postgres": {
    "status": "UP",
    "database": "hive"
  },
  "redis": {
    "status": "UP"
  },
  "status": "UP"
}
```

## Development

### Local Development (without Docker)

1. Start PostgreSQL and Redis locally
2. Update `application.yml` with your connection settings
3. Run the application:

```bash
mvn spring-boot:run
```

### Building

```bash
# Compile
mvn clean compile

# Package (creates JAR)
mvn clean package

# Skip tests
mvn clean package -DskipTests
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | - | Set to `docker` for containerized env |
| `SPRING_DATASOURCE_URL` | see yml | PostgreSQL connection URL |
| `SPRING_DATA_REDIS_HOST` | localhost | Redis host |

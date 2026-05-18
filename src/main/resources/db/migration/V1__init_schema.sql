-- V1: Initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token      VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP   NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    room_id          UUID      NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    started_at       TIMESTAMP NOT NULL,
    ended_at         TIMESTAMP,
    duration_minutes INT DEFAULT 0,
    pomodoro_count   INT DEFAULT 0
);

CREATE TABLE user_stats (
    user_id          UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    total_minutes    INT  DEFAULT 0,
    total_sessions   INT  DEFAULT 0,
    streak_current   INT  DEFAULT 0,
    streak_max       INT  DEFAULT 0,
    last_active_date DATE
);

CREATE TABLE badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon        VARCHAR(10)  NOT NULL
);

CREATE TABLE user_badges (
    user_id   UUID REFERENCES users (id) ON DELETE CASCADE,
    badge_id  UUID REFERENCES badges (id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_sessions_user_id    ON sessions (user_id);
CREATE INDEX idx_sessions_started_at ON sessions (started_at);
CREATE INDEX idx_sessions_ended_at   ON sessions (ended_at);
CREATE INDEX idx_sessions_room_id    ON sessions (room_id);
CREATE INDEX idx_user_badges_user_id ON user_badges (user_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

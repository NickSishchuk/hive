-- Convert session timestamps to timezone-aware timestamps (Instant)
ALTER TABLE sessions
  ALTER COLUMN started_at TYPE TIMESTAMPTZ,
  ALTER COLUMN ended_at TYPE TIMESTAMPTZ;

ALTER TABLE user_badges
  ALTER COLUMN earned_at TYPE TIMESTAMPTZ;

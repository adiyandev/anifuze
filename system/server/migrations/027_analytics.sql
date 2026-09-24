CREATE TABLE IF NOT EXISTS af_analytics_events (
 id VARCHAR(128) PRIMARY KEY,
 event_type VARCHAR(64) NOT NULL,
 user_id VARCHAR(128),
 anime_id VARCHAR(128),
 episode_id VARCHAR(128),
 session_id VARCHAR(128),
 path TEXT,
 referrer TEXT,
 device_type VARCHAR(32),
 browser VARCHAR(64),
 country VARCHAR(8),
 duration_seconds INTEGER,
 created_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS af_analytics_events_created_idx ON af_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS af_analytics_events_type_idx ON af_analytics_events(event_type,created_at);
CREATE INDEX IF NOT EXISTS af_analytics_events_anime_idx ON af_analytics_events(anime_id,created_at);
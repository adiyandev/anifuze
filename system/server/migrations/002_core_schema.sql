CREATE TABLE IF NOT EXISTS af_users (
  id VARCHAR(128) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL,
  last_active_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS af_admin_2fa (
  admin_user_id VARCHAR(128) PRIMARY KEY,
  totp_secret TEXT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  recovery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_admin_recovery_codes (
  id VARCHAR(128) PRIMARY KEY,
  admin_user_id VARCHAR(128) NOT NULL,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_anime (
  id VARCHAR(128) PRIMARY KEY,
  provider_id VARCHAR(128) NOT NULL,
  provider_external_id VARCHAR(128) NOT NULL,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(32) NULL,
  status VARCHAR(32) NULL,
  description TEXT NULL,
  cover_url TEXT NULL,
  banner_url TEXT NULL,
  score DECIMAL(5,2) NULL,
  year INTEGER NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(provider_id, provider_external_id)
);

CREATE TABLE IF NOT EXISTS af_anime_overrides (
  anime_id VARCHAR(128) PRIMARY KEY,
  title_override VARCHAR(500) NULL,
  description_override TEXT NULL,
  cover_url_override TEXT NULL,
  banner_url_override TEXT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_episodes (
  id VARCHAR(128) PRIMARY KEY,
  anime_id VARCHAR(128) NOT NULL,
  provider_external_id VARCHAR(128) NOT NULL,
  episode_number DECIMAL(8,2) NOT NULL,
  title VARCHAR(500) NULL,
  description TEXT NULL,
  thumbnail_url TEXT NULL,
  air_date TIMESTAMP NULL,
  duration_seconds INTEGER NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_episode_overrides (
  episode_id VARCHAR(128) PRIMARY KEY,
  title_override VARCHAR(500) NULL,
  description_override TEXT NULL,
  thumbnail_url_override TEXT NULL,
  sort_order_override INTEGER NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_genres (
  id VARCHAR(128) PRIMARY KEY,
  provider_external_id VARCHAR(128) NULL,
  name VARCHAR(150) NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  synced_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS af_providers (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(32) NOT NULL,
  base_url TEXT NULL,
  config_json TEXT NULL,
  credentials_encrypted TEXT NULL,
  priority INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(32) NOT NULL DEFAULT 'Offline',
  latency_ms INTEGER NULL,
  request_count BIGINT NOT NULL DEFAULT 0,
  error_count BIGINT NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_provider_sources (
  id VARCHAR(128) PRIMARY KEY,
  provider_id VARCHAR(128) NOT NULL,
  anime_id VARCHAR(128) NULL,
  episode_id VARCHAR(128) NULL,
  external_id VARCHAR(255) NULL,
  source_type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Available',
  metadata_json TEXT NULL,
  last_checked_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS af_watch_history (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  anime_id VARCHAR(128) NOT NULL,
  episode_id VARCHAR(128) NULL,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  watched_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_favorites (
  user_id VARCHAR(128) NOT NULL,
  anime_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY(user_id, anime_id)
);

CREATE TABLE IF NOT EXISTS af_watchlists (
  user_id VARCHAR(128) NOT NULL,
  anime_id VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  PRIMARY KEY(user_id, anime_id)
);

CREATE TABLE IF NOT EXISTS af_comments (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  anime_id VARCHAR(128) NULL,
  episode_id VARCHAR(128) NULL,
  body TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'visible',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_reports (
  id VARCHAR(128) PRIMARY KEY,
  reporter_user_id VARCHAR(128) NULL,
  target_type VARCHAR(32) NOT NULL,
  target_id VARCHAR(128) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS af_notifications (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL,
  audience VARCHAR(64) NOT NULL,
  scheduled_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_analytics (
  id VARCHAR(128) PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  user_id VARCHAR(128) NULL,
  anime_id VARCHAR(128) NULL,
  episode_id VARCHAR(128) NULL,
  provider_id VARCHAR(128) NULL,
  occurred_at TIMESTAMP NOT NULL,
  metadata_json TEXT NULL
);

CREATE TABLE IF NOT EXISTS af_audit_logs (
  id VARCHAR(128) PRIMARY KEY,
  admin_user_id VARCHAR(128) NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(64) NULL,
  target_id VARCHAR(128) NULL,
  ip_address VARCHAR(64) NULL,
  user_agent TEXT NULL,
  before_json TEXT NULL,
  after_json TEXT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_cache (
  cache_key VARCHAR(500) PRIMARY KEY,
  value_text TEXT NOT NULL,
  expires_at TIMESTAMP NULL,
  stale_since TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_email_settings (
  id INTEGER PRIMARY KEY,
  host VARCHAR(255) NULL,
  port INTEGER NULL,
  username VARCHAR(320) NULL,
  password_encrypted TEXT NULL,
  encryption VARCHAR(32) NULL,
  from_name VARCHAR(255) NULL,
  from_email VARCHAR(320) NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_oauth_settings (
  provider VARCHAR(64) PRIMARY KEY,
  client_id TEXT NULL,
  client_secret_encrypted TEXT NULL,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_navigation (
  id VARCHAR(128) PRIMARY KEY,
  label VARCHAR(150) NOT NULL,
  destination VARCHAR(500) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS af_pages (
  id VARCHAR(128) PRIMARY KEY,
  slug VARCHAR(200) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  template_key VARCHAR(200) NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_templates (
  id VARCHAR(128) PRIMARY KEY,
  template_key VARCHAR(200) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  version VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  config_json TEXT NULL,
  installed_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_template_settings (
  template_id VARCHAR(128) PRIMARY KEY,
  settings_json TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_appearance_settings (
  id INTEGER PRIMARY KEY,
  settings_json TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS af_backup_history (
  id VARCHAR(128) PRIMARY KEY,
  backup_type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  file_location TEXT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  error_message TEXT NULL
);

CREATE TABLE IF NOT EXISTS af_system_settings (
  key_name VARCHAR(150) PRIMARY KEY,
  value_text TEXT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS af_anime_enabled_idx ON af_anime(enabled);
CREATE INDEX IF NOT EXISTS af_anime_sync_idx ON af_anime(synced_at);
CREATE INDEX IF NOT EXISTS af_episodes_anime_idx ON af_episodes(anime_id);
CREATE INDEX IF NOT EXISTS af_episodes_visible_idx ON af_episodes(visible);
CREATE INDEX IF NOT EXISTS af_provider_priority_idx ON af_providers(priority);
CREATE INDEX IF NOT EXISTS af_history_user_idx ON af_watch_history(user_id, watched_at);
CREATE INDEX IF NOT EXISTS af_comments_status_idx ON af_comments(status, created_at);
CREATE INDEX IF NOT EXISTS af_reports_status_idx ON af_reports(status, created_at);
CREATE INDEX IF NOT EXISTS af_analytics_event_idx ON af_analytics(event_type, occurred_at);
CREATE INDEX IF NOT EXISTS af_audit_admin_idx ON af_audit_logs(admin_user_id, created_at);

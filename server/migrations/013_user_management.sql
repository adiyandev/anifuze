CREATE INDEX IF NOT EXISTS af_users_status_idx ON af_users(status);
CREATE INDEX IF NOT EXISTS af_users_active_idx ON af_users(last_active_at);
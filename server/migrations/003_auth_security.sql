ALTER TABLE af_admin_users ADD COLUMN IF NOT EXISTS must_setup_2fa BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE af_admin_sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64) NULL;
ALTER TABLE af_admin_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT NULL;
ALTER TABLE af_admin_sessions ADD COLUMN IF NOT EXISTS absolute_expires_at TIMESTAMP NULL;
ALTER TABLE af_admin_sessions ADD COLUMN IF NOT EXISTS two_factor_verified BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS af_admin_sessions_user_idx ON af_admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS af_admin_sessions_expires_idx ON af_admin_sessions(expires_at);
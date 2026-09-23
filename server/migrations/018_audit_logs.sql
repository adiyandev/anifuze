CREATE TABLE IF NOT EXISTS af_audit_logs (
  id UUID PRIMARY KEY,
  admin_user_id VARCHAR(128) NULL,
  action VARCHAR(120) NOT NULL,
  resource_type VARCHAR(80) NULL,
  resource_id VARCHAR(255) NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(64) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS af_audit_logs_created_idx ON af_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS af_audit_logs_admin_idx ON af_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS af_audit_logs_action_idx ON af_audit_logs(action);
CREATE TABLE IF NOT EXISTS af_user_tokens (
 id VARCHAR(128) PRIMARY KEY,
 user_id VARCHAR(128) NOT NULL,
 token_hash VARCHAR(128) NOT NULL UNIQUE,
 token_type VARCHAR(32) NOT NULL,
 expires_at TIMESTAMP NOT NULL,
 used_at TIMESTAMP,
 created_at TIMESTAMP NOT NULL,
 requested_ip VARCHAR(255),
 UNIQUE(user_id,token_type)
);
CREATE INDEX IF NOT EXISTS af_user_tokens_expiry_idx ON af_user_tokens(expires_at);

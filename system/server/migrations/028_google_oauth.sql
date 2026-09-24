CREATE TABLE IF NOT EXISTS af_user_oauth_accounts (
 id VARCHAR(128) PRIMARY KEY,
 user_id VARCHAR(128) NOT NULL,
 provider VARCHAR(32) NOT NULL,
 provider_subject VARCHAR(255) NOT NULL,
 provider_email VARCHAR(320),
 created_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS af_user_oauth_provider_subject_idx ON af_user_oauth_accounts(provider,provider_subject);
CREATE INDEX IF NOT EXISTS af_user_oauth_user_idx ON af_user_oauth_accounts(user_id);

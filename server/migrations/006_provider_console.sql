CREATE TABLE IF NOT EXISTS af_provider_request_history (
  id VARCHAR(128) PRIMARY KEY,
  provider_id VARCHAR(128) NOT NULL,
  method VARCHAR(10) NOT NULL,
  endpoint TEXT NOT NULL,
  request_headers TEXT NULL,
  request_query TEXT NULL,
  request_body TEXT NULL,
  response_status INTEGER NULL,
  response_time_ms INTEGER NULL,
  response_headers TEXT NULL,
  response_body TEXT NULL,
  created_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS af_provider_history_provider_idx ON af_provider_request_history(provider_id,created_at);

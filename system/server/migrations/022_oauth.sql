CREATE TABLE IF NOT EXISTS af_oauth_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  google_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  google_client_id TEXT,
  google_client_secret TEXT,
  google_redirect_uri TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO af_oauth_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
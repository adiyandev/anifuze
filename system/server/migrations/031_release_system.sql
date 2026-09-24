CREATE TABLE IF NOT EXISTS af_release_state (
  id INTEGER PRIMARY KEY CHECK (id=1),
  current_version VARCHAR(64) NOT NULL DEFAULT '1.0.0',
  staged_version VARCHAR(64),
  staged_package TEXT,
  staged_checksum VARCHAR(128),
  staged_at TIMESTAMP,
  status VARCHAR(32) NOT NULL DEFAULT 'idle',
  last_error TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO af_release_state (id,current_version) VALUES (1,'1.0.0') ON CONFLICT (id) DO NOTHING;

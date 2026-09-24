CREATE TABLE IF NOT EXISTS af_license (
  id INTEGER PRIMARY KEY CHECK (id=1),
  key_hash VARCHAR(128),
  key_hint VARCHAR(32),
  status VARCHAR(32) NOT NULL DEFAULT 'unlicensed',
  plan VARCHAR(64),
  customer VARCHAR(255),
  domain VARCHAR(255),
  expires_at TIMESTAMP,
  last_checked_at TIMESTAMP,
  last_error TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO af_license (id,status) SELECT 1,'unlicensed' WHERE NOT EXISTS (SELECT 1 FROM af_license WHERE id=1);

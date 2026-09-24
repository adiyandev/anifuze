CREATE TABLE IF NOT EXISTS af_update_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  channel VARCHAR(32) NOT NULL DEFAULT 'stable',
  manifest_url TEXT NOT NULL DEFAULT 'https://api.github.com/repos/adiyandev/anifuze/releases/latest',
  auto_check BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO af_update_settings (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM af_update_settings WHERE id=1);

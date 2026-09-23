CREATE TABLE IF NOT EXISTS af_maintenance_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  title VARCHAR(255) NOT NULL DEFAULT 'AniFuze is under maintenance',
  message TEXT NOT NULL DEFAULT 'We are performing scheduled maintenance. Please check back soon.',
  estimated_minutes INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO af_maintenance_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

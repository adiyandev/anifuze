CREATE TABLE IF NOT EXISTS af_site_config (
 id INTEGER PRIMARY KEY CHECK (id=1),
 site_name VARCHAR(120) NOT NULL DEFAULT 'AniFuze',
 tagline VARCHAR(240) NOT NULL DEFAULT 'Your anime, your way.',
 description TEXT NOT NULL DEFAULT '',
 logo_url TEXT,
 favicon_url TEXT,
 domain VARCHAR(255),
 support_email VARCHAR(320),
 primary_color VARCHAR(32) NOT NULL DEFAULT '#ff2d8d',
 accent_color VARCHAR(32) NOT NULL DEFAULT '#7c3aed',
 background_color VARCHAR(32) NOT NULL DEFAULT '#07070a',
 footer_text VARCHAR(500) NOT NULL DEFAULT '',
 social_links TEXT NOT NULL DEFAULT '{}',
 setup_completed BOOLEAN NOT NULL DEFAULT FALSE,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO af_site_config (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM af_site_config WHERE id=1);

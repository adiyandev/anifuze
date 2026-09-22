CREATE TABLE IF NOT EXISTS af_appearance_settings (
 id INTEGER PRIMARY KEY,
 site_name VARCHAR(255) NOT NULL DEFAULT 'AniFuze',
 tagline VARCHAR(500) NOT NULL DEFAULT '',
 primary_color VARCHAR(32) NOT NULL DEFAULT '#ff2d95',
 accent_color VARCHAR(32) NOT NULL DEFAULT '#7c3aed',
 logo_url TEXT NULL,
 favicon_url TEXT NULL,
 font_family VARCHAR(128) NOT NULL DEFAULT 'Inter',
 container_width VARCHAR(32) NOT NULL DEFAULT 'wide',
 card_radius VARCHAR(32) NOT NULL DEFAULT '10px',
 effects VARCHAR(32) NOT NULL DEFAULT 'subtle',
 updated_at TIMESTAMP NOT NULL
);
INSERT INTO af_appearance_settings(id,updated_at)
SELECT 1,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_appearance_settings WHERE id=1);
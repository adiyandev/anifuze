ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS package_url TEXT;
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS package_sha256 VARCHAR(64);
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS package_signature TEXT;
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS package_size BIGINT;
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS package_path TEXT;
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS compatibility TEXT;
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE af_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100);

CREATE TABLE IF NOT EXISTS af_template_versions (
 id VARCHAR(128) NOT NULL,
 version VARCHAR(32) NOT NULL,
 name VARCHAR(255) NOT NULL,
 status VARCHAR(32) NOT NULL DEFAULT 'installed',
 config TEXT NOT NULL,
 installed_at TIMESTAMP NOT NULL,
 updated_at TIMESTAMP NOT NULL,
 package_url TEXT,
 package_sha256 VARCHAR(64),
 package_signature TEXT,
 package_size BIGINT,
 package_path TEXT,
 compatibility TEXT,
 description TEXT,
 category VARCHAR(100),
 PRIMARY KEY (id, version)
);

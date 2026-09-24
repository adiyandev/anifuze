CREATE TABLE IF NOT EXISTS af_site_builder (
 id VARCHAR(128) PRIMARY KEY,
 page VARCHAR(64) NOT NULL DEFAULT 'home',
 block_type VARCHAR(64) NOT NULL,
 title VARCHAR(255) NOT NULL,
 content TEXT NULL,
 config TEXT NOT NULL,
 sort_order INTEGER NOT NULL DEFAULT 0,
 visible BOOLEAN NOT NULL DEFAULT TRUE,
 updated_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS af_site_builder_page_idx ON af_site_builder(page,sort_order);
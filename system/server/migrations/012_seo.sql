CREATE TABLE IF NOT EXISTS af_seo_settings (
  id INTEGER PRIMARY KEY,
  site_title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT NOT NULL,
  og_image TEXT NULL,
  robots VARCHAR(32) NOT NULL DEFAULT 'index,follow',
  sitemap_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  canonical_url TEXT NULL,
  anime_seo_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL
);

INSERT INTO af_seo_settings
  (id,site_title,description,keywords,og_image,robots,sitemap_enabled,canonical_url,anime_seo_enabled,updated_at)
SELECT 1,'AniFuze','Anime streaming website powered by AniFuze.','anime,anime streaming,watch anime',NULL,'index,follow',TRUE,NULL,TRUE,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_seo_settings WHERE id=1);
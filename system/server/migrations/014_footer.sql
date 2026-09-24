CREATE TABLE IF NOT EXISTS af_footer_settings (
 id INTEGER PRIMARY KEY,
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 description TEXT NOT NULL DEFAULT '',
 copyright_text VARCHAR(255) NOT NULL DEFAULT '',
 show_brand BOOLEAN NOT NULL DEFAULT TRUE,
 show_navigation BOOLEAN NOT NULL DEFAULT TRUE,
 show_account BOOLEAN NOT NULL DEFAULT TRUE,
 show_powered_by BOOLEAN NOT NULL DEFAULT TRUE,
 updated_at TIMESTAMP NOT NULL
);
INSERT INTO af_footer_settings(id,enabled,description,copyright_text,show_brand,show_navigation,show_account,show_powered_by,updated_at)
SELECT 1,TRUE,'Your anime streaming destination.','',TRUE,TRUE,TRUE,TRUE,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_footer_settings WHERE id=1);

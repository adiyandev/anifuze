CREATE TABLE IF NOT EXISTS af_default_pages (
 id VARCHAR(128) PRIMARY KEY,
 slug VARCHAR(128) NOT NULL UNIQUE,
 name VARCHAR(255) NOT NULL,
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 sort_order INTEGER NOT NULL DEFAULT 0,
 template_id VARCHAR(128) NULL,
 updated_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS af_default_pages_order_idx ON af_default_pages(enabled,sort_order);

INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'home','home','Home',TRUE,10,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='home');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'browse','browse','Browse',TRUE,20,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='browse');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'latest','latest','Latest',TRUE,30,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='latest');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'trending','trending','Trending',TRUE,40,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='trending');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'schedule','schedule','Schedule',TRUE,50,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='schedule');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'genres','genres','Genres',TRUE,60,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='genres');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'search','search','Search',TRUE,70,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='search');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'anime','anime','Anime Details',TRUE,80,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='anime');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'watch','watch','Watch',TRUE,90,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='watch');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'login','login','Login',TRUE,100,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='login');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'register','register','Register',TRUE,110,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='register');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'favorites','favorites','Favorites',TRUE,120,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='favorites');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'watchlist','watchlist','Watchlist',TRUE,130,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='watchlist');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'history','history','Watch History',TRUE,140,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='history');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'continue-watching','continue-watching','Continue Watching',TRUE,150,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='continue-watching');
INSERT INTO af_default_pages(id,slug,name,enabled,sort_order,template_id,updated_at)
SELECT 'profile','profile','Profile',TRUE,160,'orbit',CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_default_pages WHERE id='profile');
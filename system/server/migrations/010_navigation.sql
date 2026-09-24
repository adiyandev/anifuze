CREATE TABLE IF NOT EXISTS af_navigation_items (
 id VARCHAR(128) PRIMARY KEY,
 label VARCHAR(255) NOT NULL,
 path VARCHAR(512) NOT NULL,
 icon VARCHAR(64) NULL,
 visible BOOLEAN NOT NULL DEFAULT TRUE,
 sort_order INTEGER NOT NULL DEFAULT 0,
 updated_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS af_navigation_items_order_idx ON af_navigation_items(visible,sort_order);

INSERT INTO af_navigation_items(id,label,path,icon,visible,sort_order,updated_at)
SELECT 'browse','Browse','/browse','Compass',TRUE,10,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_navigation_items WHERE id='browse');
INSERT INTO af_navigation_items(id,label,path,icon,visible,sort_order,updated_at)
SELECT 'latest','Latest','/latest','Bell',TRUE,20,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_navigation_items WHERE id='latest');
INSERT INTO af_navigation_items(id,label,path,icon,visible,sort_order,updated_at)
SELECT 'trending','Trending','/trending','BarChart3',TRUE,30,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_navigation_items WHERE id='trending');
INSERT INTO af_navigation_items(id,label,path,icon,visible,sort_order,updated_at)
SELECT 'schedule','Schedule','/schedule','CalendarDays',TRUE,40,CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM af_navigation_items WHERE id='schedule');
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRobots,buildSitemap} from './seo.js';

test('SEO robots output contains sitemap and configured directives',()=>{
 const text=buildRobots({robots:'index,follow'});
 assert.match(text,/^index,follow/);
 assert.match(text,/Sitemap:/);
});

test('SEO sitemap is valid XML-shaped output and escapes URLs',()=>{
 const xml=buildSitemap({sitemap_enabled:true});
 assert.match(xml,/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
 assert.match(xml,/<urlset[^>]+>/);
 assert.match(xml,/<loc>https:\/\/localhost\//);
});
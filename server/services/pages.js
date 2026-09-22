import {query} from '../db/index.js';

export const DEFAULT_PAGE_SLUGS=new Set(['home','browse','latest','trending','schedule','genres','search','anime','watch','login','register']);

export async function listPages({publicOnly=false}={}){
 const r=await query(publicOnly
  ? 'SELECT id,slug,name,enabled,sort_order,template_id FROM af_default_pages WHERE enabled=TRUE ORDER BY sort_order ASC,id ASC'
  : 'SELECT id,slug,name,enabled,sort_order,template_id FROM af_default_pages ORDER BY sort_order ASC,id ASC');
 return r.rows;
}

export async function setPageEnabled(slug,enabled){
 if(!allowedSlugs.has(String(slug)))throw new Error('Unknown predefined page.');
 const r=await query('UPDATE af_default_pages SET enabled=$1,updated_at=CURRENT_TIMESTAMP WHERE slug=$2',[Boolean(enabled),String(slug)]);
 if(!r.rowCount)throw new Error('Page not found.');
 return listPages();
}
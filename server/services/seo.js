import {query} from '../db/index.js';
import {config} from '../config.js';

const DEFAULT={
 site_title:'AniFuze',
 description:'Anime streaming website powered by AniFuze.',
 keywords:'anime,anime streaming,watch anime',
 og_image:null,
 robots:'index,follow',
 sitemap_enabled:true,
 canonical_url:null,
 anime_seo_enabled:true
};

const row=x=>({...DEFAULT,...x});

function cleanText(value,max=5000){return String(value??'').trim().slice(0,max);}
function normalizeUrl(value){
 const raw=String(value??'').trim();
 if(!raw)return null;
 const url=new URL(raw);
 if(!['http:','https:'].includes(url.protocol))throw new Error('URLs must use HTTP or HTTPS.');
 if(url.username||url.password)throw new Error('URLs cannot contain credentials.');
 return url.toString().replace(/\/$/,'');
}
function getOrigin(){
 const raw=String(config.domain||'localhost').trim();
 const candidate=/^https?:\/\//i.test(raw)?raw:`https://${raw}`;
 try{
  const url=new URL(candidate);
  url.username='';url.password='';
  return url.toString().replace(/\/$/,'');
 }catch{return 'http://localhost';}
}

export async function getSeo(){
 const r=await query('SELECT * FROM af_seo_settings WHERE id=1');
 return row(r.rows[0]);
}

export async function saveSeo(input={}){
 const current=await getSeo();
 const next={
  ...current,
  site_title:cleanText(input.site_title===undefined?current.site_title:input.site_title,255),
  description:cleanText(input.description===undefined?current.description:input.description,5000),
  keywords:cleanText(input.keywords===undefined?current.keywords:input.keywords,1000),
  og_image:input.og_image===undefined?current.og_image:normalizeUrl(input.og_image),
  robots:cleanText(input.robots===undefined?current.robots:input.robots,32).toLowerCase(),
  sitemap_enabled:input.sitemap_enabled===undefined?Boolean(current.sitemap_enabled):Boolean(input.sitemap_enabled),
  canonical_url:input.canonical_url===undefined?current.canonical_url:normalizeUrl(input.canonical_url),
  anime_seo_enabled:input.anime_seo_enabled===undefined?Boolean(current.anime_seo_enabled):Boolean(input.anime_seo_enabled)
 };
 if(!next.site_title)throw new Error('Site title is required.');
 if(!next.description)throw new Error('Description is required.');
 if(!/^(index|noindex),(follow|nofollow)$/.test(next.robots))throw new Error('Robots must be index/noindex with follow/nofollow.');
 if(next.canonical_url&&next.canonical_url.length>2000)throw new Error('Canonical URL is too long.');
 await query('UPDATE af_seo_settings SET site_title=$1,description=$2,keywords=$3,og_image=$4,robots=$5,sitemap_enabled=$6,canonical_url=$7,anime_seo_enabled=$8,updated_at=CURRENT_TIMESTAMP WHERE id=1',
  [next.site_title,next.description,next.keywords,next.og_image,next.robots,next.sitemap_enabled,next.canonical_url,next.anime_seo_enabled]);
 return getSeo();
}

export function getSeoOrigin(){return getOrigin();}

function xmlEscape(value){
 return String(value).replace(/[<>&'"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
}

export function buildRobots(seo){
 const origin=getOrigin();
 return `${seo.robots}\nSitemap: ${origin}/sitemap.xml\n`;
}

export function buildSitemap(seo){
 const origin=getOrigin();
 const paths=['/','/browse','/latest','/trending','/schedule','/genres','/search','/login','/register'];
 const urls=seo.sitemap_enabled?paths.map(path=>`  <url><loc>${xmlEscape(origin+path)}</loc></url>`).join('\n'):'';
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export {DEFAULT};
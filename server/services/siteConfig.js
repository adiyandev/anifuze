import {query} from '../db/index.js';

const defaults={site_name:'AniFuze',tagline:'Your anime, your way.',description:'',logo_url:'',favicon_url:'',domain:'',support_email:'',primary_color:'#ff2d8d',accent_color:'#7c3aed',background_color:'#07070a',footer_text:'',social_links:{},setup_completed:false};
const normalize=(row={})=>{let links=row.social_links;try{if(typeof links==='string')links=JSON.parse(links||'{}')}catch{links={}}return {...defaults,...row,social_links:links||{}}};

export async function getSiteConfig(){
 const r=await query('SELECT * FROM af_site_config WHERE id=1');
 return normalize(r.rows[0]||defaults);
}
export async function updateSiteConfig(input={}){
 const current=await getSiteConfig();
 const value={
  site_name:String(input.site_name??current.site_name).trim().slice(0,120)||defaults.site_name,
  tagline:String(input.tagline??current.tagline).trim().slice(0,240),
  description:String(input.description??current.description).trim(),
  logo_url:String(input.logo_url??current.logo_url).trim(),
  favicon_url:String(input.favicon_url??current.favicon_url).trim(),
  domain:String(input.domain??current.domain).trim().slice(0,255),
  support_email:String(input.support_email??current.support_email).trim().slice(0,320),
  primary_color:String(input.primary_color??current.primary_color).trim().slice(0,32),
  accent_color:String(input.accent_color??current.accent_color).trim().slice(0,32),
  background_color:String(input.background_color??current.background_color).trim().slice(0,32),
  footer_text:String(input.footer_text??current.footer_text).trim().slice(0,500),
  social_links:input.social_links??current.social_links??{},
  setup_completed:Boolean(input.setup_completed??current.setup_completed)
 };
 if(!value.site_name)throw new Error('Site name is required.');
 if(value.support_email&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.support_email))throw new Error('Support email is invalid.');
 const r=await query('UPDATE af_site_config SET site_name=$1,tagline=$2,description=$3,logo_url=$4,favicon_url=$5,domain=$6,support_email=$7,primary_color=$8,accent_color=$9,background_color=$10,footer_text=$11,social_links=$12,setup_completed=$13,updated_at=CURRENT_TIMESTAMP WHERE id=1 RETURNING *',[value.site_name,value.tagline,value.description,value.logo_url||null,value.favicon_url||null,value.domain||null,value.support_email||null,value.primary_color,value.accent_color,value.background_color,value.footer_text,JSON.stringify(value.social_links),value.setup_completed]);
 return normalize(r.rows[0]);
}
export function toPublicSiteConfig(v){return {siteName:v.site_name,tagline:v.tagline,description:v.description,logoUrl:v.logo_url,faviconUrl:v.favicon_url,domain:v.domain,supportEmail:v.support_email,primary:v.primary_color,accent:v.accent_color,background:v.background_color,footerText:v.footer_text,socialLinks:v.social_links,setupCompleted:v.setup_completed};}

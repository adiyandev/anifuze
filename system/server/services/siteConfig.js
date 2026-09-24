import {query} from '../db/index.js';

const defaults={site_name:'AniFuze',tagline:'Your anime, your way.',description:'',logo_url:'',favicon_url:'',domain:'',support_email:'',primary_color:'#ff2d8d',accent_color:'#7c3aed',background_color:'#07070a',footer_text:'',social_links:{},setup_completed:false};
const normalize=(row={})=>{let links=row.social_links;try{if(typeof links==='string')links=JSON.parse(links||'{}')}catch{links={}}return {...defaults,...row,social_links:links||{}}};
const isHexColor=v=>/^#[0-9a-f]{3,8}$/i.test(String(v));
const isHttpUrl=v=>{if(!v)return true;try{const u=new URL(String(v));return u.protocol==='https:'||u.protocol==='http:';}catch{return false;}};
const normalizeSocialLinks=input=>{
 const source=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
 const out={};
 for(const key of ['discord','twitter','youtube']){const value=String(source[key]??'').trim().slice(0,500);if(value){if(!isHttpUrl(value))throw new Error(`Social link ${key} must be a valid HTTP(S) URL.`);out[key]=value;}}
 return out;
};

export async function getSiteConfig(){
 const r=await query('SELECT * FROM af_site_config WHERE id=1');
 return normalize(r.rows[0]||defaults);
}
export function normalizeSiteConfigInput(input={},current=defaults){
 const base={...defaults,...(current||{})};
 const value={
  site_name:String(input.site_name??base.site_name).trim().slice(0,120)||defaults.site_name,
  tagline:String(input.tagline??base.tagline).trim().slice(0,240),
  description:String(input.description??base.description).trim().slice(0,4000),
  logo_url:String(input.logo_url??base.logo_url).trim().slice(0,1000),
  favicon_url:String(input.favicon_url??base.favicon_url).trim().slice(0,1000),
  domain:String(input.domain??base.domain).trim().slice(0,255),
  support_email:String(input.support_email??base.support_email).trim().slice(0,320),
  primary_color:String(input.primary_color??base.primary_color).trim().slice(0,32),
  accent_color:String(input.accent_color??base.accent_color).trim().slice(0,32),
  background_color:String(input.background_color??base.background_color).trim().slice(0,32),
  footer_text:String(input.footer_text??base.footer_text).trim().slice(0,500),
  social_links:normalizeSocialLinks(input.social_links??base.social_links),
  setup_completed:Boolean(input.setup_completed??base.setup_completed)
 };
 if(value.support_email&&!/^\S+@\S+\.\S+$/.test(value.support_email))throw new Error('Support email is invalid.');
 for(const [key,label] of [['primary_color','primary color'],['accent_color','accent color'],['background_color','background color']])if(!isHexColor(value[key]))throw new Error('Invalid '+label+'.');
 if(value.logo_url&&!isHttpUrl(value.logo_url)&&!value.logo_url.startsWith('/'))throw new Error('Logo URL must be HTTP(S) or a local path.');
 if(value.favicon_url&&!isHttpUrl(value.favicon_url)&&!value.favicon_url.startsWith('/'))throw new Error('Favicon URL must be HTTP(S) or a local path.');
 return value;
}

export async function updateSiteConfig(input={}){
 const current=await getSiteConfig();
 const value=normalizeSiteConfigInput(input,current);
 await query('UPDATE af_site_config SET site_name=$1,tagline=$2,description=$3,logo_url=$4,favicon_url=$5,domain=$6,support_email=$7,primary_color=$8,accent_color=$9,background_color=$10,footer_text=$11,social_links=$12,setup_completed=$13,updated_at=CURRENT_TIMESTAMP WHERE id=1',[value.site_name,value.tagline,value.description,value.logo_url||null,value.favicon_url||null,value.domain||null,value.support_email||null,value.primary_color,value.accent_color,value.background_color,value.footer_text,JSON.stringify(value.social_links),value.setup_completed]);
 return getSiteConfig();
}
export function toPublicSiteConfig(v){return {siteName:v.site_name,tagline:v.tagline,description:v.description,logoUrl:v.logo_url,faviconUrl:v.favicon_url,domain:v.domain,supportEmail:v.support_email,primary:v.primary_color,accent:v.accent_color,background:v.background_color,footerText:v.footer_text,socialLinks:v.social_links,setupCompleted:v.setup_completed};}

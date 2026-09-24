import {query} from '../db/index.js';
const DEFAULT={site_name:'AniFuze',tagline:'',primary_color:'#ff2d95',accent_color:'#7c3aed',logo_url:null,favicon_url:null,font_family:'Inter',container_width:'wide',card_radius:'10px',effects:'subtle'};
const row=x=>({...DEFAULT,...x});
export async function getAppearance(){const r=await query('SELECT * FROM af_appearance_settings WHERE id=1');return row(r.rows[0]);}
export async function saveAppearance(input={}){const allowed=['site_name','tagline','primary_color','accent_color','logo_url','favicon_url','font_family','container_width','card_radius','effects'];const v={};for(const k of allowed)if(input[k]!==undefined)v[k]=String(input[k]??'').slice(0,2000);
const current=await getAppearance();const next={...current,...v};
const color=/^#[0-9a-fA-F]{6}$/;if(!color.test(next.primary_color)||!color.test(next.accent_color))throw new Error('Colors must be 6-digit hex values.');
if(!['Inter','Geist','System'].includes(next.font_family))throw new Error('Unsupported font.');
if(!['wide','centered'].includes(next.container_width))throw new Error('Unsupported container width.');
if(!['none','subtle','strong'].includes(next.effects))throw new Error('Unsupported effects.');
await query('UPDATE af_appearance_settings SET site_name=$1,tagline=$2,primary_color=$3,accent_color=$4,logo_url=$5,favicon_url=$6,font_family=$7,container_width=$8,card_radius=$9,effects=$10,updated_at=CURRENT_TIMESTAMP WHERE id=1',[next.site_name,next.tagline,next.primary_color,next.accent_color,next.logo_url||null,next.favicon_url||null,next.font_family,next.container_width,next.card_radius,next.effects]);return getAppearance();}
export {DEFAULT};
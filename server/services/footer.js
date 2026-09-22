import {query} from '../db/index.js';

const defaults={enabled:true,description:'Your anime streaming destination.',copyright_text:'',show_brand:true,show_navigation:true,show_account:true,show_powered_by:true};

export async function getFooter(){const r=await query('SELECT enabled,description,copyright_text,show_brand,show_navigation,show_account,show_powered_by,updated_at FROM af_footer_settings WHERE id=1');return {...defaults,...(r.rows[0]||{})};}

export function validateFooter(input={}){
 const out={...defaults};
 if(input.enabled!==undefined){if(typeof input.enabled!=='boolean')throw new Error('enabled must be boolean.');out.enabled=input.enabled;}
 for(const k of ['show_brand','show_navigation','show_account','show_powered_by'])if(input[k]!==undefined){if(typeof input[k]!=='boolean')throw new Error(k+' must be boolean.');out[k]=input[k];}
 if(input.description!==undefined){if(typeof input.description!=='string'||input.description.length>500)throw new Error('description must be 500 characters or fewer.');out.description=input.description.trim();}
 if(input.copyright_text!==undefined){if(typeof input.copyright_text!=='string'||input.copyright_text.length>255)throw new Error('copyright_text must be 255 characters or fewer.');out.copyright_text=input.copyright_text.trim();}
 return out;
}

export async function saveFooter(input){
 const v=validateFooter(input);
 await query('UPDATE af_footer_settings SET enabled=$1,description=$2,copyright_text=$3,show_brand=$4,show_navigation=$5,show_account=$6,show_powered_by=$7,updated_at=CURRENT_TIMESTAMP WHERE id=1',[v.enabled,v.description,v.copyright_text,v.show_brand,v.show_navigation,v.show_account,v.show_powered_by]);
 return getFooter();
}

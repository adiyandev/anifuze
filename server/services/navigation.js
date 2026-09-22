import {query} from '../db/index.js';

const defaults=[
 {id:'browse',label:'Browse',path:'/browse',icon:'Compass',visible:true,sort_order:10},
 {id:'latest',label:'Latest',path:'/latest',icon:'Bell',visible:true,sort_order:20},
 {id:'trending',label:'Trending',path:'/trending',icon:'BarChart3',visible:true,sort_order:30},
 {id:'schedule',label:'Schedule',path:'/schedule',icon:'CalendarDays',visible:true,sort_order:40}
];

const clean=(item,index)=>({
 id:String(item.id||'').trim(),
 label:String(item.label||'').trim(),
 path:String(item.path||'').trim(),
 icon:item.icon==null?null:String(item.icon).trim()||null,
 visible:item.visible!==false,
 sort_order:Number.isInteger(item.sort_order)?item.sort_order:(index+1)*10
});

export async function listNavigation({publicOnly=false}={}){
 const r=await query(publicOnly
  ? 'SELECT id,label,path,icon,visible,sort_order FROM af_navigation_items WHERE visible=TRUE ORDER BY sort_order ASC,id ASC'
  : 'SELECT id,label,path,icon,visible,sort_order FROM af_navigation_items ORDER BY sort_order ASC,id ASC');
 return r.rows.length?r.rows:defaults.filter(x=>!publicOnly||x.visible);
}

export async function saveNavigation(items){
 if(!Array.isArray(items)||items.length>0&&items.length>50)throw new Error('Navigation must contain 0 to 50 items.');
 const normalized=items.map(clean);
 const seen=new Set();
 for(const item of normalized){
  if(!item.id||seen.has(item.id))throw new Error('Navigation item IDs must be unique.');
  seen.add(item.id);
  if(!item.label||item.label.length>64)throw new Error('Navigation labels must be 1 to 64 characters.');
  if(!/^\/(?:[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*)$/.test(item.path))throw new Error('Navigation paths must be internal site paths.');
  if(item.path.startsWith('//'))throw new Error('Invalid navigation path.');
  if(item.sort_order<-100000||item.sort_order>100000)throw new Error('Invalid navigation order.');
 }
 await query('DELETE FROM af_navigation_items');
 for(const item of normalized){
  await query('INSERT INTO af_navigation_items(id,label,path,icon,visible,sort_order,updated_at) VALUES($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)',
   [item.id,item.label,item.path,item.icon,item.visible,item.sort_order]);
 }
 return listNavigation();
}

export const defaultNavigation=defaults;
import {query} from '../db/index.js';

const DEFAULT={
  enabled:false,
  title:'AniFuze is under maintenance',
  message:'We are performing scheduled maintenance. Please check back soon.',
  estimated_minutes:null
};

const normalize=row=>({...DEFAULT,...row});

function cleanText(value,max){return String(value??'').trim().slice(0,max);}
function normalizeMinutes(value){
  if(value===null||value===undefined||value==='')return null;
  const n=Number(value);
  if(!Number.isFinite(n))throw new Error('Estimated minutes must be a number.');
  return Math.max(1,Math.min(10080,Math.round(n)));
}

export async function getMaintenance(){
  const r=await query('SELECT enabled,title,message,estimated_minutes,updated_at FROM af_maintenance_settings WHERE id=1');
  return normalize(r.rows[0]);
}

export async function saveMaintenance(input={}){
  const current=await getMaintenance();
  const next={
    enabled:input.enabled===undefined?Boolean(current.enabled):Boolean(input.enabled),
    title:cleanText(input.title===undefined?current.title:input.title,255),
    message:cleanText(input.message===undefined?current.message:input.message,5000),
    estimated_minutes:input.estimated_minutes===undefined?current.estimated_minutes:normalizeMinutes(input.estimated_minutes)
  };
  if(!next.title)throw new Error('Maintenance title is required.');
  if(!next.message)throw new Error('Maintenance message is required.');
  await query('UPDATE af_maintenance_settings SET enabled=$1,title=$2,message=$3,estimated_minutes=$4,updated_at=CURRENT_TIMESTAMP WHERE id=1',
    [next.enabled,next.title,next.message,next.estimated_minutes]);
  return getMaintenance();
}

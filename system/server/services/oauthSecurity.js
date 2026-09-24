import crypto from 'node:crypto';

export function createOAuthState(){
 return crypto.randomBytes(32).toString('base64url');
}

export function parseCookies(header=''){
 return Object.fromEntries(String(header).split(';').map(x=>x.trim()).filter(Boolean).map(x=>{
  const i=x.indexOf('=');
  if(i<0)return [x,''];
  try{return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]}catch{return [x.slice(0,i),'']}
 }));
}

export function safeEqual(a,b){
 const left=Buffer.from(String(a||'')),right=Buffer.from(String(b||''));
 return left.length>0&&left.length===right.length&&crypto.timingSafeEqual(left,right);
}

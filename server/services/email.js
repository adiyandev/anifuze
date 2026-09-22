import crypto from 'node:crypto';
import net from 'node:net';
import tls from 'node:tls';
import {query} from '../db/index.js';

const id=()=>crypto.randomUUID();
const defaults={enabled:false,host:'',port:587,secure:false,username:'',password:'',from_email:'',from_name:'AniFuze'};

function cfgRow(r){return r.rows[0]?{...r.rows[0],enabled:Boolean(r.rows[0].enabled),secure:Boolean(r.rows[0].secure)}:defaults;}
export async function getEmailSettings(){return cfgRow(await query('SELECT id,enabled,host,port,secure,username,from_email,from_name,updated_at FROM af_email_settings WHERE id=1'));}
export async function saveEmailSettings(input={}){
 const current=await query('SELECT password FROM af_email_settings WHERE id=1'); const password=input.password!==undefined?String(input.password):String(current.rows[0]?.password||'');
 const value={enabled:Boolean(input.enabled),host:String(input.host||'').trim(),port:Number(input.port)||587,secure:Boolean(input.secure),username:String(input.username||'').trim(),password,from_email:String(input.from_email||'').trim(),from_name:String(input.from_name||'AniFuze').trim()};
 if(value.enabled&&(!value.host||!value.from_email))throw new Error('SMTP host and sender email are required.');
 if(value.port<1||value.port>65535)throw new Error('Invalid SMTP port.');
 await query(`INSERT INTO af_email_settings(id,enabled,host,port,secure,username,password,from_email,from_name,updated_at)
 VALUES(1,$1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP)
 ON CONFLICT(id) DO UPDATE SET enabled=$1,host=$2,port=$3,secure=$4,username=$5,password=$6,from_email=$7,from_name=$8,updated_at=CURRENT_TIMESTAMP`,[value.enabled,value.host,value.port,value.secure,value.username,value.password,value.from_email,value.from_name]);
 return getEmailSettings();
}

function escapeHeader(s){return String(s).replace(/[\r\n]/g,' ');}
function encodeBody(s){return Buffer.from(String(s),'utf8').toString('base64');}
function command(socket,expected,cmd=''){return new Promise((resolve,reject)=>{let buf='';const timer=setTimeout(()=>{cleanup();reject(new Error('SMTP timeout.'));},15000);const onData=data=>{buf+=data.toString();const lines=buf.split(/\r?\n/);buf=lines.pop()||'';for(const line of lines){if(/^\d{3}( |$)/.test(line)){const code=Number(line.slice(0,3));cleanup();if(expected.includes(code))resolve(line);else reject(new Error('SMTP '+line));return;}}};const onErr=e=>{cleanup();reject(e)};const cleanup=()=>{clearTimeout(timer);socket.off('data',onData);socket.off('error',onErr)};socket.on('data',onData);socket.on('error',onErr);if(cmd)socket.write(cmd+'\r\n');});}

async function smtpSend(to,subject,html,textBody=''){
 const s=await getEmailSettings();if(!s.enabled)throw new Error('Email delivery is disabled.');
 const socket=s.secure?tls.connect({host:s.host,port:s.port,rejectUnauthorized:true}):net.connect({host:s.host,port:s.port});
 await new Promise((resolve,reject)=>{socket.once('connect',resolve);socket.once('secureConnect',resolve);socket.once('error',reject);});
 await command(socket,[220]);
 let ehlo=await command(socket,[250],'EHLO anifuze.local');
 if(!s.secure&&s.port===587&&ehlo){
   await command(socket,[250],'STARTTLS');
   const secureSocket=tls.connect({socket,host:s.host,rejectUnauthorized:true});
   await new Promise((resolve,reject)=>{secureSocket.once('secureConnect',resolve);secureSocket.once('error',reject);});
   socket=secureSocket;
   await command(socket,[250],'EHLO anifuze.local');
 }
 if(s.username){await command(socket,[235,334],'AUTH LOGIN');await command(socket,[334],encodeBody(s.username));await command(socket,[235],encodeBody(s.password));}
 await command(socket,[250],'MAIL FROM:<'+escapeHeader(s.from_email)+'>');
 await command(socket,[250],'RCPT TO:<'+escapeHeader(to)+'>');
 await command(socket,[354],'DATA');
 const headers='From: '+escapeHeader(s.from_name)+' <'+escapeHeader(s.from_email)+'>\r\nTo: <'+escapeHeader(to)+'>\r\nSubject: '+escapeHeader(subject)+'\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary="anifuze-boundary"\r\n';
 const body='--anifuze-boundary\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n'+textBody+'\r\n--anifuze-boundary\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n'+html+'\r\n--anifuze-boundary--\r\n.';
 await command(socket,[250],headers+body);
 await command(socket,[221],'QUIT');socket.end();
}

export async function sendEmail({to,subject,html,text='',templateId=null}){
 const recipient=String(to||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient))throw new Error('Invalid recipient email.');
 const sub=String(subject||'').trim();if(!sub)throw new Error('Email subject is required.');
 try{await smtpSend(recipient,sub,html,text);await query('INSERT INTO af_email_log(id,recipient,template_id,subject,status,created_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP)',[id(),recipient,templateId,sub,'sent']);return {ok:true};}
 catch(e){await query('INSERT INTO af_email_log(id,recipient,template_id,subject,status,error,created_at) VALUES($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)',[id(),recipient,templateId,sub,'failed',String(e.message).slice(0,2000)]);throw e;}
}

export async function testEmail(to){const s=await getEmailSettings();return sendEmail({to,subject:'AniFuze SMTP test',text:'Your AniFuze email configuration is working.',html:'<h2>AniFuze SMTP test</h2><p>Your email configuration is working.</p>'});}

export async function ensureEmailTemplates(){
 const templates=[
  ['verify-email','Verify your AniFuze email','<h2>Verify your email</h2><p>Hello {{username}},</p><p>Use this code to verify your account:</p><p><strong>{{code}}</strong></p>','Hello {{username}},\n\nYour verification code is {{code}}.'],
  ['reset-password','Reset your AniFuze password','<h2>Password reset</h2><p>Hello {{username}},</p><p>Use this code to reset your password:</p><p><strong>{{code}}</strong></p>','Hello {{username}},\n\nYour password reset code is {{code}}.'],
  ['notification','{{title}}','<h2>{{title}}</h2><p>{{message}}</p>','{{title}}\n\n{{message}}']
 ];
 for(const [tid,sub,html,text] of templates)await query(`INSERT INTO af_email_templates(id,name,subject,html,text,created_at,updated_at) VALUES($1,$1,$2,$3,$4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(id) DO NOTHING`,[tid,sub,html,text]);
}
export async function listEmailTemplates(){await ensureEmailTemplates();return (await query('SELECT id,name,subject,html,text,enabled,created_at,updated_at FROM af_email_templates ORDER BY id')).rows;}
export async function updateEmailTemplate(templateId,input={}){
 const r=await query('SELECT id FROM af_email_templates WHERE id=$1',[String(templateId)]);if(!r.rows[0])throw new Error('Email template not found.');
 await query('UPDATE af_email_templates SET subject=$2,html=$3,text=$4,enabled=$5,updated_at=CURRENT_TIMESTAMP WHERE id=$1',[templateId,String(input.subject||''),String(input.html||''),String(input.text||''),input.enabled===undefined?true:Boolean(input.enabled)]);
 return (await query('SELECT id,name,subject,html,text,enabled,created_at,updated_at FROM af_email_templates WHERE id=$1',[templateId])).rows[0];
}

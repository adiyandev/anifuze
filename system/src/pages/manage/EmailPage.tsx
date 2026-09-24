import {useEffect,useState} from 'react';

type Settings={enabled:boolean;host:string;port:number;secure:boolean;username:string;from_email:string;from_name:string};
type Template={id:string;name:string;subject:string;html:string;text:string;enabled:boolean};

export function EmailPage(){
 const[settings,setSettings]=useState<Settings>({enabled:false,host:'',port:587,secure:false,username:'',from_email:'',from_name:'AniFuze'});
 const[password,setPassword]=useState('');const[templates,setTemplates]=useState<Template[]>([]);const[testTo,setTestTo]=useState('');const[status,setStatus]=useState('');const[loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{const[a,b]=await Promise.all([fetch('/api/admin/email/settings'),fetch('/api/admin/email/templates')]);const aj=await a.json(),bj=await b.json();if(aj.ok)setSettings(aj.settings);if(bj.ok)setTemplates(bj.templates);if(!aj.ok)throw new Error(aj.error||'Unable to load email settings.');}catch(e){setStatus(e instanceof Error?e.message:'Unable to load email settings.')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const save=async()=>{setStatus('Saving…');try{const r=await fetch('/api/admin/email/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...settings,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Save failed.');setSettings(d.settings);setPassword('');setStatus('Saved.')}catch(e){setStatus(e instanceof Error?e.message:'Save failed.')}}
 const test=async()=>{setStatus('Sending test…');try{const r=await fetch('/api/admin/email/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:testTo})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Test failed.');setStatus('Test email sent.')}catch(e){setStatus(e instanceof Error?e.message:'Test failed.')}}
 const saveTemplate=async(t:Template)=>{const r=await fetch('/api/admin/email/templates/'+encodeURIComponent(t.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(t)});const d=await r.json();if(r.ok)setTemplates(x=>x.map(v=>v.id===t.id?d.template:v));setStatus(r.ok?'Template saved.':(d.error||'Template save failed.'))};
 if(loading)return <section className="content-page"><div className="empty-state">Loading email settings…</div></section>;
 return <section className="content-page">
  <div className="page-heading"><div><h1>Email</h1><p>Configure SMTP delivery, test outbound mail, and edit system email templates.</p></div></div>
  {status&&<div className="empty-state">{status}</div>}
  <div className="form-grid">
   <label><span>Enabled</span><input type="checkbox" checked={settings.enabled} onChange={e=>setSettings({...settings,enabled:e.target.checked})}/></label>
   <label><span>SMTP host</span><input value={settings.host} onChange={e=>setSettings({...settings,host:e.target.value})} placeholder="smtp.example.com"/></label>
   <label><span>Port</span><input type="number" value={settings.port} onChange={e=>setSettings({...settings,port:Number(e.target.value)})}/></label>
   <label><span>Secure TLS</span><input type="checkbox" checked={settings.secure} onChange={e=>setSettings({...settings,secure:e.target.checked})}/></label>
   <label><span>Username</span><input value={settings.username} onChange={e=>setSettings({...settings,username:e.target.value})}/></label>
   <label><span>Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Leave blank to keep current"/></label>
   <label><span>From email</span><input type="email" value={settings.from_email} onChange={e=>setSettings({...settings,from_email:e.target.value})}/></label>
   <label><span>From name</span><input value={settings.from_name} onChange={e=>setSettings({...settings,from_name:e.target.value})}/></label>
  </div>
  <div className="button-row"><button className="button" onClick={save}>Save SMTP settings</button></div>
  <div className="form-grid"><label><span>Test recipient</span><input type="email" value={testTo} onChange={e=>setTestTo(e.target.value)} placeholder="you@example.com"/></label><div><span> </span><button className="button ghost" disabled={!testTo} onClick={test}>Send test email</button></div></div>
  <div className="notification-preferences"><strong>Email templates</strong><p>Supported placeholders include <code>{'{{username}}'}</code>, <code>{'{{code}}'}</code>, <code>{'{{title}}'}</code>, and <code>{'{{message}}'}</code>.</p></div>
  <div className="notification-list">{templates.map(t=><article className="notification-card" key={t.id}><div className="notification-copy"><strong>{t.name}</strong><label><span>Subject</span><input value={t.subject} onChange={e=>setTemplates(x=>x.map(v=>v.id===t.id?{...v,subject:e.target.value}:v))}/></label><label><span>HTML</span><textarea rows={6} value={t.html} onChange={e=>setTemplates(x=>x.map(v=>v.id===t.id?{...v,html:e.target.value}:v))}/></label><label><span>Plain text</span><textarea rows={4} value={t.text} onChange={e=>setTemplates(x=>x.map(v=>v.id===t.id?{...v,text:e.target.value}:v))}/></label><button className="button ghost" onClick={()=>saveTemplate(t)}>Save template</button></div></article>)}</div>
 </section>;
}

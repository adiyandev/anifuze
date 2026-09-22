import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Database,ShieldCheck,Server,CheckCircle2,AlertTriangle,ArrowRight,Loader2} from 'lucide-react';

type Check={name:string;ok:boolean;detail:string};
type Status={locked:boolean;requirements:{ok:boolean;checks:Check[]};license:{valid:boolean;status:string};identity:{installationId:string;domain:string;licenseKey:string}};
const api=(path:string,options?:RequestInit)=>fetch(path,{headers:{'Content-Type':'application/json'},...options}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||'Request failed');return data});

export function InstallerPage(){
 const navigate=useNavigate();
 const[step,setStep]=useState(0);const[status,setStatus]=useState<Status|null>(null);const[busy,setBusy]=useState(false);const[error,setError]=useState('');
 const[db,setDb]=useState({client:'postgres',host:'127.0.0.1',port:'5432',name:'anifuze',user:'',password:'',ssl:false});
 const[admin,setAdmin]=useState({email:'',password:'',confirm:''});
 const load=async()=>{setError('');try{setStatus(await api('/api/installer/status'))}catch(e){setError(e instanceof Error?e.message:'Installer API unavailable')}};
 useEffect(()=>{load()},[]);
 const next=async()=>{
  setError('');
  if(step===0){setBusy(true);try{const s=await api('/api/installer/status');setStatus(s);if(s.locked){setError('This AniFuze installation is already locked.');return}setStep(1)}catch(e){setError(e instanceof Error?e.message:'Installer API unavailable')}finally{setBusy(false)}return}
  if(step===1){setBusy(true);try{const s=await api('/api/installer/status');if(!s.requirements.ok)throw new Error('Fix the failed server requirements before continuing.');setStatus(s);setStep(2)}catch(e){setError(e instanceof Error?e.message:'Requirements check failed')}finally{setBusy(false)}return}
  if(step===2){if(!db.host||!db.name||!db.user){setError('Database host, name, and username are required.');return}setBusy(true);try{await api('/api/installer/database',{method:'POST',body:JSON.stringify(db)});setStep(3)}catch(e){setError(e instanceof Error?e.message:'Database connection failed')}finally{setBusy(false)}return}
  if(step===3){if(!admin.email.includes('@')||admin.password.length<12||admin.password!==admin.confirm){setError('Use a valid email, a password of at least 12 characters, and matching confirmation.');return}setBusy(true);try{await api('/api/installer/install',{method:'POST',body:JSON.stringify({database:db,admin})});setStep(4)}catch(e){setError(e instanceof Error?e.message:'Installation failed')}finally{setBusy(false)}}
 };
 const steps=['Welcome','Requirements','Database','Owner account','Complete'];
 return <main className="installer-page"><section className="installer-card">
  <div className="installer-head"><div className="installer-logo">✦</div><div><b>AniFuze Installer</b><small>Customer installation wizard</small></div><span>v1.0</span></div>
  <div className="installer-steps">{steps.map((x,i)=><div className={i===step?'active':i<step?'done':''} key={x}><i>{i<step?<CheckCircle2 size={14}/>:i+1}</i><span>{x}</span></div>)}</div>
  {step===0&&<div className="installer-intro"><div className="installer-icon"><ShieldCheck/></div><h1>Install AniFuze</h1><p>Set up your customer-owned database, verify your server, and create the initial Owner account.</p><div className="installer-features"><span><Server size={16}/> Server checks</span><span><Database size={16}/> Database setup</span><span><ShieldCheck size={16}/> Secure installation</span></div></div>}
  {step===1&&<div><h2>Server requirements</h2><p className="muted">Every required check must pass before installation.</p><div className="installer-checks">{status?.requirements.checks.map(c=><div key={c.name}><span className={c.ok?'ok':'bad'}>{c.ok?<CheckCircle2 size={17}/>:<AlertTriangle size={17}/>}</span><b>{c.name}</b><small>{c.detail}</small></div>)}</div></div>}
  {step===2&&<div><h2>Customer database</h2><p className="muted">Credentials are sent only to the installer API over HTTPS and are never exposed to the public React app.</p><div className="installer-form"><label>Database engine<select value={db.client} onChange={e=>setDb({...db,client:e.target.value,port:e.target.value==='postgres'?'5432':'3306'})}><option value="postgres">PostgreSQL</option><option value="mysql">MySQL</option><option value="mariadb">MariaDB</option></select></label><label>Host<input value={db.host} onChange={e=>setDb({...db,host:e.target.value})}/></label><label>Port<input value={db.port} onChange={e=>setDb({...db,port:e.target.value})}/></label><label>Database name<input value={db.name} onChange={e=>setDb({...db,name:e.target.value})}/></label><label>Username<input value={db.user} onChange={e=>setDb({...db,user:e.target.value})}/></label><label>Password<input type="password" value={db.password} onChange={e=>setDb({...db,password:e.target.value})}/></label><label className="installer-check"><input type="checkbox" checked={db.ssl} onChange={e=>setDb({...db,ssl:e.target.checked})}/> Use TLS/SSL</label></div></div>}
  {step===3&&<div><h2>Create Owner account</h2><p className="muted">This becomes the first account for the dedicated <code>/admin</code> area. Production authentication will enforce 2FA.</p><div className="installer-form"><label>Email<input type="email" value={admin.email} onChange={e=>setAdmin({...admin,email:e.target.value})}/></label><label>Password<input type="password" minLength={12} value={admin.password} onChange={e=>setAdmin({...admin,password:e.target.value})}/></label><label>Confirm password<input type="password" value={admin.confirm} onChange={e=>setAdmin({...admin,confirm:e.target.value})}/></label></div></div>}
  {step===4&&<div className="installer-success"><CheckCircle2 size={54}/><h1>Installation complete</h1><p>AniFuze is installed and the installer is now locked.</p><button className="button" onClick={()=>navigate("/admin/login")}>Open Admin Panel <ArrowRight size={16}/></button></div>}
  {error&&<div className="installer-error"><AlertTriangle size={16}/>{error}</div>}
  {step<4&&<div className="installer-actions"><button className="button ghost" disabled={step===0||busy} onClick={()=>setStep(step-1)}>Back</button><button className="button" disabled={busy} onClick={next}>{busy?<><Loader2 size={16} className="spin"/> Working…</>:step===0?'Begin installation':step===3?'Install AniFuze':'Continue'} <ArrowRight size={16}/></button></div>}
 </section></main>
}
import {useEffect,useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertTriangle,ArrowLeft,ArrowRight,Check,CheckCircle2,Database,KeyRound,Loader2,LockKeyhole,Mail,Server,ShieldCheck,Sparkles} from 'lucide-react';
import './installer.css';

type CheckItem={name:string;ok:boolean;detail:string};
type Status={locked:boolean;requirements:{ok:boolean;checks:CheckItem[]};license:{valid:boolean;status:string}};
const api=async(path:string,options?:RequestInit)=>{
 const response=await fetch(path,{headers:{'Content-Type':'application/json',...(options?.headers||{})},...options});
 const text=await response.text();
 let data:any={};
 try{data=text?JSON.parse(text):{}}catch{throw new Error(text||'Installer returned an invalid response.')}
 if(!response.ok)throw new Error(data.error||'Request failed.');
 return data;
};

const steps=[
 {label:'Welcome',icon:Sparkles},
 {label:'License',icon:KeyRound},
 {label:'Requirements',icon:Server},
 {label:'Database',icon:Database},
 {label:'Owner',icon:ShieldCheck},
 {label:'Complete',icon:CheckCircle2}
];

export function InstallerPage(){
 const navigate=useNavigate();
 const[step,setStep]=useState(0);
 const[status,setStatus]=useState<Status|null>(null);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState('');
 const[licenseKey,setLicenseKey]=useState('');
 const[db,setDb]=useState({client:'postgres',host:'127.0.0.1',port:'5432',name:'anifuze',user:'',password:'',ssl:false});
 const[admin,setAdmin]=useState({email:'',password:'',confirm:''});
 const[loading,setLoading]=useState(true);

 const load=async()=>{
  setError('');setLoading(true);
  try{setStatus(await api('/api/installer/status'))}
  catch(e){setError(e instanceof Error?e.message:'Installer API unavailable.')}
  finally{setLoading(false)}
 };
 useEffect(()=>{load()},[]);

 const requirementsOk=Boolean(status?.requirements.ok);
 const passwordStrength=useMemo(()=>{
  const p=admin.password;
  if(!p)return 'Use at least 12 characters';
  if(p.length<12)return 'Too short';
  if(!/[A-Z]/.test(p)||!/[a-z]/.test(p)||!/[0-9]/.test(p))return 'Add uppercase, lowercase and a number';
  return 'Strong password';
 },[admin.password]);

 const next=async()=>{
  setError('');
  if(step===0){
   if(status?.locked){setError('This installation is already locked.');return}
   setStep(1);return;
  }
  if(step===1){
   if(!licenseKey.trim()){setError('Enter your AniFuze product key.');return}
   setBusy(true);
   try{const result=await api('/api/installer/license',{method:'POST',body:JSON.stringify({licenseKey})});setStatus(s=>s?{...s,license:result.license}:s);setStep(2)}
   catch(e){setError(e instanceof Error?e.message:'License verification failed.')}
   finally{setBusy(false)}
   return;
  }
  if(step===2){
   if(!requirementsOk){setError('Resolve every failed server requirement before continuing.');return}
   setStep(3);return;
  }
  if(step===3){
   if(!db.host||!db.name||!db.user){setError('Database host, name, and username are required.');return}
   setBusy(true);
   try{await api('/api/installer/database',{method:'POST',body:JSON.stringify(db)});setStep(4)}
   catch(e){setError(e instanceof Error?e.message:'Database connection failed.')}
   finally{setBusy(false)}
   return;
  }
  if(step===4){
   if(!admin.email.includes('@')){setError('Enter a valid owner email.');return}
   if(admin.password.length<12||!/[A-Z]/.test(admin.password)||!/[a-z]/.test(admin.password)||!/[0-9]/.test(admin.password)){setError('Use a strong password with at least 12 characters, uppercase, lowercase and a number.');return}
   if(admin.password!==admin.confirm){setError('Passwords do not match.');return}
   setBusy(true);
   try{await api('/api/installer/install',{method:'POST',body:JSON.stringify({database:db,admin,licenseKey})});setStep(5)}
   catch(e){setError(e instanceof Error?e.message:'Installation failed.')}
   finally{setBusy(false)}
  }
 };

 const back=()=>{setError('');if(!busy&&step>0)setStep(step-1)};

 return <main className="install-shell">
  <div className="install-bg"><span/><span/><span/></div>
  <section className="install-window">
   <header className="install-header">
    <div className="install-brand"><span>✦</span><div><strong>AniFuze</strong><small>INSTALLER</small></div></div>
    <div className="install-security"><LockKeyhole size={14}/> Secure setup</div>
   </header>

   <div className="install-layout">
    <aside className="install-sidebar">
     <div className="install-sidebar-title">Setup</div>
     <nav>{steps.map((item,i)=>{const Icon=item.icon;return <div key={item.label} className={i===step?'current':i<step?'completed':''}><span className="install-step-icon">{i<step?<Check size={14}/>:<Icon size={15}/>}</span><div><b>{item.label}</b>{i===step&&<small>Current step</small>}</div></div>})}</nav>
     <div className="install-sidebar-foot"><ShieldCheck size={16}/><span>Your license and database credentials are handled by the installer API.</span></div>
    </aside>

    <div className="install-content">
     {loading&&<div className="install-loading"><Loader2 className="install-spin" size={30}/><b>Checking your server…</b><span>Preparing the installer</span></div>}

     {!loading&&step===0&&<div className="install-hero">
      <div className="install-icon"><Sparkles size={27}/></div>
      <div className="install-kicker">ANI FUZE · CUSTOMER INSTALLER</div>
      <h1>Bring your anime platform online.</h1>
      <p>We'll verify your license, check the server, connect your database, and create the first Owner account.</p>
      <div className="install-feature-grid"><div><Server/><b>Server ready</b><span>Automatic requirements check</span></div><div><Database/><b>Database setup</b><span>Connection & migrations</span></div><div><ShieldCheck/><b>Protected install</b><span>Installer locks after setup</span></div></div>
     </div>}

     {!loading&&step===1&&<div className="install-panel">
      <div className="install-icon"><KeyRound size={27}/></div><div className="install-kicker">STEP 02</div><h2>Activate your license</h2><p>Enter the product key supplied with your AniFuze purchase. The key is verified before anything is installed.</p>
      <label className="install-field"><span>Product key</span><div className="install-input-wrap"><KeyRound size={16}/><input autoFocus type="password" value={licenseKey} onChange={e=>setLicenseKey(e.target.value)} placeholder="ANIFUZE-XXXX-XXXX-XXXX" autoComplete="off"/></div></label>
      <div className="install-note"><LockKeyhole size={15}/><span>The installer does not store a plaintext key in the browser.</span></div>
     </div>}

     {!loading&&step===2&&<div className="install-panel">
      <div className="install-kicker">STEP 03</div><h2>Check server requirements</h2><p>Everything below must pass before AniFuze can be installed on this server.</p>
      <div className="install-check-list">{status?.requirements.checks.map(c=><div key={c.name} className={c.ok?'pass':'fail'}><span>{c.ok?<CheckCircle2 size={18}/>:<AlertTriangle size={18}/>}</span><div><b>{c.name}</b><small>{c.detail}</small></div><strong>{c.ok?'PASS':'FIX'}</strong></div>)}</div>
     </div>}

     {!loading&&step===3&&<div className="install-panel">
      <div className="install-icon"><Database size={27}/></div><div className="install-kicker">STEP 04</div><h2>Connect your database</h2><p>Use the database credentials provided by your hosting provider. We'll test the connection before installation.</p>
      <div className="install-form">
       <label>Database engine<select value={db.client} onChange={e=>setDb({...db,client:e.target.value,port:e.target.value==='postgres'?'5432':'3306'})}><option value="postgres">PostgreSQL</option><option value="mysql">MySQL</option><option value="mariadb">MariaDB</option></select></label>
       <label>Host<input value={db.host} onChange={e=>setDb({...db,host:e.target.value})}/></label>
       <label>Port<input value={db.port} onChange={e=>setDb({...db,port:e.target.value})}/></label>
       <label>Database name<input value={db.name} onChange={e=>setDb({...db,name:e.target.value})}/></label>
       <label>Username<input value={db.user} onChange={e=>setDb({...db,user:e.target.value})}/></label>
       <label>Password<input type="password" value={db.password} onChange={e=>setDb({...db,password:e.target.value})}/></label>
       <label className="install-check"><input type="checkbox" checked={db.ssl} onChange={e=>setDb({...db,ssl:e.target.checked})}/><span>Use encrypted database connection</span></label>
      </div>
     </div>}

     {!loading&&step===4&&<div className="install-panel">
      <div className="install-icon"><ShieldCheck size={27}/></div><div className="install-kicker">STEP 05</div><h2>Create the Owner account</h2><p>This account will control the AniFuze administration panel. Choose credentials you can keep secure.</p>
      <div className="install-form install-owner-form">
       <label className="wide">Owner email<div className="install-input-wrap"><Mail size={16}/><input type="email" value={admin.email} onChange={e=>setAdmin({...admin,email:e.target.value})} placeholder="admin@example.com"/></div></label>
       <label>Password<input type="password" minLength={12} value={admin.password} onChange={e=>setAdmin({...admin,password:e.target.value})}/><small className={passwordStrength==='Strong password'?'strong':''}>{passwordStrength}</small></label>
       <label>Confirm password<input type="password" value={admin.confirm} onChange={e=>setAdmin({...admin,confirm:e.target.value})}/></label>
      </div>
     </div>}

     {!loading&&step===5&&<div className="install-complete">
      <div className="install-complete-icon"><CheckCircle2 size={48}/></div><div className="install-kicker">INSTALLATION COMPLETE</div><h1>AniFuze is ready.</h1><p>Your database was configured, the Owner account was created, and the installer has been locked.</p>
      <div className="install-complete-grid"><span><Check size={15}/> License activated</span><span><Check size={15}/> Database migrated</span><span><Check size={15}/> Installer locked</span></div>
      <button className="install-primary" onClick={()=>navigate('/admin/login')}>Open Admin Panel <ArrowRight size={16}/></button>
     </div>}

     {error&&<div className="install-error"><AlertTriangle size={16}/><span>{error}</span></div>}

     {!loading&&step<5&&<footer className="install-actions"><button className="install-secondary" disabled={step===0||busy} onClick={back}><ArrowLeft size={16}/> Back</button><button className="install-primary" disabled={busy} onClick={next}>{busy?<><Loader2 size={16} className="install-spin"/> Working…</>:step===0?'Begin installation':step===4?'Install AniFuze':'Continue'}{!busy&&<ArrowRight size={16}/>}</button></footer>}
    </div>
   </div>
  </section>
 </main>;
}

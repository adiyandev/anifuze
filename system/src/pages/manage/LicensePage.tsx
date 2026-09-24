import {useEffect,useState} from 'react';
interface License{status:string;key_hint?:string;plan?:string;customer?:string;domain?:string;expires_at?:string|null;last_checked_at?:string|null;last_error?:string|null}
export function LicensePage(){
 const [license,setLicense]=useState<License|null>(null);const [key,setKey]=useState('');const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/admin/license');const j=await r.json();if(!r.ok)throw new Error(j.error||'Failed to load license');setLicense(j.license);}catch(e){setError(e instanceof Error?e.message:'Failed to load license');}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const verify=async()=>{setBusy(true);setError('');setMessage('');try{const r=await fetch('/api/admin/license/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({licenseKey:key})});const j=await r.json();if(!r.ok)throw new Error(j.error||'License verification failed');setLicense(j.license);setKey('');setMessage(j.license.status==='active'?'License verified successfully.':'License check completed, but the installation is not active.');}catch(e){setError(e instanceof Error?e.message:'License verification failed');}finally{setBusy(false);}};
 const clear=async()=>{if(!confirm('Clear the stored license from this installation?'))return;setBusy(true);setError('');try{const r=await fetch('/api/admin/license',{method:'DELETE'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Failed to clear license');setLicense(j.license);setMessage('License cleared.');}catch(e){setError(e instanceof Error?e.message:'Failed to clear license');}finally{setBusy(false);}};
 const status=license?.status||'unlicensed';const active=status==='active';
 return <div className="system-info-page license-page admin-page">
  <div className="page-heading"><div><span className="system-kicker">SYSTEM</span><h2>Licensing</h2><p>Manage the product license assigned to this AniFuze installation.</p></div><div className="page-actions"><button className="btn-secondary" onClick={load} disabled={loading||busy}>Refresh</button></div></div>
  {error&&<div className="admin-alert error">{error}</div>}{message&&<div className="maintenance-success">{message}</div>}
  <div className="license-grid">
   <section className="admin-panel"><div className="panel-heading"><div><h3>License status</h3><p>Only a masked key hint is stored for display.</p></div><span className={'license-badge '+status}>{status}</span></div>
    {loading?<div className="system-checks">Loading license…</div>:<div className="license-details"><div><span>Key</span><strong>{license?.key_hint||'Not configured'}</strong></div><div><span>Plan</span><strong>{license?.plan||'—'}</strong></div><div><span>Customer</span><strong>{license?.customer||'—'}</strong></div><div><span>Licensed domain</span><strong>{license?.domain||'—'}</strong></div><div><span>Expires</span><strong>{license?.expires_at?new Date(license.expires_at).toLocaleString():'—'}</strong></div><div><span>Last checked</span><strong>{license?.last_checked_at?new Date(license.last_checked_at).toLocaleString():'Never'}</strong></div></div>}
    {license?.last_error&&<div className="license-warning">{license.last_error}</div>}
   </section>
   <section className="admin-panel"><div className="panel-heading"><div><h3>Verify license</h3><p>Enter a product key to verify this installation with the licensing service.</p></div></div>
    <label className="maintenance-field"><span>Product key</span><input value={key} onChange={e=>setKey(e.target.value)} placeholder="ANIFUZE-XXXX-XXXX-XXXX" autoComplete="off"/></label>
    <button className="btn-primary" onClick={verify} disabled={busy||!key.trim()}>{busy?'Verifying…':'Verify license'}</button>
    {active&&<button className="btn-secondary license-clear" onClick={clear} disabled={busy}>Clear license</button>}
   </section>
  </div>
  <section className="admin-panel license-info"><div className="panel-heading"><div><h3>Installation identity</h3><p>These values are sent to the licensing service during verification.</p></div></div><div className="license-install"><div><span>Installation ID</span><strong>Configured server-side</strong></div><div><span>Domain</span><strong>Configured server-side</strong></div><div><span>Application</span><strong>AniFuze</strong></div></div></section>
 </div>;
}

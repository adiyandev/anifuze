import {useEffect,useState} from 'react';

interface Maintenance{enabled:boolean;title:string;message:string;estimated_minutes:number|null;updated_at?:string}

export function MaintenancePage(){
 const [data,setData]=useState<Maintenance|null>(null);
 const [form,setForm]=useState({enabled:false,title:'',message:'',estimated_minutes:''});
 const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState(''); const [saved,setSaved]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/admin/maintenance');const j=await r.json();if(!r.ok)throw new Error(j.error||'Failed to load maintenance settings');const m=j.maintenance as Maintenance;setData(m);setForm({enabled:m.enabled,title:m.title,message:m.message,estimated_minutes:m.estimated_minutes==null?'':String(m.estimated_minutes)});}catch(e){setError(e instanceof Error?e.message:'Failed to load maintenance settings');}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const save=async()=>{setSaving(true);setError('');setSaved('');try{const r=await fetch('/api/admin/maintenance',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,estimated_minutes:form.estimated_minutes||null})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Failed to save maintenance settings');setData(j.maintenance);setSaved('Maintenance settings saved.');}catch(e){setError(e instanceof Error?e.message:'Failed to save maintenance settings');}finally{setSaving(false);}};
 return <div className="system-info-page maintenance-page admin-page">
  <div className="page-heading"><div><span className="system-kicker">SYSTEM</span><h2>Maintenance</h2><p>Control the public maintenance state and message shown during planned downtime.</p></div><div className="page-actions"><button className="btn-secondary" onClick={load} disabled={loading||saving}>Refresh</button><button className="btn-primary" onClick={save} disabled={saving||loading}>{saving?'Saving…':'Save changes'}</button></div></div>
  {error&&<div className="admin-alert error">{error}</div>}{saved&&<div className="maintenance-success">{saved}</div>}
  {loading&&!data?<div className="system-checks">Loading maintenance settings…</div>:<div className="maintenance-grid">
   <section className="admin-panel"><div className="panel-heading"><div><h3>Maintenance mode</h3><p>Keep this disabled during normal operation.</p></div><label className="maintenance-toggle"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/><span>{form.enabled?'Enabled':'Disabled'}</span></label></div>
    <label className="maintenance-field"><span>Title</span><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} maxLength={255}/></label>
    <label className="maintenance-field"><span>Message</span><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={7} maxLength={5000}/></label>
    <label className="maintenance-field"><span>Estimated downtime (minutes)</span><input type="number" min="1" max="10080" value={form.estimated_minutes} onChange={e=>setForm({...form,estimated_minutes:e.target.value})} placeholder="Optional"/></label>
   </section>
   <section className="admin-panel maintenance-preview"><div className="panel-heading"><div><h3>Public preview</h3><p>This is the state customers will see when maintenance mode is active.</p></div></div><div className="maintenance-preview-card"><span className="system-kicker">ANIFUZE</span><h3>{form.title||'AniFuze is under maintenance'}</h3><p>{form.message||'We are performing scheduled maintenance. Please check back soon.'}</p>{form.estimated_minutes&&<strong>Estimated downtime: {form.estimated_minutes} minutes</strong>}</div></section>
  </div>}
 </div>;
}

import {useEffect,useState} from 'react';
import {Button,Card} from '../../components/ui';
import {CheckCircle2,Chrome,ExternalLink,Info,ShieldCheck} from 'lucide-react';

export function OAuthPage(){
 const{0:data,1:setData}=useState<any>({google_enabled:false,google_client_id:'',google_client_secret:'',google_redirect_uri:''});
 const[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/admin/oauth');const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load OAuth settings');setData({...d.oauth})}catch(e:any){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const save=async()=>{setSaving(true);setMessage('');setError('');try{const r=await fetch('/api/admin/oauth',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not save OAuth settings');setData({...data,...d.oauth,google_client_secret:''});setMessage('OAuth settings saved successfully.')}catch(e:any){setError(e.message)}finally{setSaving(false)}};
 if(loading)return <section className="form-page"><div className="page-heading"><p>Loading OAuth settings…</p></div></section>;
 return <section className="form-page">
  <div className="page-heading"><p>Configure third-party sign-in providers for your customer-facing login and registration pages.</p><Button onClick={save} disabled={saving}>{saving?'Saving…':'Save OAuth settings'}</Button></div>
  <Card title="Google Sign-In">
   <div className="notice"><Chrome size={16}/><span><b>Google OAuth 2.0</b> · {data.google_enabled?'Enabled':'Disabled'}{data.google_configured?' · Credentials configured':''}</span></div>
   <div className="form-grid">
    <label>Google sign-in<select value={data.google_enabled?'true':'false'} onChange={e=>setData({...data,google_enabled:e.target.value==='true'})}><option value="false">Disabled</option><option value="true">Enabled</option></select></label>
    <label>Client ID<input value={data.google_client_id||''} onChange={e=>setData({...data,google_client_id:e.target.value})} placeholder="xxxx.apps.googleusercontent.com"/></label>
    <label className="wide">Client Secret<input type="password" value={data.google_client_secret||''} onChange={e=>setData({...data,google_client_secret:e.target.value})} placeholder={data.google_configured?'Leave blank to keep current secret':'Enter Google client secret'} autoComplete="new-password"/></label>
    <label className="wide">Authorized redirect URI<input value={data.google_redirect_uri||''} onChange={e=>setData({...data,google_redirect_uri:e.target.value})} placeholder="https://your-domain.com/api/auth/google/callback"/></label>
   </div>
   <div className="notice"><ShieldCheck size={16}/><span>Client secrets are encrypted before being stored. They are never returned to the browser.</span></div>
   {data.google_enabled&&<div className="oauth-checks"><span><CheckCircle2 size={14}/> Google sign-in enabled</span>{data.google_configured&&<span><CheckCircle2 size={14}/> Credentials configured</span>}<span><ExternalLink size={14}/> Add the redirect URI to Google Cloud Console</span></div>}
  </Card>
  <Card title="Google Cloud setup"><p><Info size={15}/> Create an OAuth 2.0 Web application in Google Cloud, add the redirect URI above, then paste the Client ID and Client Secret here.</p></Card>
  {message&&<div className="notice success">{message}</div>}{error&&<div className="notice error">{error}</div>}
 </section>
}
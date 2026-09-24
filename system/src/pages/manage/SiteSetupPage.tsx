import {useEffect,useMemo,useState} from 'react';
import {useApp} from '../../contexts/AppContext';
import {Button,Card} from '../../components/ui';

type Config={site_name:string;tagline:string;description:string;logo_url:string;favicon_url:string;domain:string;support_email:string;primary_color:string;accent_color:string;background_color:string;footer_text:string;social_links:Record<string,string>;setup_completed:boolean};

const empty:Config={site_name:'AniFuze',tagline:'Your anime, your way.',description:'',logo_url:'',favicon_url:'',domain:'',support_email:'',primary_color:'#ff2d8d',accent_color:'#7c3aed',background_color:'#07070a',footer_text:'',social_links:{},setup_completed:false};
const checks=(c:Config)=>[
 ['Brand name',Boolean(c.site_name.trim())],
 ['Logo or fallback',true],
 ['Domain',Boolean(c.domain.trim())],
 ['Support email',Boolean(c.support_email.trim())],
 ['Theme colors',Boolean(c.primary_color&&c.accent_color&&c.background_color)],
 ['Footer',Boolean(c.footer_text.trim())],
] as [string,boolean][];

export function SiteSetupPage(){
 const{toast}=useApp();const[c,setC]=useState<Config>(empty);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);const[readiness,setReadiness]=useState<{setupCompleted:boolean;checks:{id:string;label:string;ready:boolean}[];complete:number;total:number}|null>(null);
 const load=async()=>{setLoading(true);try{const r=await fetch('/api/admin/site-config');const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load site configuration.');setC({...empty,...d.config,social_links:d.config.social_links||{}})}catch(e){toast(e instanceof Error?e.message:'Could not load site configuration.','error')}finally{setLoading(false)}};
 useEffect(()=>{load();fetch('/api/admin/site-setup/status').then(r=>r.ok?r.json():Promise.reject()).then(d=>setReadiness(d)).catch(()=>setReadiness(null))},[]);
 const items=useMemo(()=>readiness?.checks?.map(x=>[x.label,x.ready] as [string,boolean])||checks(c),[c,readiness]);const complete=readiness?.complete??items.filter(x=>x[1]).length;const set=(key:keyof Config,value:any)=>setC(x=>({...x,[key]:value}));
 const save=async(publish=false)=>{setSaving(true);try{const r=await fetch('/api/admin/site-config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...c,setup_completed:publish||c.setup_completed})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Save failed.');setC(d.config);toast(publish?'Site setup published.':'Site configuration saved.');if(publish)window.location.href='/'}catch(e){toast(e instanceof Error?e.message:'Save failed.','error')}finally{setSaving(false)}};
 if(loading)return <section className="form-page"><div className="page-heading"><p>Loading site configuration…</p></div></section>;
 return <section className="form-page">
  <div className="page-heading"><div><p>Configure the customer site from one place. Specialized controls remain available in Design, Streaming, SEO, Email, and OAuth.</p></div><div className="actions"><Button variant="ghost" onClick={load} disabled={saving}>Refresh</Button><Button onClick={()=>save(false)} disabled={saving}>Save</Button><Button onClick={()=>save(true)} disabled={saving||complete<items.length}>{c.setup_completed?'Republish':'Publish site'}</Button></div></div>
  <Card title="Setup progress"><div className="stats"><div><strong>{readiness?.setupCompleted?'Published':'Draft'}</strong><span>site status</span></div><div><strong>{complete}/{items.length}</strong><span>setup checks</span></div></div><div className="healthrows">{items.map(([label,ok])=><div key={label}><span className={'dot '+(ok?'':'warn')}/><b>{label}</b><small>{ok?'Ready':'Needs attention'}</small></div>)}</div></Card>
  <Card title="Brand"><div className="form-grid">
   <label>Site name<input value={c.site_name} onChange={e=>set('site_name',e.target.value)} /></label>
   <label>Tagline<input value={c.tagline} onChange={e=>set('tagline',e.target.value)} /></label>
   <label className="wide">Description<textarea value={c.description} onChange={e=>set('description',e.target.value)} /></label>
   <label>Logo URL<input value={c.logo_url} onChange={e=>set('logo_url',e.target.value)} placeholder="/uploads/logos/logo.png" /></label>
   <label>Favicon URL<input value={c.favicon_url} onChange={e=>set('favicon_url',e.target.value)} placeholder="/uploads/logos/favicon.png" /></label>
  </div></Card>
  <Card title="Site & contact"><div className="form-grid">
   <label>Domain<input value={c.domain} onChange={e=>set('domain',e.target.value)} placeholder="anime.example.com" /></label>
   <label>Support email<input type="email" value={c.support_email} onChange={e=>set('support_email',e.target.value)} /></label>
   <label className="wide">Footer text<textarea value={c.footer_text} onChange={e=>set('footer_text',e.target.value)} /></label>
  </div></Card>
  <Card title="Social links"><div className="form-grid"><label>Discord<input value={c.social_links.discord||''} onChange={e=>set('social_links',{...c.social_links,discord:e.target.value})} placeholder="https://discord.gg/..." /></label><label>Twitter / X<input value={c.social_links.twitter||''} onChange={e=>set('social_links',{...c.social_links,twitter:e.target.value})} placeholder="https://x.com/..." /></label><label>YouTube<input value={c.social_links.youtube||''} onChange={e=>set('social_links',{...c.social_links,youtube:e.target.value})} placeholder="https://youtube.com/..." /></label></div></Card>
  <Card title="Theme"><div className="form-grid">
   <label>Primary color<input type="text" value={c.primary_color} onChange={e=>set('primary_color',e.target.value)} /></label>
   <label>Accent color<input type="text" value={c.accent_color} onChange={e=>set('accent_color',e.target.value)} /></label>
   <label>Background color<input type="text" value={c.background_color} onChange={e=>set('background_color',e.target.value)} /></label>
  </div></Card>
 </section>;
}

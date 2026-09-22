import {useEffect,useState} from 'react';
import {Button,Card} from '../../components/ui';
import {useApp} from '../../contexts/AppContext';

const DEFAULT={site_title:'AniFuze',description:'',keywords:'',og_image:null,robots:'index,follow',sitemap_enabled:true,canonical_url:null,anime_seo_enabled:true};

export function SeoPage(){
 const{toast}=useApp();
 const[form,setForm]=useState<any>(DEFAULT);
 const[loading,setLoading]=useState(true);
 const[saving,setSaving]=useState(false);

 useEffect(()=>{fetch('/api/admin/seo').then(r=>r.json()).then(d=>{if(!d.ok)throw new Error(d.error||'Could not load SEO settings');setForm(d.seo)}).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false))},[]);

 const save=async()=>{
  setSaving(true);
  try{
   const r=await fetch('/api/admin/seo',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
   const d=await r.json();
   if(!r.ok)throw new Error(d.error||'SEO settings could not be saved');
   setForm(d.seo);
   toast('SEO settings saved');
  }catch(e:any){toast(e.message,'error')}finally{setSaving(false)}
 };

 if(loading)return <section className="form-page"><div className="page-heading"><p>Loading SEO settings…</p></div></section>;

 return <section className="form-page">
  <div className="page-heading"><p>Configure search metadata, social sharing, canonical URLs, robots directives, and the generated sitemap.</p><Button onClick={save} disabled={saving}>{saving?'Saving…':'Save SEO settings'}</Button></div>
  <Card title="Search metadata">
   <div className="form-grid">
    <label>Site title<input maxLength={255} value={form.site_title} onChange={e=>setForm({...form,site_title:e.target.value})}/></label>
    <label className="wide">Meta description<textarea maxLength={5000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
    <label className="wide">Keywords<input maxLength={1000} value={form.keywords} onChange={e=>setForm({...form,keywords:e.target.value})}/></label>
    <label>Open Graph image URL<input value={form.og_image||''} onChange={e=>setForm({...form,og_image:e.target.value||null})}/></label>
    <label>Canonical URL<input value={form.canonical_url||''} onChange={e=>setForm({...form,canonical_url:e.target.value||null})}/></label>
   </div>
  </Card>
  <Card title="Crawling">
   <div className="form-grid">
    <label>Robots directive<select value={form.robots} onChange={e=>setForm({...form,robots:e.target.value})}><option value="index,follow">Index + follow</option><option value="index,nofollow">Index + nofollow</option><option value="noindex,follow">No index + follow</option><option value="noindex,nofollow">No index + nofollow</option></select></label>
    <label>Sitemap<select value={form.sitemap_enabled?'enabled':'disabled'} onChange={e=>setForm({...form,sitemap_enabled:e.target.value==='enabled'})}><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label>
    <label>Anime SEO<select value={form.anime_seo_enabled?'enabled':'disabled'} onChange={e=>setForm({...form,anime_seo_enabled:e.target.value==='enabled'})}><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label>
   </div>
   <p className="notice">AniFuze generates <code>/robots.txt</code> and <code>/sitemap.xml</code> from these settings. No arbitrary URL/page records are created.</p>
  </Card>
 </section>;
}
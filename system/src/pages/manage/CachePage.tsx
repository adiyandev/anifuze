import {useCallback,useEffect,useState} from 'react';

interface Entry{key:string;createdAt:number;expiresAt:number;size:number}
interface Payload{ok:boolean;stats:{entries:number;bytes:number;hits:number;misses:number;sets:number;deletes:number;hitRate:number};entries:Entry[]}
const fmtBytes=(n:number)=>{if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB';};
const fmtTime=(n:number)=>new Date(n).toLocaleString();

export function CachePage(){
 const [data,setData]=useState<Payload|null>(null); const [loading,setLoading]=useState(true); const [busy,setBusy]=useState(''); const [error,setError]=useState('');
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await fetch('/api/admin/cache');const j=await r.json();if(!r.ok)throw new Error(j.error||'Failed to load cache');setData(j);}catch(e){setError(e instanceof Error?e.message:'Failed to load cache');}finally{setLoading(false);}},[]);
 useEffect(()=>{load();},[load]);
 const clear=async()=>{if(!confirm('Clear the entire AniFuze application cache?'))return;setBusy('clear');try{const r=await fetch('/api/admin/cache/clear',{method:'POST'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Failed to clear cache');await load();}catch(e){setError(e instanceof Error?e.message:'Failed to clear cache');}finally{setBusy('');}};
 const remove=async(key:string)=>{setBusy(key);try{const r=await fetch('/api/admin/cache/'+encodeURIComponent(key),{method:'DELETE'});if(!r.ok){const j=await r.json();throw new Error(j.error||'Failed to delete cache entry');}await load();}catch(e){setError(e instanceof Error?e.message:'Failed to delete cache entry');}finally{setBusy('');}};
 const s=data?.stats;
 return <div className="system-info-page admin-page cache-page"><div className="page-heading"><div><span className="system-kicker">SYSTEM</span><h2>Cache</h2><p>Monitor and clear the in-memory application cache.</p></div><div className="page-actions"><button className="btn-secondary" onClick={load} disabled={loading}>Refresh</button><button className="btn-primary" onClick={clear} disabled={!!busy}>{busy==='clear'?'Clearing…':'Clear cache'}</button></div></div>
 {error&&<div className="admin-alert error">{error}</div>}
 {loading&&!data?<div className="system-checks">Loading cache…</div>:<>
 <div className="system-grid"><div className="system-card"><span>Entries</span><strong>{s?.entries??0}</strong></div><div className="system-card"><span>Memory estimate</span><strong>{fmtBytes(s?.bytes??0)}</strong></div><div className="system-card"><span>Hit rate</span><strong>{s?.hitRate??0}%</strong></div><div className="system-card"><span>Operations</span><strong>{(s?.hits??0)+(s?.misses??0)}</strong></div></div>
 <section className="admin-panel"><div className="panel-heading"><div><h3>Cache entries</h3><p>Entries expire automatically according to their TTL.</p></div></div>{data?.entries.length?<div className="cache-table-wrap"><table className="admin-table"><thead><tr><th>Key</th><th>Size</th><th>Created</th><th>Expires</th><th></th></tr></thead><tbody>{data.entries.map(e=><tr key={e.key}><td><code>{e.key}</code></td><td>{fmtBytes(e.size)}</td><td>{fmtTime(e.createdAt)}</td><td>{fmtTime(e.expiresAt)}</td><td><button className="btn-secondary" disabled={!!busy} onClick={()=>remove(e.key)}>{busy===e.key?'…':'Remove'}</button></td></tr>)}</tbody></table></div>:<div className="system-checks">Cache is empty.</div>}</section>
 <section className="admin-panel"><div className="panel-heading"><div><h3>Cache behavior</h3><p>Cache is process-local and intentionally safe to lose on restart. Expired entries are removed when accessed or inspected.</p></div></div></section>
 </>}
 </div>;
}

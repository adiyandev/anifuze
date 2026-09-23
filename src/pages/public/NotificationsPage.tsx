import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {CheckCheck,Info,PlayCircle,Sparkles,TriangleAlert} from 'lucide-react';

type Notice={id:string;title:string;message:string;type:'release'|'info'|'success'|'warning'|'system';createdAt:number;read:boolean};

const KEY='anifuze_demo_notifications';
const READ_KEY='anifuze_notification_read';
const PREF_KEY='anifuze_notification_preferences';
const defaults={releases:true,system:true,account:true};
const seed:Notice[]=[
 {id:'welcome',title:'Welcome to AniFuze',message:'Your notification center is ready. Release alerts and system updates will appear here.',type:'system',createdAt:Date.now(),read:false},
 {id:'release-demo',title:'New episode available',message:'A new episode has been added to your anime catalog.',type:'release',createdAt:Date.now()-3600000,read:false}
];

function isDemo(){return typeof window!=='undefined'&&window.location.hostname.endsWith('github.io');}
function loadPrefs(){try{return {...defaults,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}}catch{return defaults;}}
function loadDemo():Notice[]{try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(value))return value;localStorage.setItem(KEY,JSON.stringify(seed));return seed;}catch{return seed;}}
function loadReadIds(){try{const value=JSON.parse(localStorage.getItem(READ_KEY)||'[]');return new Set(Array.isArray(value)?value.map(String):[]);}catch{return new Set<string>();}}
function saveReadIds(ids:Set<string>){localStorage.setItem(READ_KEY,JSON.stringify([...ids]));}

export function NotificationsPage(){
 const[items,setItems]=useState<Notice[]>([]);
 const[prefs,setPrefs]=useState(loadPrefs);
 const[loading,setLoading]=useState(true);
 const[backend,setBackend]=useState(false);

 useEffect(()=>{
  let active=true;
  if(isDemo()){setItems(loadDemo());setLoading(false);return;}
  fetch('/api/notifications')
   .then(r=>r.ok?r.json():Promise.reject())
   .then(d=>{
    if(!active)return;
    const readIds=loadReadIds();
    setItems((d.notifications||[]).map((x:any)=>({...x,createdAt:new Date(x.created_at).getTime(),read:readIds.has(String(x.id))})));
    setBackend(true);
   })
   .catch(()=>{if(active)setItems([]);})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false};
 },[]);

 const visible=useMemo(()=>items.filter(x=>x.type==='release'?prefs.releases:x.type==='system'?prefs.system:prefs.account),[items,prefs]);
 const unread=useMemo(()=>visible.filter(x=>!x.read).length,[visible]);

 const mark=(id:string)=>{
  setItems(current=>{
   const next=current.map(x=>x.id===id?{...x,read:true}:x);
   if(isDemo())localStorage.setItem(KEY,JSON.stringify(next));else{const ids=loadReadIds();ids.add(id);saveReadIds(ids);}
   return next;
  });
 };
 const markAll=()=>{
  setItems(current=>{
   const next=current.map(x=>({...x,read:true}));
   if(isDemo())localStorage.setItem(KEY,JSON.stringify(next));else{const ids=loadReadIds();next.forEach(x=>ids.add(x.id));saveReadIds(ids);}
   return next;
  });
 };
 const updatePref=(key:keyof typeof defaults)=>{
  setPrefs((p: typeof defaults)=>{const next={...p,[key]:!p[key]};localStorage.setItem(PREF_KEY,JSON.stringify(next));return next;});
 };
 const icon=(type:Notice['type'])=>type==='release'?<PlayCircle size={18}/>:type==='system'?<Sparkles size={18}/>:type==='warning'?<TriangleAlert size={18}/>:<Info size={18}/>;

 return <section className="content-page notification-page">
  <div className="page-heading"><div><p>Release alerts, account updates, and AniFuze system notifications.</p></div><button className="button ghost" onClick={markAll} disabled={!unread}><CheckCheck size={15}/> Mark all read</button></div>
  {!loading&&!backend&&!isDemo()&&<div className="empty-state">Notifications are temporarily unavailable. Please try again shortly.</div>}
  <div className="notification-list">
   {loading?<div className="empty-state">Loading notifications…</div>:visible.length?<>{visible.map(item=><article className={'notification-card'+(item.read?' read':'')} key={item.id}>
    <div className="notification-icon">{icon(item.type)}</div><div className="notification-copy"><div className="notification-title"><strong>{item.title}</strong>{!item.read&&<span className="notification-dot"/>}</div><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
    {!item.read&&<button className="link-button" onClick={()=>mark(item.id)}>Mark read</button>}
   </article>)}</>:backend?<div className="empty-state">You're all caught up.</div>:null}
  </div>
  <div className="notification-preferences"><strong>Notification preferences</strong><label><input type="checkbox" checked={prefs.releases} onChange={()=>updatePref('releases')}/> Release alerts</label><label><input type="checkbox" checked={prefs.account} onChange={()=>updatePref('account')}/> Account updates</label><label><input type="checkbox" checked={prefs.system} onChange={()=>updatePref('system')}/> System notifications</label></div>
  <Link className="link-button" to="/settings">Manage notification preferences →</Link>
 </section>;
}

import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Bell,CheckCheck,Info,PlayCircle,Sparkles} from 'lucide-react';

type Notice={id:string;title:string;message:string;type:'release'|'info'|'system';createdAt:number;read:boolean};

const KEY='anifuze_demo_notifications';
const PREF_KEY='anifuze_notification_preferences';
const seed:Notice[]=[
 {id:'welcome',title:'Welcome to AniFuze',message:'Your notification center is ready. Release alerts and system updates will appear here.',type:'system',createdAt:Date.now(),read:false},
 {id:'release-demo',title:'New episode available',message:'A new episode has been added to your anime catalog.',type:'release',createdAt:Date.now()-3600000,read:false}
];

function read():Notice[]{try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(value))return value;localStorage.setItem(KEY,JSON.stringify(seed));return seed;}catch{return seed;}}
function save(items:Notice[]){localStorage.setItem(KEY,JSON.stringify(items));}

export function NotificationsPage(){
 const[items,setItems]=useState<Notice[]>([]);
 const[prefs,setPrefs]=useState(()=>{try{return JSON.parse(localStorage.getItem(PREF_KEY)||'{"releases":true,"system":true,"account":true}')}catch{return {releases:true,system:true,account:true}}});
 useEffect(()=>setItems(read()),[]);
 const visible=useMemo(()=>items.filter(x=>x.type==='release'?prefs.releases:x.type==='system'?prefs.system:prefs.account),[items,prefs]);
 const unread=useMemo(()=>visible.filter(x=>!x.read).length,[visible]);
 const mark=(id:string)=>setItems(current=>{const next=current.map(x=>x.id===id?{...x,read:true}:x);save(next);return next;});
 const updatePref=(key:string)=>setPrefs((p:any)=>{const next={...p,[key]:!p[key]};localStorage.setItem(PREF_KEY,JSON.stringify(next));return next;});
 const markAll=()=>setItems(current=>{const next=current.map(x=>({...x,read:true}));save(next);return next;});
 const icon=(type:Notice['type'])=>type==='release'?<PlayCircle size={18}/>:type==='system'?<Sparkles size={18}/>:<Info size={18}/>;
 return <section className="content-page notification-page">
  <div className="page-heading"><div><p>Release alerts, account updates, and AniFuze system notifications.</p></div><button className="button ghost" onClick={markAll} disabled={!unread}><CheckCheck size={15}/> Mark all read</button></div>
  <div className="notification-list">
   {!visible.length?<div className="empty-state">You're all caught up.</div>:visible.map(item=><article className={'notification-card'+(item.read?' read':'')} key={item.id}>
    <div className="notification-icon">{icon(item.type)}</div><div className="notification-copy"><div className="notification-title"><strong>{item.title}</strong>{!item.read&&<span className="notification-dot"/>}</div><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
    {!item.read&&<button className="link-button" onClick={()=>mark(item.id)}>Mark read</button>}
   </article>)}
  </div>
  <div className="notification-preferences"><strong>Notification preferences</strong><label><input type="checkbox" checked={prefs.releases} onChange={()=>updatePref('releases')}/> Release alerts</label><label><input type="checkbox" checked={prefs.account} onChange={()=>updatePref('account')}/> Account updates</label><label><input type="checkbox" checked={prefs.system} onChange={()=>updatePref('system')}/> System notifications</label></div>
  <Link className="link-button" to="/settings">Manage notification preferences →</Link>
 </section>;
}

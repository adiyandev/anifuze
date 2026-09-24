import {Link,Outlet,useLocation} from 'react-router-dom';
import {Search,Menu,X,Bell,CalendarDays,Compass,Layers,BarChart3,UserCircle} from 'lucide-react';
import {useEffect,useState,type CSSProperties} from 'react';
import {useApp} from '../contexts/AppContext';

type NavItem={id:string;label:string;path:string;icon?:string|null;visible:boolean;sort_order:number};

const iconFor=(name?:string|null)=>({Compass,Bell,BarChart3,CalendarDays,Layers}[name||'Layers']||Layers);
const isDemo=()=>typeof window!=='undefined'&&window.location.hostname.endsWith('github.io');

function readIds(){try{const value=JSON.parse(localStorage.getItem('anifuze_notification_read')||'[]');return new Set(Array.isArray(value)?value.map(String):[]);}catch{return new Set<string>();}}

function applyMeta(seo:any,path:string){
 const title=String(seo?.site_title||'AniFuze');
 const description=String(seo?.description||'');
 document.title=path==='/'?title:`${title} · ${path.replace(/^\//,'').replace(/-/g,' ')}`;
 const set=(name:string,content:string)=>{let el=document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el)}el.content=content};
 const setProperty=(property:string,content:string)=>{let el=document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.setAttribute('property',property);document.head.appendChild(el)}el.content=content};
 set('description',description);set('keywords',String(seo?.keywords||''));set('robots',String(seo?.robots||'index,follow'));
 setProperty('og:title',document.title);setProperty('og:description',description);setProperty('og:type','website');
 if(seo?.og_image)setProperty('og:image',String(seo.og_image));
 let link=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;
 if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}
 link.href=path==='/'&&seo?.canonical_url?String(seo.canonical_url):window.location.origin+(path||'/');
}

export function PublicLayout(){
 const{settings,role,customerUser,logoutCustomer}=useApp();const location=useLocation();const[open,setOpen]=useState(false);const[nav,setNav]=useState<NavItem[]>([]);const[footer,setFooter]=useState<any>(null);const[unreadNotifications,setUnreadNotifications]=useState(0);const[template,setTemplate]=useState<any>(null);const[siteConfig,setSiteConfig]=useState<any>(null);
 useEffect(()=>{
  let active=true;
  const refresh=async()=>{
   try{
    if(isDemo()){const raw=localStorage.getItem('anifuze_demo_notifications');const items=raw?JSON.parse(raw):[];if(active)setUnreadNotifications(Array.isArray(items)?items.filter((x:any)=>!x.read).length:0);return;}
    const r=await fetch('/api/notifications');if(!r.ok)throw new Error();
    const d=await r.json();const ids=readIds();const items=Array.isArray(d.notifications)?d.notifications:[];if(active)setUnreadNotifications(items.filter((x:any)=>!ids.has(String(x.id))).length);
   }catch{if(active)setUnreadNotifications(0);}
  };
  refresh();
  return()=>{active=false};
 },[location.pathname]);
 useEffect(()=>{const key='anifuze_analytics_session';let session=sessionStorage.getItem(key);if(!session){session=crypto.randomUUID();sessionStorage.setItem(key,session)}fetch('/api/analytics/events',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({event_type:'page_view',session_id:session,path:location.pathname,referrer:document.referrer})}).catch(()=>{})},[location.pathname]);
 useEffect(()=>{let active=true;fetch('/api/site-config').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setSiteConfig(d.config||null)}).catch(()=>{if(active)setSiteConfig(null)});fetch('/api/navigation').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setNav(d.items||[])}).catch(()=>setNav([]));fetch('/api/footer').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setFooter(d.footer)}).catch(()=>{if(active)setFooter(null)});return()=>{active=false}},[]);
 useEffect(()=>{let active=true;fetch('/api/seo').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)applyMeta(d.seo,location.pathname)}).catch(()=>{if(active)document.title=settings.siteName||'AniFuze'});return()=>{active=false}},[location.pathname,settings.siteName]);
 useEffect(()=>{let active=true;const root=document.documentElement;const previous=new Map<string,string>();const applied:string[]=[];fetch('/api/template').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(!active)return;const next=d.template||null;setTemplate(next);const cfg=next?.config&&typeof next.config==='object'?next.config:{};const vars:any={primary:cfg.primary||cfg.primaryColor,accent:cfg.accent||cfg.accentColor,background:cfg.background||cfg.backgroundColor,surface:cfg.surface||cfg.surfaceColor,text:cfg.text||cfg.textColor,muted:cfg.muted||cfg.mutedColor,radius:cfg.radius||cfg.cardRadius,font:cfg.font||cfg.fontFamily};Object.entries(vars).forEach(([key,value])=>{if(value==null||!String(value).trim())return;const name='--vault-'+key;if(!previous.has(name))previous.set(name,root.style.getPropertyValue(name));root.style.setProperty(name,String(value));applied.push(name)})}).catch(()=>{if(active)setTemplate(null)});return()=>{active=false;applied.forEach(name=>{const value=previous.get(name)||'';if(value)root.style.setProperty(name,value);else root.style.removeProperty(name)})}},[]);
 const visibleNav=(nav.length?nav:[{id:'browse',label:'Browse',path:'/browse',icon:'Compass',visible:true,sort_order:10},{id:'latest',label:'Latest',path:'/latest',icon:'Bell',visible:true,sort_order:20},{id:'trending',label:'Trending',path:'/trending',icon:'BarChart3',visible:true,sort_order:30},{id:'schedule',label:'Schedule',path:'/schedule',icon:'CalendarDays',visible:true,sort_order:40}]).filter(x=>x.visible);
 const f=footer||{enabled:true,description:settings.tagline||'Your anime streaming destination.',copyright_text:'',show_brand:true,show_navigation:true,show_account:true,show_powered_by:true};
 const templateConfig=template?.config&&typeof template.config==='object'?template.config:{};const primary=templateConfig.primary||templateConfig.primaryColor||siteConfig?.primary||settings.primary;const accent=templateConfig.accent||templateConfig.accentColor||siteConfig?.accent||settings.accent;const background=templateConfig.background||templateConfig.backgroundColor||siteConfig?.background||'#07070a';const siteLogo=siteConfig?.logoUrl||settings.logo;const siteName=siteConfig?.siteName||settings.siteName;const siteTagline=siteConfig?.tagline||settings.tagline;const footerText=siteConfig?.footerText||f.description||siteTagline;return <div className="vault-shell" data-template={template?.id||undefined} style={{'--vault-primary':primary,'--vault-accent':accent,'--vault-background':background} as CSSProperties}>
  <header className="vault-nav"><Link className="vault-brand" to="/">{siteLogo?.startsWith('http')||siteLogo?.startsWith('/')?<img src={siteLogo} alt=""/>:<span>{siteLogo||'✦'}</span>}<strong>{siteName}</strong></Link>
   <nav className="vault-main-nav">{visibleNav.map(item=>{const Icon=iconFor(item.icon);return <Link key={item.id} className={location.pathname===item.path?'active':''} to={item.path}><Icon size={15}/>{item.label}</Link>})}</nav>
   <div className="vault-nav-actions"><Link className="vault-search-trigger" to="/search"><Search size={16}/><span>Search anime...</span><kbd>⌘K</kbd></Link><Link className="vault-bell vault-notification-link" to="/notifications" aria-label="Notifications"><Bell size={16}/>{unreadNotifications>0&&<span className="vault-notification-badge">{unreadNotifications>99?"99+":unreadNotifications}</span>}</Link>{customerUser&&<Link className="vault-bell" to="/profile"><UserCircle size={16}/></Link>}{!customerUser?<Link className="vault-signin" to="/login"><UserCircle size={15}/> Sign in</Link>:<><Link className="vault-avatar" to="/profile" aria-label="Open profile">{customerUser.displayName.slice(0,1).toUpperCase()}</Link><button className="vault-signin" onClick={async()=>{await logoutCustomer();}}>Sign out</button></>}<button className="vault-menu" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button></div>
  </header>
  {open&&<div className="vault-mobile-nav">{visibleNav.map(item=><Link key={item.id} to={item.path} onClick={()=>setOpen(false)}>{item.label}</Link>)}<Link to="/search" onClick={()=>setOpen(false)}>Search</Link></div>}
  <main><Outlet/></main>
  {f.enabled&&<footer className="vault-footer">
   {f.show_brand&&<div className="vault-footer-brand"><Link className="vault-brand" to="/"><span>{siteLogo||'✦'}</span><strong>{siteName}</strong></Link><p>{footerText}</p></div>}
   {f.show_navigation&&<div className="vault-footer-column"><span>Explore</span>{visibleNav.slice(0,5).map(item=><Link key={item.id} to={item.path}>{item.label}</Link>)}</div>}
   {f.show_account&&<div className="vault-footer-column"><span>Account</span>{customerUser?<><Link to="/profile">My profile</Link><button className="vault-footer-link" onClick={async()=>{await logoutCustomer();}}>Sign out</button></>:<><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></>}</div>}
   <div className="vault-footer-socials">{Object.entries(siteConfig?.socialLinks||{}).map(([name,url])=><a key={name} href={String(url)} target="_blank" rel="noreferrer noopener">{name}</a>)}</div>
   <div className="vault-footer-bottom"><small>© {new Date().getFullYear()} {f.copyright_text||siteName}</small>{f.show_powered_by&&<small>Built with {siteName}</small>}</div>
  </footer>}
 </div>
}

import {Link,Outlet,useLocation} from 'react-router-dom';
import {Search,Menu,X,Bell,CalendarDays,Compass,Layers,BarChart3,UserCircle} from 'lucide-react';
import {useEffect,useState,type CSSProperties} from 'react';
import {useApp} from '../contexts/AppContext';

type NavItem={id:string;label:string;path:string;icon?:string|null;visible:boolean;sort_order:number};

const iconFor=(name?:string|null)=>({Compass,Bell,BarChart3,CalendarDays,Layers}[name||'Layers']||Layers);

export function PublicLayout(){
 const{settings,role,setRole}=useApp();const location=useLocation();const[open,setOpen]=useState(false);const[nav,setNav]=useState<NavItem[]>([]);
 useEffect(()=>{let active=true;fetch('/api/navigation').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setNav(d.items||[])}).catch(()=>setNav([]));return()=>{active=false}},[]);
 const visibleNav=nav.filter(x=>x.visible);
 return <div className="vault-shell" style={{'--vault-primary':settings.primary,'--vault-accent':settings.accent} as CSSProperties}>
  <header className="vault-nav"><Link className="vault-brand" to="/"><span>{settings.logo||'✦'}</span><strong>{settings.siteName}</strong></Link>
   <nav className="vault-main-nav">{visibleNav.map(item=>{const Icon=iconFor(item.icon);return <Link key={item.id} className={location.pathname===item.path?'active':''} to={item.path}><Icon size={15}/>{item.label}</Link>})}</nav>
   <div className="vault-nav-actions"><Link className="vault-search-trigger" to="/search"><Search size={16}/><span>Search anime...</span><kbd>⌘K</kbd></Link><Link className="vault-bell" to="/latest"><Bell size={16}/></Link>{role==='public_user'?<Link className="vault-signin" to="/login"><UserCircle size={15}/> Sign in</Link>:<button className="vault-avatar" onClick={()=>setRole('public_user')}>A</button>}<button className="vault-menu" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button></div>
  </header>
  {open&&<div className="vault-mobile-nav">{visibleNav.map(item=><Link key={item.id} to={item.path} onClick={()=>setOpen(false)}>{item.label}</Link>)}<Link to="/search" onClick={()=>setOpen(false)}>Search</Link></div>}
  <main><Outlet/></main>
  <footer className="vault-footer"><div><Link className="vault-brand" to="/"><span>{settings.logo||'✦'}</span><strong>{settings.siteName}</strong></Link><p>{settings.tagline}</p></div><div className="vault-footer-links">{visibleNav.slice(0,4).map(item=><Link key={item.id} to={item.path}>{item.label}</Link>)}<Link to="/login">Account</Link></div><small>© 2026 {settings.siteName} · Built with AniFuze</small></footer>
 </div>
}
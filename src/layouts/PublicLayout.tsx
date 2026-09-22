import {Link,Outlet,useLocation} from 'react-router-dom';
import {Search,Menu,X,Bell,CalendarDays,Compass,Layers,BarChart3,Download,UserCircle} from 'lucide-react';
import {useState,type CSSProperties} from 'react';
import {useApp} from '../contexts/AppContext';
import {navigationService} from '../services/mockServices';

export function PublicLayout(){
 const{settings,role,setRole}=useApp();const location=useLocation();const[open,setOpen]=useState(false);const nav=navigationService.get();
 const iconFor=(to:string)=>to==='/'?Compass:to==='/schedule'?CalendarDays:to==='/trending'?BarChart3:to==='/latest'?Bell:to==='/genres'?Layers:Layers;
 const visibleNav=nav.filter(x=>!x.hidden);
 return <div className="vault-shell" style={{'--vault-primary':settings.primary,'--vault-accent':settings.accent} as CSSProperties}>
  <header className="vault-nav"><Link className="vault-brand" to="/"><span>{settings.logo||'✦'}</span><strong>{settings.siteName}</strong></Link>
   <nav className="vault-main-nav">{visibleNav.map(item=>{const Icon=iconFor(item.to);return <Link key={item.to} className={location.pathname===item.to?'active':''} to={item.to}><Icon size={15}/>{item.label}</Link>})}</nav>
   <div className="vault-nav-actions"><Link className="vault-search-trigger" to="/search"><Search size={16}/><span>Search anime...</span><kbd>⌘K</kbd></Link><Link className="vault-bell" to="/latest"><Bell size={16}/></Link>{role==='public_user'?<Link className="vault-signin" to="/login"><UserCircle size={15}/> Sign in</Link>:<button className="vault-avatar" onClick={()=>setRole('public_user')}>A</button>}<button className="vault-menu" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button></div>
  </header>
  {open&&<div className="vault-mobile-nav">{visibleNav.map(item=><Link key={item.to} to={item.to} onClick={()=>setOpen(false)}>{item.label}</Link>)}<Link to="/search" onClick={()=>setOpen(false)}>Search</Link></div>}
  <main><Outlet/></main>
  <footer className="vault-footer"><div><Link className="vault-brand" to="/"><span>{settings.logo||'✦'}</span><strong>{settings.siteName}</strong></Link><p>{settings.tagline}</p></div><div className="vault-footer-links"><Link to="/browse">Browse</Link><Link to="/schedule">Schedule</Link><Link to="/genres">Genres</Link><Link to="/login">Account</Link></div><small>© 2026 {settings.siteName} · Built with AniFuze</small></footer>
 </div>
}
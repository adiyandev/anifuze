import type {CSSProperties} from 'react';
import {Link,Outlet,useLocation} from 'react-router-dom';
import {Search,Menu,X,UserCircle} from 'lucide-react';
import {useState} from 'react';
import {useApp} from '../contexts/AppContext';

export function PublicLayout(){
  const {settings,role,setRole}=useApp();
  const location=useLocation();
  const [mobileOpen,setMobileOpen]=useState(false);
  const nav=JSON.parse(localStorage.getItem('anifuze_navigation')||'[{"label":"Home","to":"/"},{"label":"Browse","to":"/browse"},{"label":"Latest","to":"/latest"},{"label":"Trending","to":"/trending"},{"label":"Schedule","to":"/schedule"},{"label":"Genres","to":"/genres"}]');
  return <div className="site-shell" style={{'--brand':settings.primary,'--accent':settings.accent} as CSSProperties}>
    <header className="public-head">
      <Link className="brand" to="/" onClick={()=>setMobileOpen(false)}><b>{settings.logo}</b><span>{settings.siteName}</span></Link>
      <nav className="desktop-nav">{nav.filter((x:any)=>!x.hidden).map((x:any)=><Link key={x.label} className={location.pathname===x.to?'active':''} to={x.to}>{x.label}</Link>)}</nav>
      <div className="head-actions">
        <Link className="search-trigger" to="/search" aria-label="Search anime"><Search size={18}/><span>Search anime...</span><kbd>⌘K</kbd></Link>
        {role==='public_user'
          ? <Link className="button small" to="/login"><UserCircle size={16}/> Sign in</Link>
          : <button className="avatar" aria-label="Sign out" onClick={()=>setRole('public_user')}>A</button>}
        <button className="mobile-menu" aria-label="Toggle menu" onClick={()=>setMobileOpen(v=>!v)}>{mobileOpen?<X size={20}/>:<Menu size={20}/>}</button>
      </div>
    </header>
    {mobileOpen&&<div className="mobile-nav">{nav.filter((x:any)=>!x.hidden).map((x:any)=><Link key={x.label} to={x.to} onClick={()=>setMobileOpen(false)}>{x.label}</Link>)}<Link to="/search" onClick={()=>setMobileOpen(false)}>Search</Link></div>}
    <main><Outlet/></main>
    <footer><div><Link className="brand footer-brand" to="/"><b>{settings.logo}</b>{settings.siteName}</Link><p>{settings.tagline}</p></div><span>© 2026 {settings.siteName} · Built with AniFuze</span></footer>
  </div>
}
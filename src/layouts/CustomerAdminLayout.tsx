import {Link,Outlet,useLocation} from 'react-router-dom';
import {LayoutDashboard,Film,Clapperboard,Layers,CalendarDays,Radio,Terminal,Activity,Database,Users,MessageSquare,Flag,Palette,Compass,FileText,Search,Globe,BarChart3,Bell,Settings,Store,ShoppingBag,Eye,LogOut} from 'lucide-react';
import {useApp} from '../contexts/AppContext';

const groups=[
 ['OVERVIEW',[['Dashboard','/manage/dashboard',LayoutDashboard]]],
 ['CONTENT',[['Anime','/manage/anime',Film],['Episodes','/manage/episodes',Clapperboard],['Genres','/manage/genres',Layers],['Collections','/manage/collections',Layers],['Schedule','/manage/schedule',CalendarDays]]],
 ['STREAMING',[['Providers','/manage/providers',Radio],['Provider Console','/manage/providers/console',Terminal],['Provider Health','/manage/providers/health',Activity],['Source Manager','/manage/providers/sources',Database]]],
 ['COMMUNITY',[['Users','/manage/users',Users],['Comments','/manage/comments',MessageSquare],['Reports','/manage/reports',Flag]]],
 ['DESIGN & SITE',[['Marketplace','/manage/templates/marketplace',Store],['My Templates','/manage/templates',ShoppingBag],['Site Builder','/manage/site-builder',Palette],['Appearance','/manage/appearance',Palette],['Navigation','/manage/navigation',Compass],['Pages','/manage/pages',FileText],['SEO','/manage/seo',Search],['Domains','/manage/domains',Globe]]],
 ['INSIGHTS',[['Analytics','/manage/analytics',BarChart3],['Notifications','/manage/notifications',Bell]]],
 ['SYSTEM',[['Settings','/manage/settings',Settings]]]
];

export function CustomerAdminLayout(){
 const loc=useLocation(); const{setRole}=useApp();
 const label=groups.flatMap(g=>g[1] as any[]).find(x=>x[1]===loc.pathname)?.[0]||'Workspace';
 return <div className="admin-shell">
   <aside className="admin-sidebar">
     <Link className="admin-brand" to="/manage/dashboard"><span>✦</span><div><b>AniFuze</b><small>CONTROL CENTER</small></div></Link>
     <div className="admin-sidebar-scroll">
       {groups.map(([heading,items])=><div className="admin-nav-group" key={heading as string}><small>{heading as string}</small>{(items as any[]).map(([text,to,Icon])=><Link key={to} className={loc.pathname===to?'admin-nav-link active':'admin-nav-link'} to={to}><Icon size={16}/><span>{text}</span></Link>)}</div>)}
     </div>
     <div className="admin-sidebar-bottom"><Link to="/" className="admin-preview"><Eye size={15}/> Preview website</Link><button className="admin-signout" onClick={()=>setRole('public_user')}><LogOut size={15}/> Sign out</button></div>
   </aside>
   <section className="admin-main">
     <header className="admin-topbar"><div><small>Customer workspace</small><h1>{label}</h1></div><div className="admin-top-actions"><kbd>⌘ K</kbd><button className="admin-avatar" aria-label="Sign out" onClick={()=>setRole('public_user')}>A</button></div></header>
     <main className="admin-content"><Outlet/></main>
   </section>
 </div>;
}
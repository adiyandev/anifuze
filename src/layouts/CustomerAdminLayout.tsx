import {Link,Outlet,useLocation} from 'react-router-dom';
import {BarChart3,Users,Film,Settings,Server,LogOut,Eye,LayoutDashboard,PlaySquare,Layers,CalendarDays,Radio,TerminalSquare,HeartPulse,Database,Palette,PanelLeft,FileText,Search,Globe,ChartNoAxesCombined,Bell,Shield,Menu,ShoppingBag,MessageSquareWarning} from 'lucide-react';
import {useApp} from '../contexts/AppContext';

const groups=[
 ['OVERVIEW',[
  ['Dashboard','/manage/dashboard',LayoutDashboard],
  ['Analytics','/manage/analytics',ChartNoAxesCombined],
 ]],
 ['CONTENT',[
  ['Anime','/manage/anime',Film],['Episodes','/manage/episodes',PlaySquare],['Genres','/manage/genres',Layers],['Collections','/manage/collections',Layers],['Schedule','/manage/schedule',CalendarDays],
 ]],
 ['STREAMING',[
  ['Providers','/manage/providers',Radio],['Provider Console','/manage/providers/console',TerminalSquare],['Health','/manage/providers/health',HeartPulse],['Sources','/manage/providers/sources',Database],
 ]],
 ['DESIGN',[
  ['Marketplace','/manage/templates/marketplace',ShoppingBag],['My Templates','/manage/templates',Layers],['Site Builder','/manage/site-builder',Palette],['Appearance','/manage/appearance',Palette],['Navigation','/manage/navigation',PanelLeft],['Pages','/manage/pages',FileText],
 ]],
 ['COMMUNITY',[
  ['Users','/manage/users',Users],['Comments','/manage/comments',MessageSquareWarning],['Reports','/manage/reports',Shield],
 ]],
 ['SITE',[
  ['SEO','/manage/seo',Globe],['Domains','/manage/domains',Globe],['Notifications','/manage/notifications',Bell],['Settings','/manage/settings',Settings],
 ]],
];

export function CustomerAdminLayout(){
 const loc=useLocation(); const {setRole}=useApp();
 const title=loc.pathname==='/manage/dashboard'?'Dashboard':loc.pathname.split('/').filter(Boolean).at(-1)?.replace(/-/g,' ')||'Dashboard';
 return <div className="apple-admin">
  <aside className="apple-sidebar">
   <Link className="apple-brand" to="/manage/dashboard"><span>✦</span><div><strong>AniFuze</strong><small>Site Management</small></div></Link>
   <div className="apple-sidebar-scroll">
    {groups.map(([heading,items])=><div className="apple-nav-group" key={heading as string}><small>{heading as string}</small>{(items as any[]).map(([label,to,Icon])=><Link key={to} className={loc.pathname===to?'active':''} to={to}><Icon size={15}/><span>{label}</span></Link>)}</div>)}
   </div>
   <div className="apple-sidebar-bottom"><Link to="/"><Eye size={15}/> Preview site</Link><button onClick={()=>setRole('public_user')}><LogOut size={15}/> Sign out</button></div>
  </aside>
  <main className="apple-admin-main">
   <header className="apple-topbar"><div><small>ANIFUZE ADMIN</small><h1>{title}</h1></div><div className="apple-top-actions"><Link to="/search" className="apple-search"><Search size={14}/>Search</Link><button className="apple-avatar" onClick={()=>setRole('public_user')}>A</button></div></header>
   <div className="apple-content"><Outlet/></div>
  </main>
 </div>;
}

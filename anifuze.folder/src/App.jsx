import { lazy, Suspense, useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Home as HomeIcon, Menu, X, Bell, Users, User, CalendarDays, BarChart3, Library, Settings as SettingsIcon, Info } from 'lucide-react';
import './styles/designTokens.css';
import { useUser } from './api/UserContext';
import { fetchSiteSettings } from './api/db';
import { applyTheme, applyAccentColor } from './utils/appearance';
import { storage } from './utils/storage';
import { applyTvModeClass } from './utils/tvMode';
import { FocusableNavLink, FocusableLink, FocusableButton } from './components/FocusableWrapper';
import RequireAuth from './components/RequireAuth';
import { RequireCustomer, RequirePlatformAdmin } from './components/RoleGuards';
import Footer from './components/Footer';

// Customer Admin Layout & Pages
import CustomerAdminLayout from './layouts/CustomerAdminLayout';
import CustomerDashboard from './pages/manage/CustomerDashboard';
import ProvidersPage from './pages/manage/ProvidersPage';
import ProviderConsolePage from './pages/manage/ProviderConsolePage';
import EmbedTesterPage from './pages/manage/EmbedTesterPage';
import SourceManagerPage from './pages/manage/SourceManagerPage';
import ProviderHealthPage from './pages/manage/ProviderHealthPage';
import TemplateMarketplacePage from './pages/manage/TemplateMarketplacePage';
import SiteBuilderPage from './pages/manage/SiteBuilderPage';
import AnimeManagementPage from './pages/manage/AnimeManagementPage';
import GeneralSettingsPage from './pages/manage/GeneralSettingsPage';

// Platform Admin Layout
import PlatformAdminLayout from './layouts/PlatformAdminLayout';

const MixedHome = lazy(() => import('./pages/MixedHome'));
const Search = lazy(() => import('./pages/Search'));
const AnimeUnavailable = lazy(() => import('./pages/AnimeUnavailable'));

const About = lazy(() => import('./pages/About'));
const StaticPages = lazy(() => import('./pages/StaticPageRoute'));

const NotFound = lazy(() => import('./pages/NotFound'));
const Profile = lazy(() => import('./pages/Profile'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Collections = lazy(() => import('./pages/Collections'));
const Stats = lazy(() => import('./pages/Stats'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Community = lazy(() => import('./pages/Community'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const SetNewPassword = lazy(() => import('./pages/SetNewPassword'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const SearchModal = lazy(() => import('./components/SearchModal'));
const SubAccountGate = lazy(() => import('./components/SubAccountGate'));

function RouteFallback() { return <div className="route-loading" role="status" aria-live="polite"><span className="loading-dot" /> Loading…</div>; }

const primaryNav = [
  ['/', 'Home', HomeIcon],
  ['/schedule', 'Schedule', CalendarDays],
  ['/collections', 'Collections', Library],
  ['/community', 'Community', Users],
  ['/stats', 'Stats', BarChart3],
  ['/notifications', 'Notifications', Bell]
];

function App() {
  const { user, authLoading, setShowAuthModal, setAuthTab, activeSubAccount, subAccounts } = useUser();
  const activeSubAccountIndex = activeSubAccount ? subAccounts.findIndex(profile => profile.id === activeSubAccount.id) : -1;
  const activeSubAccountRouteId = activeSubAccount ? (activeSubAccountIndex >= 0 ? String(activeSubAccountIndex + 1) : encodeURIComponent(activeSubAccount.id)) : null;
  const ownProfilePath = user ? `/profile/${user.id}${activeSubAccountRouteId ? `/sub=${activeSubAccountRouteId}` : ''}` : '/profile';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setIsTvMode(applyTvModeClass()); }, []);

  useEffect(() => {
    let cancelled = false;
    const run = () => fetchSiteSettings().then(settings => {
      if (!cancelled && settings?.announcement) setAnnouncement(settings.announcement);
    }).catch(() => {});
    applyAccentColor(storage.get('accentColor') || 'cyan');
    applyTheme(storage.get('theme') || 'dark', storage.get('customThemeVars'));
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => { cancelled = true; window.cancelIdleCallback(id); };
    }
    const id = window.setTimeout(run, 1200);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, []);

  useEffect(() => {
    const windowParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(location.search);
    const token = windowParams.get('token') || hashParams.get('token');
    if (token && location.pathname !== '/set-new-password') navigate(`/set-new-password?token=${encodeURIComponent(token)}`, { replace: true });
    if (hashParams.get('login') === 'true') {
      setAuthTab('login'); setShowAuthModal(true); navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, setAuthTab, setShowAuthModal]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setIsSearchOpen(true); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isMobileMenuOpen]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const openLogin = () => { setAuthTab('login'); setShowAuthModal(true); setIsMobileMenuOpen(false); };

  const isCustomerAdmin = location.pathname.startsWith('/manage');
  const isPlatformAdmin = location.pathname.startsWith('/platform');

  if (isPlatformAdmin) {
    return (
      <RequirePlatformAdmin>
        <PlatformAdminLayout />
      </RequirePlatformAdmin>
    );
  }

  return <Suspense fallback={<RouteFallback />}><SubAccountGate>
    {isCustomerAdmin ? (
      <RequireCustomer>
        <Routes>
          <Route path="/manage" element={<CustomerAdminLayout />}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="anime" element={<AnimeManagementPage />} />
            <Route path="episodes" element={<AnimeManagementPage />} />
            <Route path="schedule" element={<AnimeManagementPage />} />
            <Route path="providers" element={<ProvidersPage />} />
            <Route path="providers/console" element={<ProviderConsolePage />} />
            <Route path="providers/embed-tester" element={<EmbedTesterPage />} />
            <Route path="providers/health" element={<ProviderHealthPage />} />
            <Route path="providers/sources" element={<SourceManagerPage />} />
            <Route path="templates/marketplace" element={<TemplateMarketplacePage />} />
            <Route path="purchases" element={<TemplateMarketplacePage />} />
            <Route path="site-builder" element={<SiteBuilderPage />} />
            <Route path="appearance" element={<SiteBuilderPage />} />
            <Route path="navigation" element={<SiteBuilderPage />} />
            <Route path="pages" element={<SiteBuilderPage />} />
            <Route path="users" element={<GeneralSettingsPage />} />
            <Route path="comments" element={<GeneralSettingsPage />} />
            <Route path="reports" element={<GeneralSettingsPage />} />
            <Route path="seo" element={<GeneralSettingsPage />} />
            <Route path="domains" element={<GeneralSettingsPage />} />
            <Route path="analytics" element={<CustomerDashboard />} />
            <Route path="notifications" element={<GeneralSettingsPage />} />
            <Route path="settings" element={<GeneralSettingsPage />} />
            <Route path="*" element={<CustomerDashboard />} />
          </Route>
        </Routes>
      </RequireCustomer>
    ) : (
      <div className={`app-shell ${isTvMode ? 'tv-app-shell' : ''}`}>
        {announcement && <div className="site-announcement"><span>{announcement}</span></div>}
        {isTvMode && <div className="tv-welcome-strip"><span>LG webOS TV mode</span><strong>Use the Magic Remote pointer or arrow keys to browse. Press OK/Enter to select.</strong></div>}

        <header className="topbar">
          <div className="topbar-brand-wrap">
            <button className="hamburger-btn" type="button" aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="mobile-navigation" aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(value => !value)}>
              {isMobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
            <FocusableLink to="/" className="brand" aria-label="AniFuze home">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center font-black text-slate-950 text-xs">AF</div>
              <span>AniFuze</span>
            </FocusableLink>
          </div>
          <nav className="topnav" aria-label="Primary navigation">{primaryNav.map(([to, label, Icon]) => <FocusableNavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{Icon && <Icon size={15} />}<span>{label}</span></FocusableNavLink>)}</nav>
          <div className="topbar-actions">
            <button className="topbar-search-form" type="button" aria-label="Open search" onClick={() => setIsSearchOpen(true)}><SearchIcon size={18} /><span>Search anime...</span><kbd>⌘K</kbd></button>
            {user ? <FocusableLink to={ownProfilePath} className="header-profile"><User size={15} /><span>{user.username}</span></FocusableLink> : authLoading ? <div className="session-status">Checking session...</div> : <FocusableButton onClick={openLogin}><User size={15} /><span>Sign In</span></FocusableButton>}
          </div>
        </header>

        {isMobileMenuOpen && <>
          <div className="mobile-menu-overlay" role="presentation" onClick={() => setIsMobileMenuOpen(false)} />
          <aside id="mobile-navigation" className="mobile-menu" aria-label="Mobile navigation">
            <div className="mobile-menu-header"><div className="mobile-menu-title"><div className="w-7 h-7 rounded-md bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-xs">AF</div><div><strong>AniFuze</strong><span>Navigation</span></div></div><button className="mobile-menu-close" type="button" aria-label="Close navigation menu" onClick={() => setIsMobileMenuOpen(false)}><X size={22} /></button></div>
            <div className="mobile-menu-links">{primaryNav.map(([to, label, Icon]) => <FocusableNavLink key={to} to={to} end={to === '/'} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>{Icon && <Icon size={18} />}<span>{label}</span></FocusableNavLink>)}<FocusableNavLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}><Info size={18} /><span>About</span></FocusableNavLink></div>
            <div className="mobile-menu-account">{user ? <FocusableLink to={ownProfilePath} onClick={() => setIsMobileMenuOpen(false)} className="mobile-account-link"><User size={18} /><span><strong>{user.username}</strong><small>View profile</small></span></FocusableLink> : !authLoading && <FocusableButton onClick={openLogin} className="mobile-account-link"><User size={18} /><span>Sign In</span></FocusableButton>}{user && <FocusableNavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="mobile-account-link"><SettingsIcon size={18} /><span>Settings</span></FocusableNavLink>}</div>
          </aside>
        </>}

        <main className="content"><Routes>
          <Route path="/" element={<MixedHome />} /><Route path="/search" element={<Search />} /><Route path="/anime" element={<AnimeUnavailable />} /><Route path="/anime/:id" element={<AnimeUnavailable />} /><Route path="/schedule" element={<Schedule />} /><Route path="/collections" element={<RequireAuth><Collections /></RequireAuth>} /><Route path="/community" element={<Community />} /><Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} /><Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} /><Route path="/about" element={<About />} /><Route path="/contact" element={<StaticPages page="contact" />} /><Route path="/faq" element={<StaticPages page="faq" />} /><Route path="/terms" element={<StaticPages page="terms" />} /><Route path="/privacy" element={<StaticPages page="privacy" />} /><Route path="/dmca" element={<StaticPages page="dmca" />} /><Route path="/request" element={<StaticPages page="request" />} /><Route path="/profile/:userid/*" element={<Profile />} /><Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} /><Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/set-new-password" element={<SetNewPassword />} /><Route path="*" element={<NotFound />} />
        </Routes></main><Footer />
        <nav className="bottom-nav" aria-label="Mobile quick navigation"><NavLink to="/" end className={({ isActive }) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}><HomeIcon size={20} /><span>Home</span></NavLink><NavLink to="/search" className={({ isActive }) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}><SearchIcon size={20} /><span>Search</span></NavLink></nav>
        <AuthModal />{isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
      </div>
    )}
  </SubAccountGate></Suspense>;
}
export default App;
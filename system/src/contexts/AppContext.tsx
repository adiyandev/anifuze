import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Role, Settings } from '../types';

type Toast = { message: string; kind?: 'success' | 'error' | 'info' };
type AppState = {
  role: Role;
  setRole: (r: Role) => void;
  settings: Settings;
  refresh: () => void;
  toast: (m: string, k?: Toast['kind']) => void;
  permissions: string[];
  can: (permission: string) => boolean;
  adminVerified: boolean;
  customerUser: { id:string; email:string; displayName:string; emailVerified:boolean } | null;
  customerAuthLoading: boolean;
  refreshAuth: () => Promise<void>;
  logoutCustomer: () => Promise<void>;
};

const Context = createContext<AppState>(null!);
export const useApp = () => useContext(Context);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('public_user');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [adminVerified, setAdminVerified] = useState(false);
  const [customerUser, setCustomerUser] = useState<AppState['customerUser']>(null);
  const [customerAuthLoading, setCustomerAuthLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({siteName:'AniFuze',tagline:'Build. Customize. Stream.',primary:'#22D3EE',accent:'#8B5CF6',logo:'✦'});

  const refreshAuth = async () => {
    try {
      setCustomerAuthLoading(true);
      const customer = await fetch('/api/auth/user/me',{credentials:'include'});
      if(customer.ok){ const data=await customer.json(); setCustomerUser(data?.user||null); } else setCustomerUser(null);
      const me = await fetch('/api/auth/admin/me');
      if (!me.ok) {
        setRoleState('public_user');
        setPermissions([]);
        setAdminVerified(false);
        return;
      }

      const md = await me.json();
      const verified = Boolean(md?.user?.twoFactorVerified) && !md?.user?.mustSetup2fa;
      setAdminVerified(verified);
      if (!verified) {
        setRoleState('public_user');
        setPermissions([]);
        return;
      }

      setRoleState(md.user.role);
      const p = await fetch('/api/auth/admin/permissions');
      if (p.ok) {
        const pd = await p.json();
        setPermissions(Array.isArray(pd.permissions) ? pd.permissions : []);
      } else {
        setPermissions([]);
      }
    } catch {
      setCustomerUser(null);
      setRoleState('public_user');
      setPermissions([]);
      setAdminVerified(false);
    } finally { setCustomerAuthLoading(false); }
  };

  const logoutCustomer = async () => {
    await fetch('/api/auth/user/logout',{method:'POST',credentials:'include'}).catch(()=>{});
    setCustomerUser(null);
  };

  useEffect(() => {
    refreshAuth();
    fetch('/api/site-config')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const s = d.config;
        if (!s) return;
        setSettings(prev => ({...prev, siteName:s.siteName||prev.siteName, tagline:s.tagline||prev.tagline, primary:s.primary||prev.primary, accent:s.accent||prev.accent, logo:s.logoUrl||prev.logo}));
        const root=document.documentElement;
        if(s.primary) root.style.setProperty('--anifuze-primary',s.primary);
        if(s.accent) root.style.setProperty('--anifuze-accent',s.accent);
        if(s.background) root.style.setProperty('--anifuze-background',s.background);
        if(s.faviconUrl){
          let link=document.querySelector('link[rel="icon"]') as HTMLLinkElement|null;
          if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link);}
          link.href=s.faviconUrl;
        }
        if(s.siteName) document.title=s.siteName;
      })
      .catch(() => {});

    fetch('/api/appearance')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const a = d.appearance;
        if (!a) return;
        const root = document.documentElement;
        root.style.setProperty('--anifuze-primary', a.primary_color);
        root.style.setProperty('--anifuze-accent', a.accent_color);
        root.style.setProperty('--anifuze-card-radius', a.card_radius);
        root.style.setProperty('--anifuze-container-width', a.container_width === 'centered' ? '1200px' : '1440px');
        root.style.setProperty('--anifuze-font', a.font_family === 'System' ? 'system-ui' : a.font_family);
        if (a.favicon_url) {
          let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = a.favicon_url;
        }
      })
      .catch(() => {});
  }, []);

  const [note, setNote] = useState<Toast | null>(null);
  const updateRole = (r: Role) => setRoleState(r);
  const refresh = () => { fetch('/api/site-config').then(r=>r.ok?r.json():Promise.reject()).then(d=>{const s=d.config;if(s)setSettings(prev=>({...prev,siteName:s.siteName||prev.siteName,tagline:s.tagline||prev.tagline,primary:s.primary||prev.primary,accent:s.accent||prev.accent,logo:s.logoUrl||prev.logo}))}).catch(()=>{}); };
  const toast = (message: string, kind: Toast['kind'] = 'success') => {
    setNote({ message, kind });
    window.setTimeout(() => setNote(null), 3000);
  };

  return (
    <Context.Provider value={{
      role, setRole: updateRole, settings, refresh, toast,
      permissions, can: permission => permissions.includes(permission),
      adminVerified, customerUser, customerAuthLoading, refreshAuth, logoutCustomer,
    }}>
      {children}
      {note && <div className={`toast ${note.kind}`}>{note.message}</div>}
    </Context.Provider>
  );
}

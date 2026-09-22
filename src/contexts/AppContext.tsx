import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Role, Settings } from '../types';
import { settingsService } from '../services/mockServices';

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
  refreshAuth: () => Promise<void>;
};

const DEMO_PERMISSIONS = [
  'dashboard_view','anime_view','anime_manage','episodes_view','episodes_manage',
  'providers_view','providers_manage','providers_console','providers_health','sources_view',
  'templates_view','templates_manage','site_builder_manage','appearance_manage',
  'navigation_manage','pages_manage','seo_manage','users_view','users_manage',
  'comments_moderate','reports_moderate','analytics_view','notifications_manage',
  'settings_manage','security_manage','audit_view','system_view','backups_manage',
  'maintenance_manage','updates_manage','license_manage','installation_manage','email_manage',
];

const Context = createContext<AppState>(null!);
export const useApp = () => useContext(Context);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('public_user');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [adminVerified, setAdminVerified] = useState(false);
  const [settings, setSettings] = useState(settingsService.get());

  const refreshAuth = async () => {
    try {
      const isDemo = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
      if (isDemo) {
        const saved = window.localStorage.getItem('anifuze_demo_admin');
        if (saved) {
          setRoleState('owner');
          setPermissions([...DEMO_PERMISSIONS]);
          setAdminVerified(true);
          return;
        }
        setRoleState('public_user');
        setPermissions([]);
        setAdminVerified(false);
        return;
      }

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
      setRoleState('public_user');
      setPermissions([]);
      setAdminVerified(false);
    }
  };

  useEffect(() => {
    refreshAuth();
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
  const refresh = () => setSettings(settingsService.get());
  const toast = (message: string, kind: Toast['kind'] = 'success') => {
    setNote({ message, kind });
    window.setTimeout(() => setNote(null), 3000);
  };

  return (
    <Context.Provider value={{
      role, setRole: updateRole, settings, refresh, toast,
      permissions, can: permission => permissions.includes(permission),
      adminVerified, refreshAuth,
    }}>
      {children}
      {note && <div className={`toast ${note.kind}`}>{note.message}</div>}
    </Context.Provider>
  );
}

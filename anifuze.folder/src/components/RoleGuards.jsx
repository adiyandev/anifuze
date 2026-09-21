import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../api/UserContext';

export function RequireCustomer({ children }) {
  const { user, authLoading } = useUser();
  const location = useLocation();

  if (authLoading) return null;

  if (!user || (user.role !== 'customer' && user.role !== 'platform_admin')) {
    return <Navigate to="/?login=true" state={{ from: location }} replace />;
  }

  return children;
}

export function RequirePlatformAdmin({ children }) {
  const { user, authLoading } = useUser();

  if (authLoading) return null;

  if (!user || user.role !== 'platform_admin') {
    return (
      <div className="min-h-screen bg-[#070B17] flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">
          ✕
        </div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Platform Administration requires <code className="text-cyan-400 font-mono">platform_admin</code> role credentials.
        </p>
        <a href="/manage/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700">
          Return to Customer Dashboard
        </a>
      </div>
    );
  }

  return children;
}

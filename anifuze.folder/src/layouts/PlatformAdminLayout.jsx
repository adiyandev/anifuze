import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Store, DollarSign, Activity } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/UIComponents';
import { platformService } from '../services/apiServices';

export default function PlatformAdminLayout() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    platformService.getCustomers().then(setCustomers);
  }, []);

  return (
    <div className="min-h-screen bg-[#070B17] text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-500/30 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              PA
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">AniFuze Platform Administration</h1>
              <p className="text-xs text-violet-300 mt-0.5">
                Internal SaaS Control Panel — Manage SaaS Tenants, Platform Revenue, Marketplace Submissions & Server Fleet.
              </p>
            </div>
          </div>
          <a href="/manage/dashboard">
            <Button variant="secondary" size="sm">
              Return to Customer Panel
            </Button>
          </a>
        </div>

        {/* Platform SaaS Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-violet-500/30 bg-[#0B1020]">
            <div className="text-xs text-slate-400 uppercase font-bold">Active SaaS Tenants</div>
            <div className="text-2xl font-black text-white mt-2">1,248</div>
            <Badge variant="purple" className="mt-2">+42 this month</Badge>
          </Card>
          <Card className="border-violet-500/30 bg-[#0B1020]">
            <div className="text-xs text-slate-400 uppercase font-bold">Monthly Recurring Revenue (MRR)</div>
            <div className="text-2xl font-black text-emerald-400 mt-2">$84,250</div>
            <Badge variant="success" className="mt-2">+14.2% YoY</Badge>
          </Card>
          <Card className="border-violet-500/30 bg-[#0B1020]">
            <div className="text-xs text-slate-400 uppercase font-bold">Marketplace Templates</div>
            <div className="text-2xl font-black text-cyan-400 mt-2">64</div>
            <Badge variant="info" className="mt-2">12 Pending Review</Badge>
          </Card>
          <Card className="border-violet-500/30 bg-[#0B1020]">
            <div className="text-xs text-slate-400 uppercase font-bold">Total Platform Streams</div>
            <div className="text-2xl font-black text-amber-400 mt-2">42.8M</div>
            <Badge variant="warning" className="mt-2">Peak Load 98.4%</Badge>
          </Card>
        </div>

        {/* Customers Table */}
        <Card className="border-violet-500/30 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#26324A] bg-[#0B1020]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-violet-400" /> Platform Tenant Customers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B1020] uppercase text-[10px] font-bold text-slate-400 border-b border-[#26324A]">
                <tr>
                  <th className="py-3 px-4">Tenant Site</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Custom Domain</th>
                  <th className="py-3 px-4">MRR</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26324A]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4 text-slate-400">{c.owner || '—'}</td>
                    <td className="py-3 px-4"><Badge variant="purple">{c.plan}</Badge></td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{c.domain}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{c.monthlyFee}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === 'Active' ? 'success' : 'error'}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

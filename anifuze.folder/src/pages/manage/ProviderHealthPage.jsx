import React, { useEffect, useState } from 'react';
import { Activity, Server, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui/UIComponents';
import { providerService } from '../../services/apiServices';

export default function ProviderHealthPage() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    providerService.getProviders().then(setProviders);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="text-cyan-400" /> Provider Health & Performance Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time server availability, average latency, error rates, and connection status.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw size={14} /> Refresh Diagnostics
        </Button>
      </div>

      {/* Grid of Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map((p) => (
          <Card key={p.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{p.name}</h3>
              {p.enabled ? <Badge variant="success">● Online</Badge> : <Badge variant="error">● Offline</Badge>}
            </div>
            <div className="text-xs text-slate-400 font-mono">{p.type}</div>
            
            <div className="pt-3 border-t border-[#26324A] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Response Latency:</span>
                <span className="font-mono text-cyan-400 font-bold">{p.latency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requests Handled:</span>
                <span className="font-mono text-slate-200">{p.requests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Availability SLA:</span>
                <span className="font-mono text-emerald-400 font-bold">99.9%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

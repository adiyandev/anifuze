import React, { useState } from 'react';
import { Layers, Activity, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { Card, Button, Badge, Input, Select } from '../../components/ui/UIComponents';

export default function SourceManagerPage() {
  const [sources, setSources] = useState([
    { id: 's-1', anime: 'Solo Leveling Season 2', episode: 'Episode 12', provider: 'AniFuze Core API', type: 'API', status: 'Available', latency: '42ms' },
    { id: 's-2', anime: 'Solo Leveling Season 2', episode: 'Episode 12', provider: 'StreamVerse Embed', type: 'Embed', status: 'Available', latency: '110ms' },
    { id: 's-3', anime: 'Jujutsu Kaisen: Culling Game', episode: 'Episode 1', provider: 'Backup Direct Video', type: 'Direct Video', status: 'Offline', latency: '—' },
    { id: 's-4', anime: 'Frieren: Beyond Journey\'s End', episode: 'Episode 28', provider: 'AniFuze Core API', type: 'API', status: 'Available', latency: '48ms' }
  ]);

  const [filterType, setFilterType] = useState('All');

  const filteredSources = sources.filter(s => filterType === 'All' || s.type === filterType);

  const toggleStatus = (id) => {
    setSources(sources.map(s => s.id === id ? { ...s, status: s.status === 'Available' ? 'Disabled' : 'Available' } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="text-cyan-400" /> Episode Streaming Source Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, re-order, and test streaming video source links attached to anime episodes.
          </p>
        </div>
        <Select 
          options={['All', 'API', 'Embed', 'Direct Video']}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Sources Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1020] border-b border-[#26324A] uppercase text-[10px] font-bold text-slate-400">
              <tr>
                <th className="py-3 px-4">Anime Title</th>
                <th className="py-3 px-4">Episode</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26324A]">
              {filteredSources.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{item.anime}</td>
                  <td className="py-3 px-4 text-cyan-400 font-semibold">{item.episode}</td>
                  <td className="py-3 px-4">{item.provider}</td>
                  <td className="py-3 px-4"><Badge variant="info">{item.type}</Badge></td>
                  <td className="py-3 px-4">
                    <Badge variant={item.status === 'Available' ? 'success' : 'error'}>{item.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => toggleStatus(item.id)}>
                        {item.status === 'Available' ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

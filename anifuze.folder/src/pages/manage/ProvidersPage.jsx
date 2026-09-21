import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Terminal, 
  Activity, 
  Layers, 
  ArrowUpDown, 
  Play, 
  CheckCircle2, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../../components/ui/UIComponents';
import { providerService } from '../../services/apiServices';

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [providerType, setProviderType] = useState('API Provider');
  
  // API Form State
  const [apiForm, setApiForm] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    apiSecret: '',
    priority: 1
  });

  // Embed Form State
  const [embedForm, setEmbedForm] = useState({
    name: '',
    embedTemplate: 'https://example.com/embed/{animeId}/{episodeId}',
    priority: 1
  });

  // Test Connection State
  const [testResult, setTestResult] = useState(null);
  const [testingId, setTestingId] = useState(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    const list = await providerService.getProviders();
    setProviders(list);
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    if (providerType === 'API Provider') {
      await providerService.createProvider({
        name: apiForm.name || 'New API Provider',
        type: 'API Provider',
        priority: Number(apiForm.priority),
        endpoint: apiForm.baseUrl,
        enabled: true
      });
    } else {
      await providerService.createProvider({
        name: embedForm.name || 'New Embed Provider',
        type: 'Embed Provider',
        priority: Number(embedForm.priority),
        embedTemplate: embedForm.embedTemplate,
        enabled: true
      });
    }
    setIsAddModalOpen(false);
    loadProviders();
  };

  const handleTestConnection = async (id) => {
    setTestingId(id);
    setTestResult(null);
    const result = await providerService.testProviderConnection(id);
    setTestingId(null);
    setTestResult({ id, ...result });
  };

  const handleToggleEnable = async (id, currentStatus) => {
    await providerService.updateProvider(id, { enabled: !currentStatus });
    loadProviders();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this streaming provider?')) {
      await providerService.deleteProvider(id);
      loadProviders();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Streaming Infrastructure Providers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure API endpoints, embed players, direct video sources, and priority fallback routing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/manage/providers/console">
            <Button variant="secondary" size="sm">
              <Terminal size={15} /> Console Tester
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={15} /> Add Provider
          </Button>
        </div>
      </div>

      {/* Connection Test Output Alert */}
      {testResult && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono ${
          testResult.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            {testResult.success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <div>
              <span className="font-bold">{testResult.success ? '✓ Connection Successful' : '✕ Connection Failed'}</span>
              <span className="ml-3 opacity-80">Status: {testResult.status} • Latency: {testResult.responseTime}</span>
              {testResult.message && <p className="mt-1 opacity-90">{testResult.message}</p>}
            </div>
          </div>
          <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Providers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1020] border-b border-[#26324A] uppercase text-[10px] font-bold text-slate-400">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Provider Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Total Requests</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26324A]">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-400">
                    #{p.priority}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {p.name}
                    <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">{p.endpoint || p.embedTemplate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.type === 'API Provider' ? 'info' : 'purple'}>{p.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {p.enabled ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Badge variant="error">Disabled</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{p.latency}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{p.requests.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleTestConnection(p.id)}
                        disabled={testingId === p.id}
                      >
                        {testingId === p.id ? 'Testing...' : 'Test'}
                      </Button>
                      <Button 
                        variant={p.enabled ? 'danger' : 'secondary'} 
                        size="sm"
                        onClick={() => handleToggleEnable(p.id, p.enabled)}
                      >
                        {p.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Provider Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Streaming Provider">
        <form onSubmit={handleCreateProvider} className="space-y-4">
          <Select 
            label="Provider Type"
            value={providerType}
            onChange={(e) => setProviderType(e.target.value)}
            options={['API Provider', 'Embed Provider', 'Direct Video', 'Custom Provider']}
          />

          {providerType === 'API Provider' ? (
            <>
              <Input 
                label="Provider Name"
                placeholder="e.g., AniFuze Core API"
                value={apiForm.name}
                onChange={(e) => setApiForm({...apiForm, name: e.target.value})}
                required
              />
              <Input 
                label="Base API URL"
                placeholder="https://api.provider.com/v1"
                value={apiForm.baseUrl}
                onChange={(e) => setApiForm({...apiForm, baseUrl: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  label="API Key"
                  type="password"
                  placeholder="********"
                  value={apiForm.apiKey}
                  onChange={(e) => setApiForm({...apiForm, apiKey: e.target.value})}
                />
                <Input 
                  label="Priority Rank"
                  type="number"
                  min="1"
                  value={apiForm.priority}
                  onChange={(e) => setApiForm({...apiForm, priority: e.target.value})}
                />
              </div>
            </>
          ) : (
            <>
              <Input 
                label="Provider Name"
                placeholder="e.g., StreamVerse Embed Player"
                value={embedForm.name}
                onChange={(e) => setEmbedForm({...embedForm, name: e.target.value})}
                required
              />
              <Input 
                label="Embed URL Template"
                placeholder="https://example.com/embed/{animeId}/{episodeId}"
                value={embedForm.embedTemplate}
                onChange={(e) => setEmbedForm({...embedForm, embedTemplate: e.target.value})}
                required
              />
              <div className="p-3 bg-[#0B1020] border border-[#26324A] rounded-lg text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-200">Available Variables:</div>
                <div className="flex flex-wrap gap-1.5 font-mono text-cyan-400">
                  <span>{'{animeId}'}</span>
                  <span>{'{episodeId}'}</span>
                  <span>{'{episodeNumber}'}</span>
                  <span>{'{malId}'}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-[#26324A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Provider</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

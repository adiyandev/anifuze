import React, { useState } from 'react';
import { Send, Terminal, Play, Copy, Check, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/UIComponents';

export default function ProviderConsolePage() {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/api/v1/anime/solo-leveling');
  const [headers, setHeaders] = useState([
    { key: 'Authorization', value: 'Bearer af_live_secret_99824' },
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    setResponse(null);
    setTimeout(() => {
      setIsLoading(false);
      setResponse({
        status: 200,
        statusText: 'OK',
        time: '182 ms',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-anifuze-cdn-cache': 'HIT',
          'server': 'AniFuze-Edge-Worker'
        },
        data: {
          success: true,
          provider: 'AniFuze Core Fast CDN',
          results: [
            {
              id: '123',
              title: 'Solo Leveling Season 2',
              episode: 12,
              stream_url: 'https://cdn.anifuze-stream.net/hls/sl2-ep12/master.m3u8',
              quality: ['1080p', '720p', '480p'],
              subtitles: ['English', 'Spanish', 'French']
            }
          ]
        }
      });
    }, 600);
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Terminal className="text-cyan-400" /> Provider Developer Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test and inspect HTTP API requests, responses, headers, and payload verification in real time.
          </p>
        </div>
      </div>

      {/* Main Console Box */}
      <Card className="p-4 bg-[#0B1020]">
        {/* Request Line */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className="bg-[#10172A] border border-[#26324A] text-cyan-400 font-bold px-4 py-2.5 rounded-lg text-xs focus:outline-none"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          <input 
            type="text" 
            value={endpoint} 
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1 bg-[#10172A] border border-[#26324A] text-xs font-mono text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 w-full"
            placeholder="Enter request endpoint URL..."
          />

          <Button variant="primary" size="md" onClick={handleSend} disabled={isLoading} className="w-full md:w-auto">
            <Send size={15} /> {isLoading ? 'Sending...' : 'Send Request'}
          </Button>
        </div>

        {/* Console Grid: Request vs Response */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column: Headers & Request Config */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#26324A] pb-2">
              Request Headers & Parameters
            </h3>

            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={h.key} 
                    className="w-1/3 bg-[#10172A] border border-[#26324A] text-xs text-slate-300 px-3 py-1.5 rounded" 
                    readOnly
                  />
                  <input 
                    type="text" 
                    value={h.value} 
                    className="flex-1 bg-[#10172A] border border-[#26324A] text-xs text-slate-400 font-mono px-3 py-1.5 rounded" 
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Response Inspector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#26324A] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Response Inspector
              </h3>
              {response && (
                <div className="flex items-center gap-3 text-xs">
                  <Badge variant="success">STATUS {response.status} {response.statusText}</Badge>
                  <span className="text-slate-400 font-mono">{response.time}</span>
                  <button onClick={handleCopy} className="text-cyan-400 hover:underline flex items-center gap-1">
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#070B17] border border-[#26324A] rounded-xl p-4 min-h-[250px] font-mono text-xs overflow-x-auto">
              {isLoading && <div className="text-slate-500 animate-pulse">Executing request to provider endpoint...</div>}
              {!isLoading && !response && <div className="text-slate-600">Click "Send Request" to test endpoint response.</div>}
              {response && (
                <pre className="text-cyan-300">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

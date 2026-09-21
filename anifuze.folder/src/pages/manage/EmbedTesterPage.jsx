import React, { useState } from 'react';
import { Play, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/UIComponents';
import { providerService } from '../../services/apiServices';

export default function EmbedTesterPage() {
  const [params, setParams] = useState({
    template: 'https://example.com/embed/{animeId}/{episodeId}',
    animeId: 'solo-leveling-s2',
    episodeId: 'ep-12',
    episodeNumber: '12',
    malId: '54789',
    anilistId: '16498',
    season: '2'
  });

  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const result = await providerService.testEmbed(params);
    setGeneratedUrl(result.generatedUrl);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Code className="text-cyan-400" /> Embed Player Tester
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test iframe embed templates with dynamic variable replacement ({'{animeId}'}, {'{episodeId}'}, etc.).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <Card className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#26324A] pb-2">
            Template & Variable Parameters
          </h3>

          <form onSubmit={handleGenerate} className="space-y-3">
            <Input 
              label="Embed URL Template"
              value={params.template}
              onChange={(e) => setParams({...params, template: e.target.value})}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input 
                label="Anime ID ({animeId})"
                value={params.animeId}
                onChange={(e) => setParams({...params, animeId: e.target.value})}
              />
              <Input 
                label="Episode ID ({episodeId})"
                value={params.episodeId}
                onChange={(e) => setParams({...params, episodeId: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input 
                label="Ep Number ({episodeNumber})"
                value={params.episodeNumber}
                onChange={(e) => setParams({...params, episodeNumber: e.target.value})}
              />
              <Input 
                label="MAL ID ({malId})"
                value={params.malId}
                onChange={(e) => setParams({...params, malId: e.target.value})}
              />
              <Input 
                label="AniList ID ({anilistId})"
                value={params.anilistId}
                onChange={(e) => setParams({...params, anilistId: e.target.value})}
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full mt-2">
              <Play size={15} /> Generate & Test Embed URL
            </Button>
          </form>
        </Card>

        {/* Output & Preview */}
        <Card className="space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#26324A] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Output & Live Simulated Player
              </h3>
              {generatedUrl && (
                <button onClick={handleCopy} className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy Link'}
                </button>
              )}
            </div>

            {generatedUrl ? (
              <div className="p-3 bg-[#0B1020] border border-[#26324A] rounded-lg font-mono text-xs text-cyan-300 break-all">
                {generatedUrl}
              </div>
            ) : (
              <div className="p-4 bg-[#0B1020] border border-[#26324A] rounded-lg text-xs text-slate-500">
                Click "Generate & Test Embed URL" to view output.
              </div>
            )}

            {/* Simulated Player Box */}
            <div className="h-56 bg-slate-950 border border-[#26324A] rounded-xl flex flex-col items-center justify-center text-center p-4 relative overflow-hidden group">
              {isPreviewActive ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-cyan-950/20 text-cyan-400 space-y-2">
                  <Badge variant="success">▶ Simulated Video Stream Active</Badge>
                  <p className="text-xs text-slate-300 font-mono max-w-xs truncate">{generatedUrl}</p>
                  <Button variant="secondary" size="sm" onClick={() => setIsPreviewActive(false)}>Stop Preview</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                    <Play size={20} />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">Safe Simulated Embed Preview Player</p>
                  <Button variant="violet" size="sm" onClick={() => setIsPreviewActive(true)} disabled={!generatedUrl}>
                    Launch Simulated Player
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

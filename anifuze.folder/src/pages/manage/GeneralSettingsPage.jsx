import React, { useState } from 'react';
import { Settings, Save, Globe, ShieldCheck, Palette } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/UIComponents';
import { settingsService } from '../../services/apiServices';

export default function GeneralSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteName: 'AniFuze Demo Stream Site',
    seoTitle: 'Watch Anime Online in HD - AniFuze Customer Site',
    seoDescription: 'High quality anime streaming platform built with AniFuze SaaS.',
    customDomain: 'demo.anifuze.site'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await settingsService.updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="text-cyan-400" /> Website & Platform Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage site metadata, general branding, SEO defaults, and custom domain configuration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Badge variant="success">✓ Settings Saved</Badge>}
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={15} /> Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#26324A] pb-2">
            General Site Branding
          </h3>
          <Input 
            label="Website Title / Name"
            value={form.siteName}
            onChange={(e) => setForm({...form, siteName: e.target.value})}
          />
          <Input 
            label="Default SEO Title Tag"
            value={form.seoTitle}
            onChange={(e) => setForm({...form, seoTitle: e.target.value})}
          />
          <Input 
            label="Meta Description"
            value={form.seoDescription}
            onChange={(e) => setForm({...form, seoDescription: e.target.value})}
          />
        </Card>

        <Card className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#26324A] pb-2 flex items-center gap-2">
            <Globe size={14} className="text-cyan-400" /> Custom Domain Configuration
          </h3>
          <Input 
            label="Connected Domain"
            value={form.customDomain}
            onChange={(e) => setForm({...form, customDomain: e.target.value})}
          />
          <div className="p-3 bg-[#0B1020] border border-[#26324A] rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">DNS Status:</span>
              <Badge variant="success">● Connected & Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SSL Certificate:</span>
              <Badge variant="info">Let's Encrypt (Auto-Renew)</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

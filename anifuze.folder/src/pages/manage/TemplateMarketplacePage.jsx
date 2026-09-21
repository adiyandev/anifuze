import React, { useEffect, useState } from 'react';
import { Store, ShoppingBag, CheckCircle, ExternalLink, Star } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui/UIComponents';
import { templateService } from '../../services/apiServices';

export default function TemplateMarketplacePage() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const list = await templateService.getTemplates();
    setTemplates(list);
  };

  const handlePurchase = async (id) => {
    await templateService.purchaseTemplate(id);
    loadTemplates();
  };

  const handleActivate = async (id) => {
    await templateService.activateTemplate(id);
    loadTemplates();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Template Marketplace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and install high-performance, responsive anime website designs created for AniFuze.
          </p>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="p-0 overflow-hidden flex flex-col justify-between group">
            <div>
              {/* Image Preview Container */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src={tpl.previewImage} 
                  alt={tpl.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={tpl.price === 0 ? 'success' : 'purple'}>
                    {tpl.price === 0 ? 'Free' : `$${tpl.price}`}
                  </Badge>
                  <Badge variant="info">{tpl.category}</Badge>
                </div>
                {tpl.isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="success" className="shadow-lg">● Active Design</Badge>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star size={14} fill="currentColor" />
                    <span>{tpl.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  By <span className="text-slate-300 font-semibold">{tpl.creator}</span> • v{tpl.version}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 border-t border-[#26324A]/50 mt-4 flex items-center gap-2">
              {tpl.isActive ? (
                <Button variant="secondary" size="sm" className="w-full" disabled>
                  <CheckCircle size={15} /> Active Theme
                </Button>
              ) : tpl.isInstalled ? (
                <Button variant="violet" size="sm" className="w-full" onClick={() => handleActivate(tpl.id)}>
                  Activate Template
                </Button>
              ) : (
                <Button variant="primary" size="sm" className="w-full" onClick={() => handlePurchase(tpl.id)}>
                  <ShoppingBag size={15} /> Install Template
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

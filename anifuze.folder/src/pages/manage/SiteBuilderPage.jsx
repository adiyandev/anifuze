import React, { useState } from 'react';
import { Wrench, Eye, Save, Plus, MoveUp, MoveDown, Trash2, Layout, Sliders } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/UIComponents';

export default function SiteBuilderPage() {
  const [components, setComponents] = useState([
    { id: 'c-1', name: 'Hero Banner', type: 'Hero', enabled: true },
    { id: 'c-2', name: 'Trending Anime Grid', type: 'Anime Grid', enabled: true },
    { id: 'c-3', name: 'Latest Episodes Carousel', type: 'Carousel', enabled: true },
    { id: 'c-4', name: 'Weekly Schedule Section', type: 'Schedule', enabled: true },
    { id: 'c-5', name: 'Footer Links', type: 'Footer', enabled: true }
  ]);
  const [selectedComp, setSelectedComp] = useState(components[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const list = [...components];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    setComponents(list);
  };

  const moveDown = (index) => {
    if (index === components.length - 1) return;
    const list = [...components];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    setComponents(list);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="text-cyan-400" /> Visual Site Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize layout structure, reorder section components, and configure real-time site appearance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedSuccess && <Badge variant="success">✓ Layout Saved!</Badge>}
          <a href="/" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm">
              <Eye size={15} /> Live Preview
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={15} /> Save Changes
          </Button>
        </div>
      </div>

      {/* 3-Pane Builder Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Pane: Component Hierarchy */}
        <Card className="lg:col-span-4 p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#26324A] pb-2">
              Page Section Blocks
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-[480px]">
              {components.map((comp, idx) => (
                <div 
                  key={comp.id}
                  onClick={() => setSelectedComp(comp)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedComp?.id === comp.id 
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white font-bold' 
                      : 'bg-[#0B1020] border-[#26324A] text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layout size={16} className="text-cyan-400" />
                    <span className="text-xs">{comp.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); moveUp(idx); }} className="p-1 hover:text-cyan-400">
                      <MoveUp size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveDown(idx); }} className="p-1 hover:text-cyan-400">
                      <MoveDown size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Middle Pane: Simulated Visual Canvas */}
        <Card className="lg:col-span-5 p-4 bg-[#070B17] flex flex-col items-center justify-center border-dashed border-2 border-[#26324A]">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Eye size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Live Visual Preview Canvas</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Editing section: <span className="text-cyan-400 font-semibold">{selectedComp?.name}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Right Pane: Block Properties */}
        <Card className="lg:col-span-3 p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#26324A] pb-2 flex items-center gap-2">
            <Sliders size={14} className="text-cyan-400" /> Component Properties
          </h3>

          {selectedComp ? (
            <div className="space-y-4">
              <Input 
                label="Section Title" 
                value={selectedComp.name} 
                onChange={(e) => {
                  const val = e.target.value;
                  setComponents(components.map(c => c.id === selectedComp.id ? {...c, name: val} : c));
                  setSelectedComp({...selectedComp, name: val});
                }}
              />
              <Select 
                label="Layout Container Width"
                options={['Full Width (100%)', 'Max Width 1280px', 'Centered Compact']}
              />
              <Select 
                label="Background Style"
                options={['Midnight Dark', 'Elevated Panel', 'Transparent Glass']}
              />
            </div>
          ) : (
            <div className="text-xs text-slate-500">Select a section block on the left to edit its properties.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Tv, Plus, Trash2, Edit3, Search, Eye } from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../../components/ui/UIComponents';
import { animeService } from '../../services/apiServices';

export default function AnimeManagementPage() {
  const [animeList, setAnimeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    type: 'TV',
    status: 'Ongoing',
    episodes: 12,
    genres: 'Action, Fantasy',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80'
  });

  useEffect(() => {
    loadAnime();
  }, []);

  const loadAnime = async () => {
    const data = await animeService.getAnime();
    setAnimeList(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await animeService.createAnime({
      ...form,
      episodes: Number(form.episodes),
      genres: form.genres.split(',').map(g => g.trim())
    });
    setIsAddModalOpen(false);
    loadAnime();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this anime title?')) {
      await animeService.deleteAnime(id);
      loadAnime();
    }
  };

  const filtered = animeList.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26324A] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tv className="text-cyan-400" /> Anime Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, feature, and organize anime entries displayed on your customer platform.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={15} /> Add New Anime
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search anime by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1020] border-b border-[#26324A] uppercase text-[10px] font-bold text-slate-400">
              <tr>
                <th className="py-3 px-4">Poster</th>
                <th className="py-3 px-4">Anime Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Episodes</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26324A]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <img src={item.poster} alt="" className="w-9 h-12 object-cover rounded border border-[#26324A]" />
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {item.title}
                    <div className="text-[10px] text-slate-400 font-normal">{item.genres?.join(', ')}</div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="info">{item.type}</Badge></td>
                  <td className="py-3 px-4">
                    <Badge variant={item.status === 'Ongoing' ? 'success' : 'purple'}>{item.status}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono">{item.episodes}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{item.views.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
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

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Anime Entry">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Anime Title"
            placeholder="e.g., Solo Leveling Season 2"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select 
              label="Type"
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value})}
              options={['TV', 'Movie', 'OVA', 'Special']}
            />
            <Select 
              label="Status"
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value})}
              options={['Ongoing', 'Completed', 'Upcoming']}
            />
          </div>
          <Input 
            label="Episodes Count"
            type="number"
            value={form.episodes}
            onChange={(e) => setForm({...form, episodes: e.target.value})}
          />
          <Input 
            label="Poster Image URL"
            value={form.poster}
            onChange={(e) => setForm({...form, poster: e.target.value})}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-[#26324A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Anime</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

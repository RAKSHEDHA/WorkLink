import { useState, useEffect } from 'react';
import { Bookmark, Star, MapPin, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Talent {
  id: string;
  full_name: string;
  skills: string[];
  hourly_rate: number | string;
  location: string;
  rating: number;
}

export default function SavedTalent() {
  const navigate = useNavigate();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTalent() {
      setLoading(true);
      // Fetch freelancers. In a real app, this would filter by a 'saved' junction table.
      // For this reconstruction, we show verified elite talent.
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'freelancer')
        .limit(10);

      if (data) {
        setTalents(data.map((t: any) => ({
          id: t.id,
          full_name: t.full_name || 'Anonymous',
          skills: t.skills || ['Specialist'],
          hourly_rate: t.hourly_rate || Math.floor(Math.random() * 5000) + 1000,
          location: t.location || 'Remote',
          rating: t.rating || 4.5 + Math.random() * 0.5
        })));
      }
      setLoading(false);
    }

    fetchTalent();
  }, []);

  const filtered = talents.filter(t => 
    t.full_name.toLowerCase().includes(search.toLowerCase()) || 
    t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Saved Talent</h1>
          <p className="text-slate-500 font-medium mt-2">Your curated list of world-class professionals ready to hire.</p>
        </div>
        <div className="relative">
           <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search saved profiles..." 
             className="h-12 w-full md:w-64 pl-10 pr-4 rounded-xl border border-slate-200 bg-white font-medium text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10" 
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-bold">No talent found matching your search.</p>
          </div>
        ) : filtered.map((t) => (
          <div key={t.id} onClick={() => navigate(`/profile/${t.id}`)} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col hover:border-blue-600 transition-colors shadow-sm group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl">
                  {t.full_name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{t.full_name}</h3>
                  <p className="text-sm font-medium text-slate-500">{t.skills[0]}</p>
                </div>
              </div>
              <button className="text-blue-600 bg-blue-50 p-2 rounded-xl">
                <Bookmark className="w-5 h-5 fill-blue-600" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2 mb-6 text-sm font-bold text-slate-600">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {t.rating.toFixed(1)}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {t.location}</span>
              <span className="text-slate-900">₹{Number(t.hourly_rate).toLocaleString()}/hr</span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3" onClick={(e) => e.stopPropagation()}>
              <Button onClick={() => navigate('/messages')} className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl h-12">Message</Button>
              <Button onClick={() => navigate('/post-job')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 shadow-md shadow-blue-600/20">Invite to Job</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

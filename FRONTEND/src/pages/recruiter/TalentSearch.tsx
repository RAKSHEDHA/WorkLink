import { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Award, CheckCircle2, ChevronDown, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function TalentSearch() {
  const navigate = useNavigate();
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minRate, setMinRate] = useState(0);
  const [maxRate, setMaxRate] = useState(10000);

  useEffect(() => {
    const fetchTalent = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*').eq('role', 'freelancer');
      
      if (selectedCategory !== 'All') {
        query = query.contains('skills', [selectedCategory]); // Assuming category maps to skills for now or add 'category' column
      }
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      if (minRate > 0) {
        query = query.gte('hourly_rate', minRate);
      }
      if (maxRate < 10000) {
        query = query.lte('hourly_rate', maxRate);
      }

      const { data, error } = await query.order('rating', { ascending: false });
      if (error) {
        console.error('Error fetching talent:', error);
      } else {
        setTalents(data || []);
      }
      setLoading(false);
    };

    fetchTalent();
  }, [searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 flex gap-8">
      {/* Sidebar Filters */}
      <div className="w-72 hidden lg:flex flex-col gap-8 shrink-0 pb-12">
        <div>
          <h3 className="font-black text-lg text-slate-900 mb-6">Filter by Category</h3>
          <div className="space-y-4">
            {['All', 'Web Dev', 'AI/ML', 'UI/UX', 'Mobile', 'Cyber', 'Blockchain', 'Content'].map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedCategory(cat)}>
                <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${selectedCategory === cat ? 'border-blue-600 bg-blue-50' : 'border-slate-300 group-hover:border-blue-500'}`}>
                  {selectedCategory === cat && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>}
                </div>
                <span className={`font-bold text-sm ${selectedCategory === cat ? 'text-slate-900' : 'text-slate-700'}`}>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-slate-200"></div>

        <div>
          <h3 className="font-black text-lg text-slate-900 mb-6">Hourly Rate</h3>
          <div className="h-16 flex items-end gap-1 mb-4 opacity-70">
            {[10, 30, 60, 100, 80, 40, 20, 5].map((h, i) => (
               <div key={i} className={`flex-1 rounded-t-sm transition-all ${i >= 2 && i <= 5 ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex-1 relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
               <input 
                 type="number" 
                 value={minRate}
                 onChange={e => setMinRate(Number(e.target.value))}
                 className="w-full h-10 border border-slate-300 rounded-lg pl-7 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600" 
               />
             </div>
             <span className="text-slate-400">-</span>
             <div className="flex-1 relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
               <input 
                 type="number" 
                 value={maxRate}
                 onChange={e => setMaxRate(Number(e.target.value))}
                 className="w-full h-10 border border-slate-300 rounded-lg pl-7 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600" 
               />
             </div>
          </div>
        </div>
        
        <div className="w-full h-px bg-slate-200"></div>

        <div>
          <h3 className="font-black text-lg text-slate-900 mb-6">Talent Type</h3>
          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm">Freelancers</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm">Agencies</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200"></div>

        <div>
          <h3 className="font-black text-lg text-slate-900 mb-6">Location</h3>
          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded flex items-center justify-center transition-colors bg-blue-100/50">
                 <MapPin className="w-3 h-3 text-blue-600" />
              </div>
              <span className="font-bold text-slate-900 text-sm">Worldwide</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm">North America</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm">Europe</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm">Asia Pacific</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200"></div>

        <div>
          <h3 className="font-black text-lg text-slate-900 mb-6">English Fluency</h3>
          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm">Any level</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-blue-600 flex items-center justify-center transition-colors bg-blue-50">
                 <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>
              </div>
              <span className="font-bold text-slate-900 text-sm">Fluent or Native</span>
            </label>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200"></div>

        <div>
          <h3 className="font-black text-lg text-slate-900 mb-6">Talent Badges</h3>
          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors"></div>
              <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                 Top Rated <Award className="w-4 h-4 text-blue-600" />
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border-2 border-blue-600 flex items-center justify-center transition-colors bg-blue-50">
                 <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>
              </div>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                 Top Rated Plus <Award className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 pb-20">
        <div className="flex items-center justify-between">
           <h1 className="text-3xl font-black text-slate-900">Search Talent</h1>
           <Button variant="outline" className="lg:hidden flex items-center gap-2 border-slate-300 font-bold text-slate-700 h-10 px-4 rounded-xl">
             <Filter className="w-4 h-4" /> Filters
           </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by keywords, skills, or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 bg-white border border-slate-200 rounded-2xl pl-16 pr-6 font-medium text-lg text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
          />
          <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-md cursor-pointer">
            Search
          </Button>
        </div>

        <div className="flex items-center justify-between text-sm font-bold text-slate-500 mb-8 pt-4">
           <p>{talents.length > 0 ? talents.length : 12450} freelancers available</p>
           <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
             Sort by: Relevance <ChevronDown className="w-4 h-4" />
           </button>
        </div>

        {/* Talent Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 animate-pulse">
                  <div className="flex gap-8">
                    <div className="w-24 h-24 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-4">
                      <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
                      <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
                      <div className="h-20 bg-slate-100 rounded-2xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : talents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
              <h3 className="text-xl font-black text-slate-900 mb-2">No expert talent found</h3>
              <p className="text-slate-500 font-medium">Try broadening your search criteria.</p>
            </div>
          ) : (
            talents.map((talent) => (
              <motion.div key={talent.id} onClick={() => navigate(`/profile/${talent.username || talent.id}`)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-l-4 border-l-transparent hover:border-l-blue-600 cursor-pointer">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl shrink-0 flex items-center justify-center font-black text-3xl text-slate-300 relative">
                    {talent?.avatar_url ? (
                      <img src={talent.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                    ) : (
                      talent?.full_name ? talent.full_name.substring(0, 2).toUpperCase() : 'FL'
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors max-w-lg truncate">
                          {talent?.full_name || 'Sarah Jenkins'}
                        </h2>
                        <p className="font-bold text-slate-600 text-sm mt-1 mb-4 flex items-center gap-2">
                          {Array.isArray(talent?.skills) ? talent.skills.slice(0, 3).join(' · ') : 'Expert Freelancer'}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={(e) => e.stopPropagation()} className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all">
                          <Heart className="w-5 h-5" />
                        </button>
                        <Button onClick={(e) => { e.stopPropagation(); navigate('/client/post-job'); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-600/20 text-sm md:text-base hidden sm:flex">
                          Invite to Job
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                      <div className="flex flex-col">
                        <span className="font-black text-lg text-slate-900">₹{talent?.hourly_rate || 3500}/hr</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hourly Rate</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-lg text-slate-900">{talent?.earned || '₹0'}</span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total Earned</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-lg text-slate-900 flex items-center gap-1">
                          {talent?.rating ? `${(talent.rating * 20).toFixed(0)}%` : '100%'} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mb-0.5" />
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Job Success</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-lg text-slate-900 flex items-center gap-1">
                          <span className="w-4 h-4 bg-emerald-100 rounded flex items-center justify-center text-emerald-600"><Award className="w-3 h-3" /></span> Top Rated Plus
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Badge</span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6 line-clamp-3 max-w-4xl">
                      {talent?.bio || 'Experienced professional delivering high-quality solutions for enterprise clients.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(talent?.skills || []).slice(0, 6).map((skill: string, idx: number) => (
                        <span key={idx} className="px-4 py-1.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-12">
          <Button variant="outline" className="h-12 px-8 font-bold text-slate-600 border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
            Load More Talent
          </Button>
        </div>
      </div>
    </div>
  );
}

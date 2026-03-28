import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, Heart, Filter, Clock, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const CATEGORIES = ['Web Dev', 'AI/ML', 'UI/UX', 'Mobile', 'Cyber', 'Blockchain', 'Content'];
const BUDGETS = ['Any', '< ₹3,000/hr', '₹3k-₹7k/hr', '₹7k+/hr'];

// Removed MOC_JOBS - Data is now entirely dynamic from Supabase

export default function JobFeed() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('All');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      let query = supabase.from('jobs').select('*').eq('status', 'open').order('created_at', { ascending: false });
      
      if (category !== 'All') {
        query = query.eq('category', category);
      }
      
      if (filter) {
        query = query.or(`title.ilike.%${filter}%,description.ilike.%${filter}%`);
      }

      const { data, error } = await query;
      if (error) {
        toast.error('Error fetching jobs');
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };

    fetchJobs();
  }, [category, filter]);

  const handleApply = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const toggleSave = (id: string) => {
    setSavedJobs(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const filtered = jobs.filter(j => {
    const matchText = j.title.toLowerCase().includes(filter.toLowerCase()) || j.description.toLowerCase().includes(filter.toLowerCase());
    const matchCat = category === 'All' || j.category === category;
    return matchText && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-72 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center text-slate-500 font-bold hover:text-blue-600 transition-colors mb-6 text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="bg-slate-900 rounded-3xl p-7 text-white sticky top-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-black">Filters</h2>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search titles..."
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 pl-9 pr-3 h-11 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-medium"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-slate-800 mb-6" />

            {/* Category */}
            <div className="mb-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Category</label>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${category === cat ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-800 mb-6" />

            {/* Budget Range */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Budget Range</label>
              <div className="space-y-2.5">
                {BUDGETS.map(b => (
                  <label key={b} className="flex items-center gap-3 text-sm font-medium text-slate-300 hover:text-white cursor-pointer">
                    <input type="radio" name="budget" className="accent-blue-500 w-4 h-4" defaultChecked={b === 'Any'} />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Feed */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-center justify-between mb-4 px-1">
            <h1 className="text-2xl font-black text-slate-900">
              {category === 'All' ? 'All Jobs' : category}
              <span className="text-slate-400 font-bold ml-2 text-lg">({filtered.length})</span>
            </h1>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
              {filtered.length} listings
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-7 rounded-3xl border border-slate-200 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded-xl w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded-xl w-1/2 mb-6" />
                  <div className="h-20 bg-slate-100 rounded-2xl mb-4" />
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 bg-slate-200 rounded-lg w-16" />
                    <div className="h-6 bg-slate-200 rounded-lg w-16" />
                  </div>
                  <div className="h-11 bg-slate-200 rounded-xl w-32" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
              <h3 className="text-xl font-black text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filtered.map(job => (
              <div key={job.id} className="bg-white p-7 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-600/5 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-tight cursor-pointer"
                    >
                      {job.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-3 text-xs font-bold text-slate-500">
                      <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Verified Client</span>
                      {job.category && <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">{job.category}</span>}
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.budget_min && job.budget_max 
                          ? `₹${job.budget_min.toLocaleString()} - ₹${job.budget_max.toLocaleString()}/hr`
                          : job.budget || 'Negotiable'}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />Posted today</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />Remote</span>
                    </div>
                  </div>
                  <button onClick={() => toggleSave(job.id)} className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${savedJobs.has(job.id) ? 'text-rose-500 border-rose-200 bg-rose-50' : 'text-slate-300 border-slate-200 hover:border-rose-200 hover:text-rose-400 hover:bg-rose-50'}`}>
                    <Heart className={`w-5 h-5 ${savedJobs.has(job.id) ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                <p className="text-slate-600 font-medium leading-relaxed mb-5 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(Array.isArray(job.skills) && job.skills.length > 0 ? job.skills : ['Fixed Hourly', 'Remote-First', 'Verified Client']).map((tag: string) => (
                    <span key={tag} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-xl hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={() => handleApply(job.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-7 rounded-xl shadow-md shadow-blue-600/20">
                    Submit Proposal
                  </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => navigate(`/jobs/${job.id}`)}
                     className="border-slate-200 text-slate-600 font-bold h-11 px-5 rounded-xl hover:border-blue-300 hover:text-blue-600"
                   >
                     View Details
                   </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


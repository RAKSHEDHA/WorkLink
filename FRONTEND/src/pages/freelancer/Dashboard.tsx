import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Target, TrendingUp, Sparkles, Activity, Wallet, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Milestone {
  id: string;
  status: 'pending' | 'in_progress' | 'completed';
  amount: number | string;
}

interface Contract {
  id: string;
  total_budget: number | string;
  status: string;
  job: { title: string };
  milestones: Milestone[];
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ proposals: 0, activeHires: 0, winRate: '0%', earnings: 0, matches: 0 });
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const [proposalsRes, contractsRes, jobsRes] = await Promise.all([
          supabase.from('proposals').select('status').eq('freelancer_id', profile?.id),
          supabase.from('contracts').select('*, job:jobs(title), milestones(*)').eq('freelancer_id', profile?.id),
          supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'open')
        ]);

        if (proposalsRes.data) {
          let earnings = 0;
          if (contractsRes.data) {
            const typedContracts = contractsRes.data as unknown as Contract[];
            typedContracts.forEach(c => {
              c.milestones?.forEach(m => {
                if (m.status === 'completed' || (m as any).status === 'released') {
                  const amt = typeof m.amount === 'string' ? Number(m.amount.replace(/[^0-9.-]+/g,"")) : m.amount;
                  earnings += (amt || 0);
                }
              });
            });
            setContracts(typedContracts);
          }

          setStats({
            proposals: (proposalsRes.data?.filter(p => p.status === 'pending').length || 0),
            activeHires: (proposalsRes.data?.filter(p => p.status === 'hired').length || 0),
            winRate: (proposalsRes.data?.length || 0) > 0 ? Math.round(((proposalsRes.data?.filter(p => p.status === 'hired').length || 0) / (proposalsRes.data?.length || 1)) * 100) + '%' : '0%',
            earnings: earnings,
            matches: (jobsRes.count || 0)
          });
        }
      } catch (err) {
        console.error('Freelancer dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 px-6 py-8">
      
      {/* Back Navigation & Top Banner */}
      <div className="flex items-center gap-4 mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Dashboard</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#2563EB] p-10 rounded-[2rem] border border-blue-400 shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Hello, {profile?.full_name?.split(' ')[0] || 'Professional'}
          </h1>
          <p className="text-blue-100 font-medium text-lg mt-3 flex items-center gap-2">
            You have <span className="font-bold underline decoration-blue-200/40 underline-offset-4">{stats.matches} new matches</span> waiting for your proposal today.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center bg-white/10 backdrop-blur-md p-2 pl-6 rounded-2xl border border-white/20 shadow-xl">
          <span className="text-sm font-bold text-white mr-4">Available for Hire</span>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${isAvailable ? 'bg-emerald-400' : 'bg-white/20'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* The Core Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Job Matches", value: stats.matches, icon: Target, color: "blue" },
          { title: "Earnings", value: `₹${stats.earnings.toLocaleString()}`, icon: Wallet, color: "emerald" },
          { title: "Active Proposals", value: stats.proposals, icon: Activity, color: "amber" },
          { title: "Success Score", value: stats.winRate, icon: TrendingUp, color: "purple" }
        ].map((stat, i) => (
          <div key={i} className={`bg-white border rounded-3xl p-6 flex flex-col gap-4 border-slate-200 hover:border-blue-600 transition-all hover:shadow-xl hover:shadow-blue-600/5 ${loading ? 'animate-pulse' : ''}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
              stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 
              'bg-purple-50 text-purple-600'
            }`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Project Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-900">Syncing...</p>
              </div>
            </div>
          )}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black text-black">Project Pipeline</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Active tasks and milestone tracking.</p>
            </div>
            <Link to="/proposals" className="text-blue-600 hover:text-blue-700 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition-colors">
              View All
            </Link>
          </div>
          
          <div className="p-8 flex-1">
            {!loading && contracts.length > 0 ? (
              <div className="space-y-6">
                {contracts.slice(0, 3).map((contract, i) => {
                  const completedCount = contract.milestones?.filter(m => m.status === 'completed').length || 0;
                  const totalCount = contract.milestones?.length || 1;
                  const progress = Math.round((completedCount / totalCount) * 100);
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => navigate(`/workroom/${contract.id}`)} 
                      className="group block cursor-pointer border border-slate-100 hover:border-blue-200 p-4 rounded-2xl transition-all hover:bg-blue-50/30"
                    >
                      <div className="flex justify-between items-center mb-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${contract.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} rounded-lg flex items-center justify-center font-black`}>
                            {contract.job?.title?.substring(0, 2).toUpperCase() || 'WR'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Elite Project {i+1}: {contract.job?.title || 'Active Contract'}</h4>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{contract.status || 'Active'}</p>
                          </div>
                        </div>
                        <span className="font-bold text-black border border-slate-200 px-3 py-1 rounded-full text-sm">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 min-h-[300px]">
                <Target className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="font-black text-lg text-slate-800">Your Pipeline is Empty</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm mt-2 mb-6">Browse the job feed and submit compelling proposals to start filling your project queue.</p>
                <Link to="/jobs">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg shadow-blue-600/20 text-lg">
                    Find Opportunities
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* AI Co-Pilot Widget */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative text-white flex flex-col h-full min-h-[400px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="p-8 relative z-10 flex-1 flex flex-col">
            <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black mb-2">AI Co-Pilot Insights</h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
              Based on global trends connecting <span className="text-white font-bold">{profile?.skills?.[0] || 'your core skills'}</span>, we suggest these targeted actions:
            </p>

            <div className="space-y-4 flex-1">
              <div 
                onClick={() => navigate('/profile')}
                className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 flex items-center justify-between">
                  Update Portfolio <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Clients are prioritizing explicit Case Studies detailing exactly how you execute API models. Add one now.</p>
              </div>
              <div 
                onClick={() => navigate('/jobs')}
                className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/50 cursor-pointer transition-all hover:scale-[1.02] group"
              >
                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 flex items-center justify-between">
                  Draft Proposals <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">You have a strong match rate with 3 new active high-budget postings.</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-6 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-12 font-bold">
              Ask Assistant
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

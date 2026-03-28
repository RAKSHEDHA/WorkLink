import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Briefcase, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import SpendingChart from '../../components/SpendingChart';


// Removed static STATS and MOCK_JOBS

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: string;
}

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Active Jobs', value: '0', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Total Applicants', value: '0', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Spent', value: '₹0', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Avg. Budget', value: '₹0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', profile?.id);

        const jobIds = jobsData?.map(j => j.id) || [];

        const { data: contractsData } = await supabase
          .from('contracts')
          .select('*, job:jobs(title)')
          .eq('recruiter_id', profile?.id);
        
        if (contractsData) setContracts(contractsData);

        const { count: proposalsCount } = await supabase
          .from('proposals')
          .select('id', { count: 'exact' })
          .in('job_id', jobIds);

        const { data: milestonesData } = await supabase
          .from('milestones')
          .select('amount')
          .eq('status', 'released')
          .in('contract_id', (contractsData?.map(c => c.id) || []));

        const totalSpent = milestonesData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
        const activeJobsCount = jobsData?.filter(j => j.status === 'open').length || 0;

        setStats([
          { label: 'Active Jobs', value: String(activeJobsCount), icon: Briefcase, color: 'text-white', bg: 'bg-blue-600', border: 'border-blue-700' },
          { label: 'Total Applicants', value: String(proposalsCount || 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Hiring Rate', value: jobsData?.length ? Math.round(((contractsData?.length || 0) / (jobsData?.length)) * 100) + '%' : '0%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        ]);
        
        if (jobsData && jobsData.length > 0) {
          setJobs(jobsData);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 px-6 py-8">
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
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recruiter Console</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0F172A] p-10 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 group-hover:bg-blue-600/20 transition-all duration-700"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Recruiter'}
          </h1>
          <p className="text-slate-400 font-medium text-lg mt-3 flex items-center gap-2">
            Managing <span className="text-blue-400 font-bold underline decoration-blue-400/30 underline-offset-4">{jobs.filter(j => j.status === 'open').length} active roles</span> across all departments.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Button onClick={() => navigate('/client/talent')} variant="outline" className="border-slate-700 text-white hover:bg-slate-800 h-14 px-8 rounded-xl font-bold">
            Find Talent
          </Button>
          <Button onClick={() => navigate('/client/post-job')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl shadow-xl shadow-blue-600/30 text-lg flex items-center gap-2 transition-transform active:scale-95">
            Post New Job <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white border rounded-3xl p-6 flex flex-col gap-4 border-slate-200 hover:border-blue-600 transition-all hover:shadow-xl hover:shadow-blue-600/5 ${loading ? 'animate-pulse' : ''}`}>
            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
              <s.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{loading ? '...' : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Spending Area Chart */}
      <SpendingChart />



      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Pipeline (Screenshot 2 Alignment) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-black">Project Pipeline</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Active tasks and milestone tracking.</p>
              </div>
              <Button onClick={() => navigate('/client/kanban')} variant="ghost" className="text-blue-600 hover:text-blue-700 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg">
                View All
              </Button>
            </div>
            
            <div className="p-8">
                {contracts.length > 0 ? (
                  contracts.slice(0, 3).map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate(`/workroom/${item.id}`)} 
                      className="group block cursor-pointer border border-slate-100 hover:border-blue-200 p-4 rounded-2xl transition-all hover:bg-blue-50/30"
                    >
                      <div className="flex justify-between items-center mb-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black">
                            {item.job?.title?.substring(0,2).toUpperCase() || 'EL'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.job?.title}</h4>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{item.status}</p>
                          </div>
                        </div>
                        <span className="font-bold text-black border border-slate-200 px-3 py-1 rounded-full text-sm">
                          0%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No active projects in pipeline.</p>
                  </div>
                )}
          </div>
        </div>

      {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Spend Overview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Spend Overview
            </h3>
            <div className="space-y-4">
              {[
                { label: 'This Month', value: '₹2,40,000', bar: 60 },
                { label: 'Last Month', value: '₹1,85,000', bar: 46 },
                { label: 'Q1 Total', value: '₹7,20,000', bar: 80 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-slate-600">{item.label}</span>
                    <span className="font-black text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${item.bar}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Consultants */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-white">
            <h3 className="font-black text-lg mb-4">Top Consultants</h3>
            <div className="space-y-3">
              {[
                { name: 'Elena Rodriguez', role: 'Full Stack Architect', rate: '₹15k/hr' },
                { name: 'David Chen', role: 'Senior UI/UX', rate: '₹8k/hr' },
                { name: 'Marcus Johnson', role: 'Cloud Systems', rate: '₹12k/hr' },
                { name: 'Priya Patel', role: 'ML Engineer', rate: '₹9k/hr' },
              ].map((expert, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/profile/${i + 1}`)}
                  className="bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors rounded-2xl p-3 border border-slate-700/50 flex gap-3 items-center group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                    {expert.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate group-hover:text-blue-400">{expert.name}</p>
                    <p className="text-xs text-slate-400">{expert.role} · <span className="text-emerald-400">{expert.rate}</span></p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('/client/talent')} className="w-full mt-5 bg-white hover:bg-slate-100 text-black font-bold h-11 rounded-xl text-sm">
              Browse All Talent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

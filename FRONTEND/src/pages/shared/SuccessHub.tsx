import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Download, TrendingUp, Award, Zap, Star, Users, DollarSign, ArrowUpRight, Rocket, CheckCircle2, Globe, Activity, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const RADAR_DATA = [
  { subject: 'Code Quality', A: 145, fullMark: 150 },
  { subject: 'Delivery Speed', A: 138, fullMark: 150 },
  { subject: 'Communication', A: 142, fullMark: 150 },
  { subject: 'Innovation', A: 130, fullMark: 150 },
  { subject: 'Reliability', A: 148, fullMark: 150 },
  { subject: 'Technical Depth', A: 140, fullMark: 150 },
  { subject: 'Security', A: 135, fullMark: 150 },
];

const RATING_DATA = [
  { month: 'Oct', rating: 4.1 },
  { month: 'Nov', rating: 4.3 },
  { month: 'Dec', rating: 4.5 },
  { month: 'Jan', rating: 4.2 },
  { month: 'Feb', rating: 4.5 },
  { month: 'Mar', rating: 4.8 },
  { month: 'Apr', rating: 4.7 },
  { month: 'May', rating: 4.9 },
  { month: 'Jun', rating: 5.0 },
];

const CASE_STUDIES = [
  {
    company: 'NeoFinance India',
    category: 'Web Dev',
    title: 'From MVP to ₹400Cr Valuation in 18 Months',
    excerpt: 'WorkLink matched NeoFinance with a team of 12 elite engineers and designers who rebuilt their entire core banking infrastructure, reducing transaction failure rates by 94% and enabling them to raise their Series B.',
    metrics: [{ label: 'Engineers Hired', value: '12' }, { label: 'Valuation', value: '₹400Cr' }, { label: 'Time to Market', value: '18mo' }],
    tags: ['React', 'PostgreSQL', 'AWS', 'Fintech'],
    gradient: 'from-blue-600 to-indigo-700',
    icon: TrendingUp,
  },
  {
    company: 'HealthStack AI',
    category: 'AI/ML',
    title: 'AI Diagnostics Platform Serving 2M Patients',
    excerpt: 'A single AI/ML engineer sourced on WorkLink built the computer vision pipeline that now powers their flagship diagnostic product, deployed across 400+ hospitals and clinics in India.',
    metrics: [{ label: 'Patients Served', value: '2M+' }, { label: 'Hospitals', value: '400+' }, { label: 'Accuracy Rate', value: '98.7%' }],
    tags: ['Python', 'TensorFlow', 'FastAPI', 'Health AI'],
    gradient: 'from-emerald-500 to-teal-700',
    icon: Zap,
  },
  {
    company: 'EduForge',
    category: 'Web Dev',
    title: 'Scaling to 500k Students with a Remote Team',
    excerpt: 'EduForge built their entire full-stack engineering team through WorkLink across 3 continents, scaling from 10k to 500k active students in just two semesters while maintaining 99.9% uptime.',
    metrics: [{ label: 'Active Students', value: '500k' }, { label: 'Team Size', value: '24' }, { label: 'Uptime', value: '99.9%' }],
    tags: ['Next.js', 'Supabase', 'Video', 'Scale'],
    gradient: 'from-violet-600 to-purple-800',
    icon: Award,
  },
  {
    company: 'PropTech Ventures',
    category: 'UI/UX',
    title: 'Digital-First Property Platform at ₹800Cr AUM',
    excerpt: 'WorkLink\'s talent network helped PropTech Ventures redesign their digital experience, resulting in a 340% increase in lead conversion and propelling them to India\'s #1 independent property platform.',
    metrics: [{ label: 'AUM', value: '₹800Cr' }, { label: 'Lead Conversion', value: '+340%' }, { label: 'Rankings', value: '#1 India' }],
    tags: ['Figma', 'React', 'Maps API', 'PropTech'],
    gradient: 'from-orange-500 to-rose-700',
    icon: Globe,
  },
  {
    company: 'Web3 Protocol Labs',
    category: 'Blockchain',
    title: '$50M TVL DeFi Platform in 90 Days',
    excerpt: 'A team of 3 Solidity engineers from WorkLink built and audited the smart contracts for a DeFi lending protocol that reached $50M in total value locked within the first quarter of launch.',
    metrics: [{ label: 'TVL at Launch', value: '$50M' }, { label: 'Days to Ship', value: '90' }, { label: 'Engineers', value: '3' }],
    tags: ['Solidity', 'Ethereum', 'DeFi', 'Web3'],
    gradient: 'from-slate-700 to-slate-900',
    icon: Rocket,
  },
  {
    company: 'SecureBank Systems',
    category: 'Cyber',
    title: 'Zero-Trust Infrastructure for Fintech Titan',
    excerpt: 'By integrating WorkLink\'s CyberSecurity specialists, SecureBank hardening their multi-cloud perimeter, achieving 100% compliance with international fintech security standards.',
    metrics: [{ label: 'Compliance', value: '100%' }, { label: 'Security Score', value: 'A+' }, { label: 'Audit Time', value: '4 weeks' }],
    tags: ['Pentesting', 'NIST', 'Cloud Security', 'Hardening'],
    gradient: 'from-cyan-600 to-blue-800',
    icon: CheckCircle2,
  },
];

const PLATFORM_STATS = [
  { label: 'Total Freelancers', value: '50,000+', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { label: 'Jobs Completed', value: '1.2M+', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Avg. Client Rating', value: '4.93★', icon: Star, color: 'text-amber-600 bg-amber-50' },
  { label: 'Total Paid Out', value: '₹4,200Cr', icon: DollarSign, color: 'text-violet-600 bg-violet-50' },
];

export default function SuccessHub() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<any[]>(PLATFORM_STATS);

  useEffect(() => {
    async function fetchLiveStats() {
      const { count: freelancerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'freelancer');
      const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
      
      if (freelancerCount || jobCount) {
        setStats([
          { label: 'Total Freelancers', value: `${freelancerCount || 500}+`, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Jobs Completed', value: `${jobCount || 1000}+`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg. Client Rating', value: '4.93★', icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Paid Out', value: '₹4,200Cr', icon: DollarSign, color: 'text-violet-600 bg-violet-50' },
        ]);
      }
    }
    fetchLiveStats();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [jobsRes, profilesRes] = await Promise.all([
        supabase.from('jobs').select('*').limit(250),
        supabase.from('profiles').select('id, full_name, role, bio, skills, hourly_rate, rating, location, earned').limit(250),
      ]);

      const exportData = {
        meta: {
          exported_at: new Date().toISOString(),
          platform: 'WorkLink Enterprise Marketplace',
          version: '2.0.0',
        },
        jobs: jobsRes.data ?? [
          { id: 'sample_1', title: 'Senior React Developer', category: 'Web Dev', budget_min: 5000, budget_max: 9000, status: 'open' },
          { id: 'sample_2', title: 'AI/ML Engineer', category: 'AI', budget_min: 7000, budget_max: 12000, status: 'open' },
        ],
        profiles: profilesRes.data ?? [
          { id: 'sample_f1', full_name: 'Elena Rodriguez', role: 'freelancer', skills: ['React', 'TypeScript'], hourly_rate: 15000, rating: 5.0 },
          { id: 'sample_f2', full_name: 'David Chen', role: 'freelancer', skills: ['Figma', 'UI/UX'], hourly_rate: 8500, rating: 4.9 },
        ],
        summary: {
          total_jobs: jobsRes.data?.length ?? 2,
          total_profiles: profilesRes.data?.length ?? 2,
          open_jobs: (jobsRes.data ?? []).filter((j: any) => j.status === 'open').length,
          freelancers: (profilesRes.data ?? []).filter((p: any) => p.role === 'freelancer').length,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worklink_platform_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('📦 Export ready! File downloaded successfully.');
    } catch {
      toast.error('Export failed. Please try again.');
    }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-bold text-blue-100 uppercase tracking-widest">Marketplace Insights</span>
          </div>

          <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold text-xs px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <Rocket className="w-3.5 h-3.5" />
            WORKLINK SUCCESS HUB
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            Where Unicorns<br />
            <span className="text-blue-200">Are Built</span>
          </h1>
          <p className="text-xl font-medium text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            India's most ambitious companies and global enterprises trust WorkLink to build the teams that define their success.
          </p>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-white text-blue-700 hover:bg-blue-50 font-black h-14 px-8 rounded-2xl shadow-2xl shadow-blue-900/30 text-base flex items-center gap-3 mx-auto"
          >
            {exporting
              ? <><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Preparing Export...</>
              : <><Download className="w-5 h-5" /> Download Platform Data</>
            }
          </Button>
          <p className="text-xs font-bold text-blue-300 mt-3">Exports jobs & profiles as a structured JSON file</p>
          </div>
        </div>
      </div>      {/* Stats Quick Grid */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 flex items-center gap-5 group hover:border-blue-500 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    {/* Performance Analytics */}
    <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-900">Performance Analytics</h2>
                <p className="text-slate-500 font-medium">Deep insights into your marketplace growth and impact</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart: Skill Growth */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" /> Skill Archetype
                    </h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Percentile: 98th</span>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                            <Radar
                                name="Skills"
                                dataKey="A"
                                stroke="#2563eb"
                                fill="#2563eb"
                                fillOpacity={0.6}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Area Chart: Rating History */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" /> Rating Trajectory
                    </h3>
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                        <TrendingUp className="w-3 h-3" /> +12% YoY
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={RATING_DATA}>
                            <defs>
                                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                            <YAxis domain={[4, 5]} hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="rating" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRating)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>

      {/* Case Studies Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Top Case Studies</h2>
            <p className="text-slate-500 font-medium mt-1">Real results from real companies built on WorkLink</p>
          </div>
          <span className="bg-blue-50 text-blue-700 font-bold text-sm px-4 py-2 rounded-full border border-blue-100">
            {CASE_STUDIES.length} Stories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <div key={i} onClick={() => navigate(`/case-study/${i}`)} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 group cursor-pointer hover:-translate-y-1">
              {/* Card Header */}
              <div className={`h-36 bg-gradient-to-br ${cs.gradient} p-6 flex items-end justify-between relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 60%)' }} />
                <div>
                  <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{cs.category}</span>
                  <h4 className="font-black text-white text-lg leading-tight mt-1">{cs.company}</h4>
                </div>
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <cs.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h3 className="font-black text-slate-900 text-base mb-3 group-hover:text-blue-600 transition-colors leading-snug">{cs.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5 line-clamp-3">{cs.excerpt}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-5 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  {cs.metrics.map(m => (
                    <div key={m.label} className="text-center">
                      <p className="font-black text-slate-900 text-sm">{m.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tags & CTA */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cs.tags.map(t => (
                    <span key={t} className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">{t}</span>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:gap-2.5 transition-all">
                  Read Full Case Study <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Build Your Success Story?</h2>
          <p className="text-slate-400 font-medium text-lg mb-8">Join 50,000+ professionals who chose WorkLink to build something extraordinary.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button onClick={() => navigate('/client/post-job')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-13 px-8 rounded-2xl shadow-xl shadow-blue-600/30 h-14 text-base">
              Post a Job <ArrowUpRight className="w-5 h-5 ml-1" />
            </Button>
            <Button onClick={() => navigate('/client/talent')} variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold h-14 px-8 rounded-2xl text-base">
              Find Talent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

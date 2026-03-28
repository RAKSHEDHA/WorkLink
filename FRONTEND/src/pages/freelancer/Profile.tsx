import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Star, Globe, Link as LinkIcon, ArrowUpRight, Award, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    successRate: 100,
  });

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id) {
        setLoading(false); // Ensure loading is set to false if profile.id is not available
        return;
      }

      const { data: contracts } = await supabase
        .from('contracts')
        .select('*, milestones(*)')
        .eq('freelancer_id', profile?.id);

      if (contracts) {
        // Simplified success rate
        setStats({
          totalJobs: contracts.length,
          successRate: contracts.length > 0 ? 100 : 100, // or actual logic
        });
      }
      setLoading(false);
    }

    fetchStats();
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard!');
  };

  const handleHireMe = () => {
    toast.info('Direct hiring coming soon!', {
      description: 'In the meantime, clients can invite you to jobs from the Job Feed.'
    });
  };

  if (loading && !profile) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 pb-20">
      
      {/* Identity Header */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-blue-700 to-blue-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <Button className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 font-bold px-6">
            Edit Header
          </Button>
        </div>
        
        <div className="px-8 md:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row items-end md:items-start md:justify-between -mt-16 mb-6">
            <div className="flex items-end gap-6 w-full md:w-auto mb-6 md:mb-0">
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-300">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  (profile?.full_name || 'U').substring(0,2).toUpperCase()
                )}
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
                  <Globe className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm">
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <Button onClick={handleCopyLink} variant="outline" className="flex-1 md:flex-none border-blue-200 text-blue-600 font-bold hover:bg-blue-50 h-12 px-6">
                Copy Link
              </Button>
              <Button onClick={handleHireMe} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 shadow-lg shadow-blue-600/20">
                Hire Me
              </Button>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-black tracking-tight">{profile?.full_name}</h1>
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                <CheckCircle2 className="w-4 h-4 fill-blue-600 text-blue-50" />
                <span className="text-xs font-bold px-1 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            
            <p className="text-xl font-bold text-slate-600 flex items-center gap-2 mb-6">
              Primary Focus: {profile?.skills?.[0] || 'Technical Specialist'}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-medium leading-relaxed">
              {profile?.bio || 'Professional delivering high-quality solutions for enterprise clients across the globe.'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Skills & Stats */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-xl text-black mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Skill Cloud
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 font-bold text-sm flex items-center gap-2 rounded-xl group hover:border-blue-300 transition-colors">
                  {skill} <CheckCircle2 className="w-3 h-3 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              {(!profile?.skills || profile.skills.length === 0) && (
                <div className="text-slate-400 font-medium text-sm italic">No verified skills populated.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-xl text-black mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" /> Track Record
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-black text-slate-800">{stats.successRate}%</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Job Success</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-blue-600 w-full"></div>
                </div>
              </div>
              <div className="w-full h-px bg-slate-100"></div>
              <div>
                <p className="text-3xl font-black text-slate-800">{stats.totalJobs}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Total Jobs Recorded</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Portfolio & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Portfolio Masonry */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-xl text-black">Portfolio Showcase</h3>
              <Button variant="outline" className="font-bold border-slate-200 text-slate-600">Add Project</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'FinTech Dashboard Re-architecture', client: 'NeoBank', gradient: 'from-blue-600 to-indigo-700' },
                { title: 'AI-Powered Logistical Optimizer', client: 'SwiftScale', gradient: 'from-emerald-500 to-teal-700' },
                { title: 'Real-time Web3 Trading Engine', client: 'Nexus Protocol', gradient: 'from-violet-600 to-purple-800' },
                { title: 'Cloud-Native SaaS Inventory Layer', client: 'InventoryX', gradient: 'from-orange-500 to-rose-700' },
                { title: 'Cross-Platform Health Monitoring App', client: 'VitaHealth', gradient: 'from-cyan-600 to-blue-800' },
                { title: 'Enterprise-Grade Security Audit', client: 'CyberGuard', gradient: 'from-slate-700 to-slate-900' }
              ].map((project, i) => (
                <div key={i} className="group relative rounded-2xl overflow-hidden bg-slate-100 aspect-video border border-slate-200 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-80 group-hover:opacity-95 transition-opacity duration-300`}></div>
                  <div className="absolute inset-0 z-10 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">{project.client}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg leading-tight mb-2">{project.title}</h4>
                      <div className="flex items-center gap-1.5 text-white font-bold text-xs opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        Explore Case Study <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-xl text-black mb-8 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Client Reviews
            </h3>

            <div className="relative pl-8 space-y-12">
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100 rounded-full"></div>
              
              {[
                { title: 'Global Platform Structure Build', client: 'Acme Corp', review: 'Extremely professional mapping arrays globally tracing complex models effortlessly!' }
              ].map((job, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[45px] top-1 w-6 h-6 rounded-full bg-white border-4 border-blue-600 outline outline-4 outline-white z-10"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black text-lg text-slate-900">{job.title}</h4>
                      <p className="text-sm font-bold text-blue-600 mt-1">{job.client}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed mt-4 italic">
                    "{job.review}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

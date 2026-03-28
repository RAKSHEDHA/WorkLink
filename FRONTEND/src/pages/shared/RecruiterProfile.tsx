import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Globe, 
  Users, 
  Briefcase, 
  BadgeCheck, 
  TrendingUp, 
  ExternalLink,
  Edit3,
  Save,
  X,
  Mail,
  MessageSquare,
  Share2,
  Camera,
  Image as ImageIcon,
  Loader2,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RecruiterProfileProps {
  profile: any;
  isOwnProfile: boolean;
  onRefresh: () => Promise<void>;
}

export default function RecruiterProfile({ profile, isOwnProfile, onRefresh }: RecruiterProfileProps) {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'avatar' | 'header' | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const [metrics, setMetrics] = useState({
    hiringRate: '92%',
    activeContracts: 0,
    totalSpend: 0,
    openJobs: 0
  });

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    company_name: profile.company_name || '',
    industry: profile.industry || '',
    website: profile.website || '',
    bio: profile.bio || '',
    location: profile.location || 'San Francisco, USA',
    role: profile.role || 'recruiter',
    is_onboarded: profile.is_onboarded || false,
    rating: profile.rating || 5.0,
    earned: profile.earned || 0, // Used as "Spend" for recruiters
    jobs_completed: profile.jobs_completed || 0
  });

  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecruiterData() {
      if (!profile.id) return;
      
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, total_budget, status')
        .eq('recruiter_id', profile.id);
      
      if (contracts) {
        const activeCount = contracts.filter(c => c.status === 'active').length;
        const total = contracts.reduce((acc, c) => acc + (c.total_budget || 0), 0);
        
        const contractIds = contracts.map(c => c.id);
        const { data: released } = await supabase
          .from('milestones')
          .select('amount')
          .eq('status', 'released')
          .in('contract_id', contractIds);
        
        const realSpend = released?.reduce((acc, m) => acc + (m.amount || 0), 0) || 0;

        const { count: jobCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('recruiter_id', profile.id)
          .eq('status', 'open');

        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('recruiter_id', profile.id);

        setMetrics({
          hiringRate: totalJobs ? `${Math.round((contracts.length / totalJobs) * 100)}%` : '100%',
          activeContracts: activeCount,
          totalSpend: realSpend || total,
          openJobs: jobCount || 0
        });
      }

      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', profile.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (jobs) setRecentJobs(jobs);
    }
    fetchRecruiterData();
  }, [profile.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          company_name: formData.company_name,
          industry: formData.industry,
          website: formData.website,
          bio: formData.bio,
          location: formData.location,
          role: formData.role,
          is_onboarded: formData.is_onboarded,
          rating: formData.rating,
          earned: formData.earned,
          jobs_completed: formData.jobs_completed
        })
        .eq('id', profile.id);

      if (error) throw error;
      await onRefresh();
      setEditMode(false);
      toast.success('Corporate configuration synchronized!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const bucket = type === 'avatar' ? 'avatars' : 'banners';
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const field = type === 'avatar' ? 'avatar_url' : 'header_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await onRefresh();
      toast.success(`${type === 'avatar' ? 'Corporate logo' : 'Facility cover'} updated!`);
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Hidden Inputs */}
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
      <input type="file" ref={headerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'header')} />

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] text-center relative overflow-hidden shadow-premium border border-slate-100/50">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900" />
            
            <div className="relative inline-block mb-6 group cursor-pointer" onClick={() => isOwnProfile && avatarInputRef.current?.click()}>
              <div className="w-44 h-44 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden ring-4 ring-slate-50">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-300">
                    {profile.company_name?.charAt(0) || profile.full_name?.charAt(0)}
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-sm">
                    {uploading === 'avatar' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Update Logo</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl z-20 border-4 border-white">
                <BadgeCheck className="w-6 h-6" />
              </div>
            </div>

            {editMode ? (
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</label>
                  <input 
                    type="text" 
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold outline-none focus:border-[#2563eb] transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-[#2563eb]">Primary Vertical</label>
                  <input 
                    type="text" 
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold outline-none focus:border-[#2563eb] transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Identity</label>
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold outline-none focus:border-[#2563eb] transition-all shadow-inner"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-slate-900 mb-1 leading-tight tracking-tight">{profile.company_name || 'WorkLink Enterprise'}</h1>
                <p className="text-[#2563eb] font-black text-[10px] uppercase tracking-[0.3em] mb-6 px-4 py-1.5 bg-blue-50 rounded-full inline-block mt-2">
                  {profile.industry || 'Marketplace Aggregator'}
                </p>
              </>
            )}

            <div className="flex justify-center gap-3 my-8">
              <button className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"><Mail className="w-4 h-4" /></button>
              <button className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"><MessageSquare className="w-4 h-4" /></button>
              <button className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"><Share2 className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 text-left text-sm font-bold text-slate-600">
               <div className="flex items-center gap-4">
                 <MapPin className="w-4 h-4 text-[#2563eb]" /> {editMode ? (
                   <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-300" />
                 ) : formData.location}
               </div>
               <div className="flex items-center gap-4">
                 <Globe className="w-4 h-4 text-[#2563eb]" /> {editMode ? (
                   <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-300" />
                 ) : <a href={formData.website} target="_blank" className="hover:text-[#2563eb] transition-colors truncate">{formData.website || 'worklink.io'}</a>}
               </div>
               <div className="flex items-center gap-4">
                 <Users className="w-4 h-4 text-[#2563eb]" /> 
                 <span className="flex items-center gap-2 text-slate-900 font-black uppercase text-[10px] tracking-widest">Enterprise Tier <ShieldCheck className="w-3 h-3" /></span>
               </div>
            </div>

            {isOwnProfile && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-2">
                {editMode ? (
                  <>
                    <Button onClick={handleSave} disabled={loading} className="flex-1 bg-slate-900 hover:bg-black text-white font-black h-14 rounded-2xl shadow-xl active:scale-95 transition-all">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} Sync Config
                    </Button>
                    <Button onClick={() => setEditMode(false)} variant="ghost" className="h-14 w-14 rounded-2xl border border-slate-100 hover:bg-slate-50">
                      <X className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col w-full gap-3">
                    <Button onClick={() => setEditMode(true)} className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                      <Edit3 className="w-5 h-5 mr-2" /> Live Edit Identity
                    </Button>
                    <Button onClick={() => headerInputRef.current?.click()} variant="outline" className="w-full border-slate-200 h-14 rounded-2xl font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 shadow-sm">
                      {uploading === 'header' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                      Update Cover
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[3rem] space-y-6 shadow-premium border border-slate-100/50">
            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-[0.3em]">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Enterprise Pulse
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiring Velocity</p>
                   <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100">Elite</span>
                 </div>
                 <p className="text-2xl font-black text-slate-900">{metrics.hiringRate}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Managed Spend</p>
                 <p className="text-2xl font-black text-slate-900">₹{metrics.totalSpend.toLocaleString()}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Open Pipelines</p>
                 <p className="text-2xl font-black text-[#2563eb]">{metrics.openJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-8 pt-10">
            <div className="inline-flex items-center gap-2 bg-[#2563eb]/5 text-[#2563eb] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100">
              <Building2 className="w-3.5 h-3.5" /> High-Status Corporate Identity
            </div>
            
             {editMode ? (
               <textarea 
                 value={formData.bio}
                 onChange={e => setFormData({...formData, bio: e.target.value})}
                 rows={4}
                 className="w-full text-4xl font-black text-slate-900 leading-tight bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 outline-none focus:bg-white focus:border-[#2563eb] transition-all shadow-inner placeholder:text-slate-300"
                 placeholder="About our mission..."
               />
             ) : (
               <p className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                 {profile.bio || "Empowering the future of global industry through elite technology partnerships."}
               </p>
             )}
          </div>

          {/* Active Job Postings (Recruiter's "Portfolio") */}
          <div className="pt-16 border-t border-slate-100">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">High-Intent Openings</h3>
                <p className="text-slate-400 font-bold text-sm tracking-wide">Seeking top 1% global engineering talent for mission-critical roles.</p>
              </div>
              <Button onClick={() => navigate('/jobs')} variant="ghost" className="font-black text-[#2563eb] hover:bg-blue-50 h-14 px-6 rounded-2xl group/btn text-sm uppercase tracking-widest">
                All Roles <ExternalLink className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="space-y-6">
               {recentJobs.length > 0 ? recentJobs.map((job: any) => (
                 <div key={job.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium hover:border-[#2563eb] hover:shadow-3xl transition-all duration-700 flex justify-between items-center cursor-pointer hover:-translate-y-1">
                    <div className="flex gap-8 items-center">
                       <div className="w-20 h-20 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white ring-8 ring-slate-50 group-hover:ring-[#2563eb]/10 transition-all">
                          <Briefcase className="w-9 h-9" />
                       </div>
                       <div>
                          <h4 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-[#2563eb] transition-colors uppercase tracking-tight">{job.title}</h4>
                          <div className="flex gap-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{job.category}</span>
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">₹{(job.budget_max/1000).toFixed(0)}k Max</span>
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">• {job.type || 'Remote'}</span>
                          </div>
                       </div>
                    </div>
                    <Button className="rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] h-14 px-8 bg-slate-100 text-slate-500 hover:bg-[#2563eb] hover:text-white border-none group-hover:shadow-xl transition-all">View Pipeline</Button>
                 </div>
               )) : (
                 <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-premium">
                       <Briefcase className="w-12 h-12 text-slate-200" />
                    </div>
                    <p className="font-black text-slate-900 text-xl">No active postings found</p>
                    <p className="text-sm font-bold text-slate-400 mt-2 max-w-md mx-auto">Your pipeline is currently quiet. Start hiring by posting your first mission-critical project.</p>
                 </div>
               )}
            </div>
          </div>

          <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex justify-between items-center shadow-3xl shadow-slate-900/40 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#2563eb] mb-2">Enterprise Access</p>
                <h4 className="text-3xl font-black tracking-tight">Verify Your Corporate Identity</h4>
                <p className="text-slate-400 font-bold mt-1">Unlock priority talent and industrial-grade tools.</p>
             </div>
             <Button className="bg-white text-slate-900 hover:bg-[#2563eb] hover:text-white font-black h-16 px-10 rounded-2xl relative z-10 text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95">Get Started</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

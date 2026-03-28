import { useState, useRef } from 'react';
import { 
  BadgeCheck, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  MessageSquare, 
  Share2,
  Globe,
  Star,
  Zap,
  ExternalLink,
  Edit3,
  Save,
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface FreelancerProfileProps {
  profile: any;
  isOwnProfile: boolean;
  onRefresh: () => Promise<void>;
}

export default function FreelancerProfile({ profile, isOwnProfile, onRefresh }: FreelancerProfileProps) {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<'avatar' | 'header' | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    hourly_rate: profile.hourly_rate || 0,
    location: profile.location || 'Bengaluru, India',
    skills: profile.skills || [],
    portfolio_url: profile.portfolio_url || '',
    role: profile.role || 'freelancer',
    is_onboarded: profile.is_onboarded || false,
    rating: profile.rating || 4.9,
    earned: profile.earned || 0,
    jobs_completed: profile.jobs_completed || 0
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          hourly_rate: formData.hourly_rate,
          location: formData.location,
          skills: formData.skills,
          portfolio_url: formData.portfolio_url,
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
      toast.success('System parameters synchronized!');
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
      toast.success(`${type === 'avatar' ? 'Identity image' : 'Cover system'} updated!`);
    } catch (error: any) {
      toast.error('Sync failed: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skill) });
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
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2563eb]" />
            
            <div className="relative inline-block mb-6 group cursor-pointer" onClick={() => isOwnProfile && avatarInputRef.current?.click()}>
              <div className="w-44 h-44 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden ring-4 ring-slate-50">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-300">
                    {profile.full_name?.charAt(0)}
                  </div>
                )}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-sm">
                    {uploading === 'avatar' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#2563eb] text-white p-2.5 rounded-2xl shadow-xl z-20 border-4 border-white">
                <BadgeCheck className="w-6 h-6" />
              </div>
            </div>

            {editMode ? (
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white focus:border-[#2563eb] outline-none transition-all shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hourly (₹)</label>
                    <input 
                      type="number" 
                      value={formData.hourly_rate}
                      onChange={e => setFormData({...formData, hourly_rate: parseInt(e.target.value)})}
                      className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white focus:border-[#2563eb] outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.rating}
                      onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
                      className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white focus:border-[#2563eb] outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Earned (₹)</label>
                    <input 
                      type="number" 
                      value={formData.earned}
                      onChange={e => setFormData({...formData, earned: parseInt(e.target.value)})}
                      className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white focus:border-[#2563eb] outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Completed</label>
                    <input 
                      type="number" 
                      value={formData.jobs_completed}
                      onChange={e => setFormData({...formData, jobs_completed: parseInt(e.target.value)})}
                      className="w-full h-12 px-5 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white focus:border-[#2563eb] outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{profile.full_name}</h1>
                <p className="text-[#2563eb] font-black text-xs uppercase tracking-[0.2em] mb-6 px-5 py-2 bg-blue-50 rounded-full inline-block">
                  Elite Developer • ₹{profile.hourly_rate?.toLocaleString()}/hr
                </p>
              </>
            )}

            <div className="flex justify-center gap-3 my-8">
              <button className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#2563eb] hover:text-white transition-all shadow-sm border border-slate-100"><Mail className="w-4 h-4" /></button>
              <button className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100"><MessageSquare className="w-4 h-4" /></button>
              <button className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all shadow-sm border border-slate-100"><Share2 className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 text-left">
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                <MapPin className="w-4 h-4 text-[#2563eb]" /> {editMode ? (
                  <input 
                   type="text" 
                   value={formData.location}
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-300"
                  />
                ) : profile.location || 'Bengaluru, India'}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                <LinkIcon className="w-4 h-4 text-[#2563eb]" /> {editMode ? (
                   <input 
                   type="text" 
                   value={formData.portfolio_url}
                   onChange={e => setFormData({...formData, portfolio_url: e.target.value})}
                   placeholder="Portfolio URL"
                   className="bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-slate-300"
                  />
                ) : (
                  <a href={profile.portfolio_url} target="_blank" className="hover:text-[#2563eb] transition-colors truncate max-w-[150px]">
                    {profile.portfolio_url ? profile.portfolio_url.replace('https://', '') : `worklink.io/${profile.id?.substring(0,6)}`}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                <Globe className="w-4 h-4 text-[#2563eb]" /> 
                <span className="flex items-center gap-2">Protocol: Active <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /></span>
              </div>
            </div>

            {isOwnProfile && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-2">
                {editMode ? (
                  <>
                    <Button onClick={handleSave} disabled={loading} className="flex-1 bg-[#2563eb] hover:bg-blue-700 text-white font-black h-14 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} Save Sync
                    </Button>
                    <Button onClick={() => setEditMode(false)} variant="ghost" className="h-14 w-14 rounded-2xl border border-slate-100 hover:bg-slate-50">
                      <X className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col w-full gap-3">
                    <Button onClick={() => setEditMode(true)} className="w-full bg-slate-900 hover:bg-black text-white font-black h-14 rounded-2xl shadow-2xl active:scale-95 transition-all">
                      <Edit3 className="w-5 h-5 mr-2" /> Configure Protocol
                    </Button>
                    <Button onClick={() => headerInputRef.current?.click()} variant="outline" className="w-full border-slate-200 h-14 rounded-2xl font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                      {uploading === 'header' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                      Update Banner
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[3rem] space-y-6 shadow-premium border border-slate-100/50">
            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-[0.3em]">
              <Zap className="w-5 h-5 text-amber-500" /> Reputation Pulse
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned</p>
                 <p className="text-2xl font-black text-slate-900">₹{(profile.earned || 0).toLocaleString()}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                 <p className="text-2xl font-black text-[#2563eb] flex items-center justify-center gap-1.5">
                   {profile.rating || 4.9} <Star className="w-5 h-5 fill-[#2563eb]" />
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-8 pt-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" /> Market Verified Authority
            </div>
            
            {editMode ? (
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full text-4xl font-black text-slate-900 leading-tight bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 outline-none focus:bg-white focus:border-[#2563eb] transition-all shadow-inner placeholder:text-slate-300"
                placeholder="Enterprise Mission Statement..."
              />
            ) : (
              <p className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                {profile.bio || "Crafting digital experiences that define the future of enterprise architecture."}
              </p>
            )}
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Core Competencies</h3>
            <div className="flex flex-wrap gap-4">
              {formData.skills.map((skill: string) => (
                <span key={skill} className="px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-black text-slate-900 shadow-premium flex items-center gap-3 group transition-all hover:border-[#2563eb]">
                  {skill}
                  {editMode && (
                    <button onClick={() => removeSkill(skill)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
              {editMode && (
                 <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Add skill..." 
                      className="h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold w-40 focus:w-64 transition-all outline-none focus:border-[#2563eb] shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addSkill((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                 </div>
              )}
            </div>
          </div>

          {/* Featured Portfolio Grid */}
          <div className="pt-16 border-t border-slate-100">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Portfolio Showcase</h3>
                <p className="text-slate-400 font-bold text-sm tracking-wide">Top-tier projects delivered to global enterprises.</p>
              </div>
              <Button variant="ghost" className="font-black text-[#2563eb] hover:bg-blue-50 h-14 px-6 rounded-2xl group/btn text-sm uppercase tracking-widest">
                View All <ExternalLink className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { id: 1, title: 'Nexus App', color: 'from-blue-600 to-indigo-600', img: 'https://images.unsplash.com/photo-1611974717482-9625bb602434?auto=format&fit=crop&q=80&w=400' },
                 { id: 2, title: 'Core-AI', color: 'from-purple-600 to-rose-600', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400' },
                 { id: 3, title: 'EtherVault', color: 'from-emerald-600 to-teal-600', img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=400' },
                 { id: 4, title: 'Nova Design', color: 'from-rose-600 to-amber-600', img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400' },
                 { id: 5, title: 'Grid-LMS', color: 'from-blue-400 to-blue-600', img: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=400' },
                 { id: 6, title: 'HyperAPI', color: 'from-slate-600 to-slate-900', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?auto=format&fit=crop&q=80&w=400' }
               ].map((proj) => (
                 <div key={proj.id} className="group relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-100 cursor-pointer shadow-premium hover:shadow-3xl transition-all duration-700 hover:-translate-y-2">
                    <img src={proj.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={proj.title} />
                    <div className={`absolute inset-0 bg-gradient-to-br ${proj.color} opacity-20 group-hover:opacity-60 transition-opacity duration-500`} />
                    <div className="absolute inset-x-8 bottom-8 translate-y-4 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                       <h4 className="text-2xl font-black text-white">{proj.title}</h4>
                       <p className="text-white/60 font-bold text-xs mt-1 uppercase tracking-widest">Case Study</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

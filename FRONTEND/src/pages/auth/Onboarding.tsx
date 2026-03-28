import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  CheckCircle2, 
  User, 
  ChevronRight, 
  ArrowLeft,
  Camera, 
  Loader2,
  MapPin,
  Globe,
  Star,
  Zap
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState<string>(profile?.full_name || '');
  const [bio, setBio] = useState<string>(profile?.bio || '');
  const [skills, setSkills] = useState<string>(profile?.skills?.join(', ') || '');
  const [companyName, setCompanyName] = useState<string>(profile?.company_name || '');
  const [industry, setIndustry] = useState<string>(profile?.industry || '');
  const [location, setLocation] = useState<string>(profile?.location || '');
  const [hourlyRate, setHourlyRate] = useState<number>(Number(profile?.hourly_rate) || 50);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || '');
  const [website, setWebsite] = useState<string>(profile?.website || '');

  const isFreelancer = profile?.role === 'freelancer';

  useEffect(() => {
    if (!authLoading && user && profile?.is_onboarded) {
      const dest = profile.role === 'recruiter' ? '/client/dashboard' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.uid}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Identity asset uploaded!');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const updatePayload: any = {
        full_name: fullName,
        bio,
        location,
        avatar_url: avatarUrl,
        website,
        is_onboarded: true,
      };

      if (isFreelancer) {
        updatePayload.skills = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        updatePayload.hourly_rate = Number(hourlyRate);
      } else {
        updatePayload.company_name = companyName;
        updatePayload.industry = industry;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();

      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#ffffff', '#1e293b'],
      });

      toast.success('Onboarding Successful! Entering ecosystem...');

      setTimeout(() => {
        if (profile?.role === 'recruiter') {
          navigate('/client/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 2000);
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-slate-800 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/4 opacity-60" />
      
      <div className="max-w-2xl w-full bg-white rounded-[3.5rem] shadow-4xl shadow-slate-200/50 p-12 md:p-16 border border-slate-100 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
          <motion.div
            className="h-full bg-[#2563eb] shadow-lg shadow-blue-500/30"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>

        <div className="mb-12 flex justify-between items-center">
           <div className="text-[10px] font-black text-[#2563eb] tracking-[0.2em] uppercase">Phase {step} of {totalSteps}</div>
           <div className="flex gap-1">
             {[1,2,3,4].map(i => (
               <div key={i} className={`w-2 h-2 rounded-full transition-all ${step >= i ? 'bg-[#2563eb] w-6' : 'bg-slate-200'}`} />
             ))}
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-4">
                 <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Identity & Vision.</h1>
                 <p className="text-xl text-slate-500 font-bold">Verification is the first step to industrial-grade success.</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group-hover:border-[#2563eb] transition-all">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#2563eb] text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Profile Matrix Asset</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Display Name</label>
                <Input 
                  placeholder="e.g. Alexander Pierce"
                  className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-lg px-6 focus:bg-white transition-all shadow-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <Button
                onClick={handleNext}
                disabled={!fullName}
                className="w-full h-16 text-lg font-black bg-[#2563eb] hover:bg-blue-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                Proceed to Phase 2 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-4">
                 <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {isFreelancer ? 'Global Authority.' : 'Enterprise Reach.'}
                 </h1>
                 <p className="text-xl text-slate-500 font-bold">Tell us where you fit in the ecosystem.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Location</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <Input 
                         placeholder="New York, USA"
                         className="h-16 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold shadow-sm"
                         value={location}
                         onChange={(e) => setLocation(e.target.value)}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Website / Portfolio</label>
                    <div className="relative">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <Input 
                         placeholder="worklink.io"
                         className="h-16 pl-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold shadow-sm"
                         value={website}
                         onChange={(e) => setWebsite(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              {!isFreelancer && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Company Name</label>
                    <Input
                      placeholder="Acme Global Corp"
                      className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 font-bold shadow-sm"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {isFreelancer && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Hourly Rate (₹)</label>
                   <Input 
                     type="number"
                     placeholder="2500"
                     className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 font-black text-2xl px-6 shadow-sm"
                     value={hourlyRate}
                     onChange={(e) => setHourlyRate(Number(e.target.value))}
                   />
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="ghost" className="h-16 px-8 rounded-[1.5rem] font-black group text-slate-400"><ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back</Button>
                <Button
                  onClick={handleNext}
                  disabled={!location || (isFreelancer ? !hourlyRate : !companyName)}
                  className="flex-1 h-16 text-lg font-black bg-[#2563eb] hover:bg-blue-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20 group transition-all"
                >
                  Confirm Phase 2 <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="space-y-4">
                 <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {isFreelancer ? 'Skill Matrix.' : 'Industrial Focus.'}
                 </h1>
                 <p className="text-xl text-slate-500 font-bold">Define your core competencies for precision matching.</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">
                     {isFreelancer ? 'Core Skills (Comma separated)' : 'Primary Industry'}
                  </label>
                  <Input 
                    placeholder={isFreelancer ? 'React, AI Engineering, DevOps' : 'FinTech, SaaS, Healthcare'}
                    className="h-16 rounded-2xl bg-slate-50/50 border-slate-100 font-bold px-6 shadow-sm"
                    value={isFreelancer ? skills : industry}
                    onChange={(e) => isFreelancer ? setSkills(e.target.value) : setIndustry(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">
                     {isFreelancer ? 'Professional Summary' : 'Mission Statement'}
                  </label>
                  <Textarea 
                    placeholder="Briefly describe your authority or company vision..."
                    className="min-h-[160px] rounded-[1.5rem] bg-slate-50/50 border-slate-100 font-bold p-6 shadow-sm resize-none focus:bg-white"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="ghost" className="h-16 px-8 rounded-[1.5rem] font-black group text-slate-400"><ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back</Button>
                <Button
                  onClick={handleNext}
                  disabled={(isFreelancer ? !skills : !industry) || !bio}
                  className="flex-1 h-16 text-lg font-black bg-[#2563eb] hover:bg-blue-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20 group transition-all"
                >
                  Validate Phase 3 <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 text-center">
              <div className="w-24 h-24 mx-auto bg-blue-50 text-[#2563eb] rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                 <h1 className="text-5xl font-black text-slate-900 tracking-tight">System Seal Ready.</h1>
                 <p className="text-xl text-slate-500 font-bold leading-relaxed px-4">
                    Your profile has been processed through the WorkLink industrial engine. Finalize now to activate your dashboard.
                 </p>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 grid grid-cols-3 gap-6">
                 {[
                   { icon: Star, val: 'Verified', label: 'Identity' },
                   { icon: Zap, val: 'Active', label: 'Pipeline' },
                   { icon: ShieldCheck, val: 'Protected', label: 'Financials' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="w-12 h-12 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center text-[#2563eb]"><item.icon className="w-6 h-6" /></div>
                      <p className="text-sm font-black text-slate-900">{item.val}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
                   </div>
                 ))}
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full h-18 text-xl font-black bg-slate-900 hover:bg-black text-white rounded-[1.8rem] shadow-2xl transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Enter Ecosystem'}
                </Button>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Full Data Lock Enabled</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

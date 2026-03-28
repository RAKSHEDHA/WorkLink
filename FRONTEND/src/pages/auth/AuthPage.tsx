import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Globe, ShieldCheck, Loader2, Mail, Lock, User as UserIcon, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const role = localStorage.getItem('user_role') || 'freelancer';

  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.is_onboarded) {
        navigate(profile.role === 'recruiter' ? '/client/dashboard' : '/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (formData.fullName) {
          await updateProfile(userCredential.user, { displayName: formData.fullName });
        }
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#2563eb] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white relative overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {/* Left Column: Branding & Value Prop */}
      <div className={`relative hidden lg:flex flex-col justify-between p-20 text-white overflow-hidden ${role === 'recruiter' ? 'bg-slate-900' : 'bg-[#2563eb]'}`}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-12">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-white text-[#2563eb] flex items-center justify-center font-black text-2xl italic shadow-2xl">W</div>
             <span className="text-3xl font-black tracking-tighter">WorkLink</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-black leading-[1.05] tracking-tight">
              {role === 'recruiter' ? 'Hire the best experts for your mission.' : 'Join the elite ecosystem of builders.'}
            </h1>
            <p className="text-xl font-bold opacity-70 max-w-lg leading-relaxed">
              {role === 'recruiter' 
                ? 'Scale your engineering and design teams with verified professionals in 120+ categories.' 
                : 'Execute high-intent projects and withdraw your earnings instantly via secure milestone escrow.'}
            </p>
          </div>

          <div className="space-y-4 pt-10">
            {[
              { icon: CheckCircle2, text: 'Verified Portfolios & Identity' },
              { icon: ShieldCheck, text: 'Milestone-based Escrow Protection' },
              { icon: Globe, text: '24/7 Global Talent Pipeline' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-lg font-bold opacity-80">
                <item.icon className="w-6 h-6 shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-20 border-t border-white/10 flex justify-between items-center">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-lg">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <p className="text-sm font-bold opacity-60 italic">Joined by 12k+ experts this month</p>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50/30">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-4xl shadow-slate-200/50 border border-slate-100">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                    {mode === 'signup' ? (role === 'recruiter' ? 'Scale Your Team' : 'Build Your Future') : 'Welcome Back'}
                </h2>
                <div className="inline-flex bg-slate-100 p-1.5 rounded-full mb-2">
                    <button 
                        onClick={() => setMode('login')}
                        className={`px-8 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-[#2563eb] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setMode('signup')}
                        className={`px-8 h-10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-[#2563eb] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Signup
                    </button>
                </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
                {mode === 'signup' && (
                    <div className="relative group">
                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2563eb] transition-colors" />
                        <Input 
                            required
                            placeholder="Full Name" 
                            className="pl-14 h-15 rounded-2xl border-slate-100 bg-slate-50/50 placeholder:text-slate-400 font-bold focus-visible:ring-[#2563eb] focus-visible:bg-white transition-all shadow-sm"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2563eb] transition-colors" />
                    <Input 
                        required
                        type="email"
                        placeholder="Email Address" 
                        className="pl-14 h-15 rounded-2xl border-slate-100 bg-slate-50/50 placeholder:text-slate-400 font-bold focus-visible:ring-[#2563eb] focus-visible:bg-white transition-all shadow-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2563eb] transition-colors" />
                    <Input 
                        required
                        type="password"
                        placeholder="Password" 
                        className="pl-14 h-15 rounded-2xl border-slate-100 bg-slate-50/50 placeholder:text-slate-400 font-bold focus-visible:ring-[#2563eb] focus-visible:bg-white transition-all shadow-sm"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>
                {mode === 'signup' && (
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#2563eb] transition-colors" />
                        <Input 
                            required
                            type="password"
                            placeholder="Confirm Password" 
                            className="pl-14 h-15 rounded-2xl border-slate-100 bg-slate-50/50 placeholder:text-slate-400 font-bold focus-visible:ring-[#2563eb] focus-visible:bg-white transition-all shadow-sm"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                    </div>
                )}

                <Button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-15 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (mode === 'signup' ? 'Start Building' : 'Access Hub')}
                </Button>
            </form>

            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative px-6 bg-white text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Identity Check</span>
            </div>

            <Button 
                type="button"
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="w-full h-15 rounded-2xl bg-white border-2 border-slate-100 hover:border-[#2563eb] hover:bg-slate-50 text-slate-900 font-black text-sm flex items-center justify-center gap-3 transition-all group"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Google Network Access
            </Button>

            <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    Secured by industry-standard <br/>
                    <span className="text-[#2563eb] font-black">Escrow & Verification Protocols</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

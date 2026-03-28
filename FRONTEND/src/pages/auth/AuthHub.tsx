import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../../lib/firebase';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toUUID } from '../../lib/utils';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

/* ─── Role-specific marketing copy ─── */
const ROLE_COPY: Record<string, { title: string; subtitle: string }> = {
  freelancer: {
    title: "Join 50k+ elite freelancers.",
    subtitle: "Build your portfolio, land premium gigs, and get paid on time—every time.",
  },
  recruiter: {
    title: "Hire the world's best talent.",
    subtitle: "Scale your team with verified professionals from every domain.",
  },
};

const MarketingPanel = ({ role, isLogin }: { role: string | null; isLogin: boolean }) => {
  const copy = isLogin
    ? { title: "Welcome back.", subtitle: "Log in to continue managing your workspace." }
    : ROLE_COPY[role || ''] || ROLE_COPY.freelancer;

  return (
    <div className="hidden md:flex flex-col justify-center w-[45%] bg-blue-600 p-16 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 mix-blend-multiply opacity-50" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/4" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white text-blue-600 flex items-center justify-center font-black text-2xl italic shadow-lg mb-8">
          W
        </div>
        <h2 className="text-5xl font-black mb-6 leading-tight tracking-tight">{copy.title}</h2>
        <p className="text-blue-100 text-xl font-medium max-w-sm leading-relaxed">{copy.subtitle}</p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
 * AuthHub — The single AUTH GATEWAY for both signup & login.
 *
 * ON LOGIN / SIGNUP SUCCESS:
 *   1. Fetch Supabase profile for UID.
 *   2. IF profile exists:
 *        • is_onboarded=false → /onboarding
 *        • is_onboarded=true  → role-based dashboard
 *   3. IF no profile:
 *        • Read 'user_role' from localStorage
 *        • Create profile { id, role, is_onboarded: false }
 *        • → /onboarding
 * ───────────────────────────────────────────────────────── */
export default function AuthHub({ initialMode = 'login' }: { initialMode?: 'signup' | 'login' }) {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  // The role picked on Landing / Role-Selection pages
  const selectedRole = localStorage.getItem('user_role') as 'freelancer' | 'recruiter' | null;
  const roleLabel = selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '';

  /* ── If already logged in with profile → redirect to dashboard ── */
  useEffect(() => {
    if (authLoading || loading) return;
    if (user && profile?.role && profile?.is_onboarded) {
      const dest = profile.role === 'recruiter' ? '/client/dashboard' : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, profile, authLoading, loading, navigate]);

  /* ── Unified post-auth routing ── */
  const routeAfterAuth = async (firebaseUid: string, displayName?: string, email?: string) => {
    const mappedId = await toUUID(firebaseUid);

    // 1. Check if profile exists in Supabase
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role, is_onboarded')
      .eq('id', mappedId)
      .single();

    if (existingProfile) {
      // Profile exists → route by onboarding status
      localStorage.removeItem('user_role');
      await refreshProfile();

      if (!existingProfile.is_onboarded) {
        navigate('/onboarding', { replace: true });
      } else if (existingProfile.role === 'recruiter') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      // No profile → create one with the stored role
      const role = selectedRole;
      if (!role) {
        setError('No role selected. Please go back and choose a role.');
        return;
      }

      await supabase.from('profiles').insert({
        id: mappedId,
        full_name: displayName || 'New User',
        email: email || 'unknown@example.com',
        role: role,
        is_onboarded: false,
      });
      localStorage.removeItem('user_role');
      await refreshProfile();
      navigate('/onboarding', { replace: true });
    }
  };

  /* ── Google Auth ── */
  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await routeAfterAuth(res.user.uid, res.user.displayName || undefined, res.user.email || undefined);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Email Auth ── */
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCred.user, { displayName: formData.name });
        await routeAfterAuth(userCred.user.uid, formData.name, formData.email);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        await routeAfterAuth(userCred.user.uid);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setMode('login');
        setError('Account already exists! Please log in.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ── */
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      <MarketingPanel role={selectedRole} isLogin={isLogin} />

      <div className="w-full md:w-[55%] flex items-center justify-center p-8 lg:p-24 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md"
          >
            {/* Back link (signup only) */}
            {!isLogin && (
              <button
                onClick={() => navigate('/role-selection')}
                className="flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roles
              </button>
            )}

            <h1 className="text-4xl font-black text-black mb-2">
              {isLogin ? 'Log In' : 'Create Account'}
            </h1>

            {/* Role badge (signup) */}
            {!isLogin && selectedRole && (
              <p className="text-sm font-bold text-blue-600 mb-6 capitalize">Joining as {roleLabel}</p>
            )}
            {isLogin && (
              <p className="text-slate-500 font-medium mb-6">Welcome back to WorkLink</p>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 font-bold rounded-lg mb-6 text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* Google */}
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-14 bg-white hover:bg-slate-50 border-2 border-slate-200 text-black font-bold text-lg rounded-xl mb-6 shadow-sm flex items-center justify-center gap-3 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Or email</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Full Name</label>
                  <Input
                    required
                    className="bg-slate-50 h-14 font-medium"
                    placeholder="First and Last name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Email Address</label>
                <Input
                  required
                  type="email"
                  className="bg-slate-50 h-14 font-medium"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Secure Password</label>
                <Input
                  required
                  type="password"
                  className="bg-slate-50 h-14 font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button
                disabled={loading}
                type="submit"
                className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              >
                {loading ? 'Processing...' : isLogin ? 'Access Account' : `Join as ${roleLabel || 'Member'}`}
              </Button>
            </form>

            {/* Toggle login/signup */}
            {isLogin ? (
              <p className="text-center mt-8 text-slate-600 font-medium">
                New to WorkLink?{' '}
                <Link to="/role-selection" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
              </p>
            ) : (
              <p className="text-center mt-8 text-slate-600 font-medium">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                  <LogIn className="w-3.5 h-3.5" /> Log In
                </button>
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

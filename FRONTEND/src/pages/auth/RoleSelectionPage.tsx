import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Briefcase, ChevronRight, LogIn, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleSelectionPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  // Already authenticated with a role → dashboard
  if (user && profile?.role) {
    const dest = profile.is_onboarded
      ? (profile.role === 'recruiter' ? '/client/dashboard' : '/dashboard')
      : '/onboarding';
    return <Navigate to={dest} replace />;
  }

  const handleRoleSelection = (role: 'freelancer' | 'recruiter') => {
    localStorage.setItem('user_role', role);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/4 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 opacity-60" />

      {/* Back to Home */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Home
      </button>

      <div className="w-full max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-[#2563eb] rounded-[2rem] text-white flex items-center justify-center font-black text-4xl italic mx-auto mb-8 shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
            W
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
            How do you want to <br />
            use <span className="text-[#2563eb]">WorkLink?</span>
          </h1>
          <p className="text-slate-500 text-xl font-bold max-w-lg mx-auto leading-relaxed">
            Select your primary objective to join the world's first industrial-grade marketplace.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 px-4">
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -10, scale: 1.01 }}
            onClick={() => handleRoleSelection('freelancer')}
            className="group relative bg-white border border-slate-100 rounded-[3rem] p-12 text-left hover:border-[#2563eb] transition-all shadow-xl shadow-slate-200/50 hover:shadow-4xl hover:shadow-[#2563eb]/10"
          >
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-slate-50 text-slate-900 rounded-3xl flex items-center justify-center group-hover:bg-[#2563eb] group-hover:text-white transition-all shadow-sm">
                <User className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Join as a Freelancer</h3>
                <p className="text-slate-500 font-bold leading-relaxed text-lg">
                  I'm here to find high-intent projects, build my authority, and get paid securely.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[#2563eb] font-black text-lg group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                  Find Work <ChevronRight className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-slate-300 uppercase tracking-widest leading-none">Talent Hub</span>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10, scale: 1.01 }}
            onClick={() => handleRoleSelection('recruiter')}
            className="group relative bg-slate-900 rounded-[3rem] p-12 text-left border border-slate-800 transition-all shadow-4xl shadow-slate-900/40 hover:border-[#2563eb]/50"
          >
            <div className="relative z-10 space-y-8">
              <div className="w-20 h-20 bg-white/5 text-blue-400 rounded-3xl flex items-center justify-center group-hover:bg-[#2563eb] group-hover:text-white transition-all shadow-sm">
                <Briefcase className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white tracking-tight">Join as a Recruiter</h3>
                <p className="text-slate-400 font-bold leading-relaxed text-lg">
                  I'm here to hire elite professionals, manage large-scale pipelines, and grow my business.
                </p>
              </div>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-blue-400 font-black text-lg group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                   Hire Talent <ChevronRight className="w-5 h-5" />
                </span>
                <span className="text-xs font-black text-white/20 uppercase tracking-widest leading-none">Enterprise Suite</span>
              </div>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16 pt-8 border-t border-slate-50"
        >
          <p className="text-slate-400 font-bold text-lg">
            Already a member?{' '}
            <button
              onClick={() => navigate('/auth')}
              className="text-[#2563eb] font-black hover:underline inline-flex items-center gap-1 group"
            >
              Access Identity <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { syncFirstTimeData } from '../../lib/firstTimeSync';
import { Loader2 } from 'lucide-react';

/**
 * DashboardBridge — The TRAFFIC CONTROLLER.
 *
 * This is the ONLY page users see after a repeat sign-in.
 * It reads the profile and shunts to the correct destination:
 *   • No user      → /
 *   • No role       → /role-selection
 *   • Not onboarded → /onboarding
 *   • Freelancer    → /dashboard  (with first-time data sync)
 *   • Recruiter     → /client/dashboard (with first-time data sync)
 */
export default function DashboardBridge() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    if (!profile || !profile.role) {
      navigate('/role-selection', { replace: true });
      return;
    }

    if (!profile.is_onboarded) {
      navigate('/onboarding', { replace: true });
      return;
    }

    // Run first-time data sync then redirect
    const go = async () => {
      await syncFirstTimeData(profile.id, profile.role!);

      if (profile.role === 'freelancer') {
        navigate('/dashboard', { replace: true });
      } else if (profile.role === 'recruiter') {
        navigate('/client/dashboard', { replace: true });
      }
    };
    go();
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg blur-xl opacity-20 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            WorkLink is securing your session...
          </h2>
          <p className="text-slate-500 font-bold text-sm animate-pulse capitalize">
            Syncing {profile?.role || 'Marketplace'} Identity...
          </p>
        </div>
      </div>
    </div>
  );
}

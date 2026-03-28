import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  requiredRole?: 'freelancer' | 'recruiter';
}

export default function RoleGuard({ requiredRole }: RoleGuardProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="font-black text-slate-900 animate-pulse uppercase tracking-widest text-xs">Verifying Access...</p>
      </div>
    );
  }

  // 1. Not Logged In
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 1.5 No Role Selected
  if (profile && !profile.role) {
    return <Navigate to="/role-selection" replace />;
  }

  // 2. Not Onboarded
  if (profile && !profile.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Wrong Role (Intelligent Shunting)
  if (requiredRole && profile && profile.role !== requiredRole) {
    const targetDashboard = profile.role === 'recruiter' ? '/client/dashboard' : '/dashboard';
    return <Navigate to={targetDashboard} replace />;
  }

  return <Outlet />;
}

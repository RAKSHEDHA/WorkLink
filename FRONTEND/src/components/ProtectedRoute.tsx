import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ requireOnboarded = false }: { requireOnboarded?: boolean }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-white">
        Authenticating Secure Environment...
      </div>
    );
  }

  // 1. Firebase Unauthenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 2. Firebase Authenticated, but NO Supabase Profile (Role pending)
  if (user && !profile && location.pathname !== '/auth/choice') {
    return <Navigate to="/auth/choice" replace />;
  }

  // 3. Supabase Profile Exists, but Onboarding Pending
  if (requireOnboarded && profile && !profile.is_onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

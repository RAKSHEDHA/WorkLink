import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleGuard from './components/auth/RoleGuard';
import { Toaster } from 'sonner';

import ErrorBoundary from './components/shared/ErrorBoundary';

// Layouts
import FreelancerLayout from './components/layout/FreelancerLayout';
import ClientLayout from './components/layout/ClientLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import Onboarding from './pages/auth/Onboarding';
import DashboardBridge from './pages/auth/DashboardBridge';
import NotFound from './pages/NotFound';

// Lazy Loaded Clusters
const Profile = lazy(() => import('./pages/shared/Profile'));
const FreelancerDashboard = lazy(() => import('./pages/freelancer/Dashboard'));
const JobFeed = lazy(() => import('./pages/freelancer/JobFeed'));
const JobDetail = lazy(() => import('./pages/shared/JobDetail'));
const ProposalManager = lazy(() => import('./pages/freelancer/ProposalManager'));
const Wallet = lazy(() => import('./pages/freelancer/Wallet'));

const ClientDashboard = lazy(() => import('./pages/recruiter/Dashboard'));
const PostJobWizard = lazy(() => import('./pages/recruiter/PostJobWizard'));
const KanbanBoard = lazy(() => import('./pages/recruiter/KanbanBoard'));
const TalentSearch = lazy(() => import('./pages/recruiter/TalentSearch'));
const ProposalView = lazy(() => import('./pages/shared/ProposalView'));
const ContractsList = lazy(() => import('./pages/client/ContractsList'));
const FreelancerTime = lazy(() => import('./pages/client/FreelancerTime'));
const WorkDiaries = lazy(() => import('./pages/client/WorkDiaries'));
const CustomExport = lazy(() => import('./pages/client/CustomExport'));
const Messages = lazy(() => import('./pages/client/Messages'));
const SuccessHub = lazy(() => import('./pages/shared/SuccessHub'));
const Transactions = lazy(() => import('./pages/client/Transactions'));
const Support = lazy(() => import('./pages/shared/Support'));
const Settings = lazy(() => import('./pages/client/Settings'));
const WorkroomsList = lazy(() => import('./pages/client/WorkroomsList'));
const Workroom = lazy(() => import('./pages/shared/Workroom'));
const PublicProfile = lazy(() => import('./pages/shared/PublicProfile'));
const CaseStudyDetail = lazy(() => import('./pages/shared/CaseStudyDetail'));
const Analytics = lazy(() => import('./pages/client/Analytics'));
const Portfolio = lazy(() => import('./pages/shared/Portfolio'));

import { Skeleton } from './components/ui/Skeleton';

const GlobalLoader = () => (
  <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-center bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    </div>
  </div>
);

const RootRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  
  if (user && profile) {
    if (!profile.is_onboarded) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/dashboard-bridge" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" expand={true} richColors closeButton />
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            <Route path="/" element={<RootRoute><LandingPage /></RootRoute>} />
            <Route path="/signup" element={<RoleSelectionPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard-bridge" element={<DashboardBridge />} />
            
            {/* Redirects for legacy paths */}
            <Route path="/auth/choice" element={<Navigate to="/signup" replace />} />
            <Route path="/auth/login" element={<Navigate to="/auth" replace />} />
            <Route path="/auth/signup" element={<Navigate to="/auth" replace />} />

            {/* Shared Authenticated Routes */}
            <Route element={<RoleGuard />}>
              <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
              <Route path="/profile/:id" element={<ErrorBoundary><PublicProfile /></ErrorBoundary>} />
              <Route path="/case-study/:id" element={<ErrorBoundary><CaseStudyDetail /></ErrorBoundary>} />
              <Route path="/success-hub" element={<ErrorBoundary><SuccessHub /></ErrorBoundary>} />
              <Route path="/support" element={<ErrorBoundary><Support /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
              <Route path="/portfolio" element={<ErrorBoundary><Portfolio /></ErrorBoundary>} />
              <Route path="/messages" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
              <Route path="/messages/:id" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
              <Route path="/workrooms" element={<ErrorBoundary><WorkroomsList /></ErrorBoundary>} />
              <Route path="/workroom/:id" element={<ErrorBoundary><Workroom /></ErrorBoundary>} />
            </Route>

            {/* Freelancer Domain */}
            <Route element={<RoleGuard requiredRole="freelancer" />}>
              <Route element={<FreelancerLayout />}>
                <Route path="/dashboard" element={<ErrorBoundary><FreelancerDashboard /></ErrorBoundary>} />
                <Route path="/jobs" element={<ErrorBoundary><JobFeed /></ErrorBoundary>} />
                <Route path="/jobs/:id" element={<ErrorBoundary><JobDetail /></ErrorBoundary>} />
                <Route path="/proposals" element={<ErrorBoundary><ProposalManager /></ErrorBoundary>} />
                <Route path="/wallet" element={<ErrorBoundary><Wallet /></ErrorBoundary>} />
              </Route>
            </Route>

            {/* Recruiter Domain */}
            <Route element={<RoleGuard requiredRole="recruiter" />}>
              <Route path="/client" element={<ClientLayout />}>
                <Route path="dashboard" element={<ErrorBoundary><ClientDashboard /></ErrorBoundary>} />
                <Route path="post-job" element={<ErrorBoundary><PostJobWizard /></ErrorBoundary>} />
                <Route path="kanban" element={<ErrorBoundary><KanbanBoard /></ErrorBoundary>} />
                <Route path="talent" element={<ErrorBoundary><TalentSearch /></ErrorBoundary>} />
                <Route path="proposals/:id" element={<ErrorBoundary><ProposalView /></ErrorBoundary>} />
                <Route path="contracts" element={<ErrorBoundary><ContractsList /></ErrorBoundary>} />
                <Route path="time-tracking" element={<ErrorBoundary><FreelancerTime /></ErrorBoundary>} />
                <Route path="work-diaries" element={<ErrorBoundary><WorkDiaries /></ErrorBoundary>} />
                <Route path="custom-export" element={<ErrorBoundary><CustomExport /></ErrorBoundary>} />
                <Route path="transactions" element={<ErrorBoundary><Transactions /></ErrorBoundary>} />
                <Route path="analytics" element={<ErrorBoundary><Analytics /></ErrorBoundary>} />
                <Route path="job/:id" element={<ErrorBoundary><JobDetail /></ErrorBoundary>} />
              </Route>
            </Route>

            <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

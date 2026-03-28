import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Sparkles, 
  Settings,
  User,
  ArrowLeftRight,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

export default function SidebarF() {
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();

  const primaryItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Workrooms', icon: Sparkles, path: '/workrooms' },
    { name: 'My Jobs', icon: FileText, path: '/proposals' },
    { name: 'Job Search', icon: Search, path: '/jobs' },
    { name: 'Success Hub', icon: Sparkles, path: '/success-hub' },
    { name: 'Portfolio', icon: User, path: '/portfolio' },
  ];

  const handleSwitchRole = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'recruiter' })
        .eq('id', profile?.id);
      if (error) throw error;
      toast.success('Switching to Recruiter Console...');
      await refreshProfile();
    } catch (err: any) {
      toast.error('Switch failed: ' + err.message);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-80px)] sticky top-20 flex flex-col p-4">
      {/* User Identity */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4 rounded-2xl bg-blue-50 border border-blue-100 shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 text-sm truncate">{profile?.full_name || 'User'}</p>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Freelancer</p>
        </div>
        <div className="flex gap-1">
          <Link to="/messages" className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Primary Nav */}
      <div className="space-y-1 overflow-y-auto no-scrollbar flex-1 pr-2">
        {primaryItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Account Section */}
      <div className="mt-auto pt-4 space-y-1">
        <hr className="my-4 border-slate-100" />
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/profile' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-5 h-5 text-slate-400" />
          My Profile
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/settings' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-5 h-5 text-slate-400" />
          Settings
        </Link>
        <Link
          to="/support"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/support' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-5 h-5 text-slate-400" />
          Support Center
        </Link>

        {/* Role Switch */}
        <button 
          onClick={handleSwitchRole}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-lg active:scale-95"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Switch to Recruiter
        </button>
      </div>
    </aside>
  );
}

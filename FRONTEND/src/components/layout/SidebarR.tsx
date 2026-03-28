import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ArrowLeftRight,
  Sparkles,
  MessageSquare,
  User,
  Briefcase,
  HelpCircle
} from 'lucide-react';

export default function SidebarR() {
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();

  const primaryItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/client/dashboard' },
    { name: 'Workrooms', icon: Sparkles, path: '/workrooms' },
    { name: 'My Jobs', icon: Briefcase, path: '/client/kanban' },
    { name: 'Talent Search', icon: Users, path: '/client/talent' },
    { name: 'Success Hub', icon: BarChart3, path: '/success-hub' },
    { name: 'Company Details', icon: User, path: '/profile' },
  ];

  const handleSwitchRole = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'freelancer' })
        .eq('id', profile?.id);
      if (error) throw error;
      toast.success('Switching to Freelancer Dashboard...');
      await refreshProfile();
    } catch (err: any) {
      toast.error('Switch failed: ' + err.message);
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-[calc(100vh-80px)] sticky top-20 flex flex-col p-4 shadow-2xl">
      {/* User Identity */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-10 h-10 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm shrink-0">
            {(profile?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-sm truncate">{profile?.full_name || 'User'}</p>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Recruiter</p>
        </div>
        <div className="flex gap-1">
          <Link to="/client/messages" className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Primary Nav */}
      <div className="space-y-1 overflow-y-auto no-scrollbar flex-1 pr-2">
        <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Recruiter Tools</p>
        {primaryItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${isActive
                  ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-300'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Account Section */}
      <div className="mt-auto pt-4 space-y-1">
        <hr className="my-4 border-slate-800" />
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/profile' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <User className="w-5 h-5 text-slate-600" />
          My Profile
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/settings' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 text-slate-600" />
          Settings
        </Link>
        <Link
          to="/client/support"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            location.pathname === '/client/support' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <HelpCircle className="w-5 h-5 text-slate-600" />
          Support Center
        </Link>

        {/* Role Switch */}
        <button
          onClick={handleSwitchRole}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Switch to Freelancer
        </button>
      </div>
    </aside>
  );
}

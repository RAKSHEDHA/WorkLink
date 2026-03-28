import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  LogOut,
  Search,
  ExternalLink,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import AiCoPilot from '../shared/AiCoPilot';
import NotificationCenter from '../shared/NotificationCenter';
import SidebarF from './SidebarF';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function FreelancerLayout() {
  const { user, profile, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && profile.role !== 'freelancer') {
      navigate('/client/dashboard');
    }
  }, [profile, navigate]);

  const handleSwitchRole = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'recruiter' })
        .eq('id', profile?.id);
      
      if (error) throw error;
      toast.success('Switching to Recruiter dashboard...');
      window.location.href = '/dashboard-bridge'; // Force fresh bridge check
    } catch (err: any) {
      toast.error('Failed to switch role: ' + err.message);
    }
  };

  const [earned, setEarned] = useState(452500);

  useEffect(() => {
    async function fetchEarned() {
      if (!profile?.id) return;
      const { data: contracts } = await supabase.from('contracts').select('id').eq('freelancer_id', profile.id);
      if (contracts && contracts.length > 0) {
        const cIds = contracts.map(c => c.id);
        const { data: milestones } = await supabase.from('milestones').select('amount').eq('status', 'released').in('contract_id', cIds);
        if (milestones) {
          const total = milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
          if (total > 0) setEarned(total);
        }
      }
    }
    fetchEarned();
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative">
      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-6 h-20 flex items-center justify-between gap-8">
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-black text-xl italic shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight hidden md:block">WorkLink</span>
          </Link>
        </div>

        {/* Centered Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="w-full max-w-xl relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search high-intent jobs or global talent..." 
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-bold text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/wallet" className="hidden sm:flex items-center gap-2 px-4 h-11 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Wallet className="w-4 h-4 text-white/80 mr-1" />
            <span className="opacity-60 uppercase text-[9px] tracking-widest mr-1">Earned:</span> ₹{earned.toLocaleString()}
          </Link>

          <Link to="/messages" className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200 bg-white shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </Link>

          <NotificationCenter />

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-11 h-11 rounded-xl border-2 border-blue-600 flex items-center justify-center hover:shadow-lg hover:shadow-blue-600/20 transition-all overflow-hidden bg-slate-100"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-sm font-black text-blue-600">
                  {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-40 p-2 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shrink-0">
                        {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 truncate">{user?.displayName || profile?.full_name}</p>
                      <p className="text-xs font-bold text-slate-500 truncate">{user?.email}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-0.5">{profile?.role}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-3 text-slate-400" /> Public Profile
                    </Link>
                    <button onClick={handleSwitchRole} className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-blue-50 text-sm font-bold text-blue-600 transition-colors">
                      <ExternalLink className="w-4 h-4 mr-3 text-blue-500" /> Switch to Recruiter
                    </button>
                    <div className="w-full h-px bg-slate-100 my-2"></div>
                    <button onClick={() => { setIsProfileOpen(false); signOut(); }} className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600 transition-colors">
                      <LogOut className="w-4 h-4 mr-3 text-red-500" /> Log Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Layout Body */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile Overlay */}
        <div className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
        
        {/* Sidebar Container */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0'}`}>
           <div className={`${!isSidebarOpen && 'lg:hidden'}`}>
             <SidebarF />
           </div>
        </div>
        
        <main className={`flex-1 w-full mx-auto pb-12 pt-8 px-4 md:px-6 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-6' : 'lg:pl-12'}`}>
          <Outlet />
        </main>
      </div>

      <AiCoPilot />
    </div>
  );
}

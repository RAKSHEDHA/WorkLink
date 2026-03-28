import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Search, Users, Menu, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AiCoPilot from '../shared/AiCoPilot';
import NotificationCenter from '../shared/NotificationCenter';
import SidebarR from './SidebarR';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function ClientLayout() {
  const { user, profile, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && profile.role !== 'recruiter') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleSwitchToFreelancer = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'freelancer' })
        .eq('id', profile?.id);
      
      if (error) throw error;
      toast.success('Switching to Freelancer dashboard...');
      window.location.href = '/dashboard-bridge';
    } catch (err: any) {
      toast.error('Failed to switch role: ' + err.message);
    }
  };

  const [spent, setSpent] = useState(0);

  useEffect(() => {
    async function fetchSpent() {
      if (!profile?.id) return;
      const { data: contracts } = await supabase.from('contracts').select('id').eq('recruiter_id', profile.id);
      if (contracts && contracts.length > 0) {
        const cIds = contracts.map(c => c.id);
        const { data: milestones } = await supabase.from('milestones').select('amount').eq('status', 'released').in('contract_id', cIds);
        if (milestones) {
          const total = milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
          setSpent(total);
        }
      }
    }
    fetchSpent();
  }, [profile]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 md:px-8 h-20 flex items-center justify-between gap-8">
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/client/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-black text-xl italic shadow-md group-hover:scale-105 transition-transform">
              W
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight hidden lg:block">WorkLink</span>
          </Link>
        </div>

        {/* Centered Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="w-full max-w-xl relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search talent, projects, or insights..." 
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-bold text-sm transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/client/analytics" className="hidden sm:flex items-center gap-2 px-4 h-11 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
            <span className="opacity-60 uppercase text-[9px] tracking-widest">Spent:</span> ₹{spent.toLocaleString()}
          </Link>

          <Link to="/client/messages" className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200 bg-white shadow-sm">
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

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 z-40 overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-inner shrink-0">
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-lg text-slate-900 truncate">{user?.displayName || profile?.full_name}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1 truncate">{user?.email}</p>
                          <p className="text-xs font-bold text-slate-400 mt-0.5">Client ID: WL-{profile?.id?.substring(0,6).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={handleSwitchToFreelancer} className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-blue-50 text-sm font-bold text-blue-600 transition-colors">
                        <Users className="w-4 h-4 mr-3 text-blue-500" /> Switch to Freelancer
                      </button>
                      <div className="w-full h-px bg-slate-100 my-2"></div>
                      <button onClick={() => { setIsProfileOpen(false); signOut(); }} className="w-full flex items-center px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-600 transition-colors">
                        <LogOut className="w-4 h-4 mr-3 text-red-500" /> Log Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
            <SidebarR />
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

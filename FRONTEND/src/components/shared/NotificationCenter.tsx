import { useState, useEffect } from 'react';
import { Bell, CheckSquare, MessageSquare, DollarSign, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase.channel(`notifications:${profile?.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile?.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Trigger Sonner toast
        toast.info(payload.new.title, {
          description: payload.new.message,
          icon: <Bell className="w-4 h-4" />,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile?.id);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'proposal': return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case 'milestone': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-violet-500" />;
      case 'system': return <Zap className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-900">Notifications</h3>
                <button 
                  onClick={markAllRead}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold text-sm">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="mt-1 w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                        {getTypeIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <button className="text-xs font-black text-slate-500 hover:text-slate-900 transition-colors">
                  View all activity
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

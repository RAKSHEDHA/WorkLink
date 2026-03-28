import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AiCoPilot() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', content: `Hello ${profile?.full_name?.split(' ')[0] || 'User'}! I am your enterprise Co-Pilot. I have direct access to the WorkLink cluster state. How can I help you navigate the marketplace today?` }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thoughts, isThinking]);

  const simulateReasoning = async (userQuery: string) => {
    setIsThinking(true);
    setThoughts([]);
    
    const steps = [
      "Analyzing intent: " + (userQuery.toLowerCase().includes('earning') ? 'Financial Audit' : 'Routing Efficiency'),
      "Securing cluster handshake...",
      "Verifying credentials for " + (profile?.role || 'user'),
      "Executing intent-based redirection..."
    ];

    for (const step of steps) {
      setThoughts(prev => [...prev, step]);
      await new Promise(r => setTimeout(r, 700));
    }

    const q = userQuery.toLowerCase();

    if (q.includes('earning') || q.includes('wallet') || q.includes('money') || q.includes('payment')) {
      const resp = "Directing you to the Wallet & Earnings Hub. Your real-time balance and transaction history are synchronized there.";
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: resp,
        action: "Navigating to /wallet..."
      }]);
      setTimeout(() => {
        navigate('/wallet');
        setIsOpen(false);
      }, 1800);
    } else if (q.includes('hire') || q.includes('post') || q.includes('recruit')) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Initializing Recruitment Engine. Opening the Post-Job orchestration wizard.",
        action: "Navigating to /client/post-job..."
      }]);
      setTimeout(() => {
        navigate('/client/post-job');
        setIsOpen(false);
      }, 1800);
    } else if (q.includes('message') || q.includes('chat') || q.includes('inbox')) {
      const target = profile?.role === 'recruiter' ? '/client/messages' : '/messages';
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Securing connection to the Messaging cluster. Loading active threads.",
        action: `Navigating to ${target}...`
      }]);
      setTimeout(() => {
        navigate(target);
        setIsOpen(false);
      }, 1800);
    } else if (q.includes('status') || q.includes('system')) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `WorkLink Production Status:\n• Database: 1000+ Verified Rows\n• Realtime: Active WebSockets\n• Security: Firebase Auth + 2FA State\n• UI: Action Blue Optimized`
      }]);
    } else {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "I've analyzed your request. I can help with earnings, job postings, messaging, and system settings. Try asking 'Show my earnings' or 'Go to Settings'." 
      }]);
    }

    setIsThinking(false);
    setThoughts([]);
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    simulateReasoning(userMsg);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#2563EB] hover:bg-blue-700 active:scale-90 transition-all text-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center z-40 group border-2 border-white/20"
      >
        <Sparkles className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#2563EB]"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[60]"></motion.div>
            <motion.div 
              initial={{ x: '100%', opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[70] flex flex-col overflow-hidden border-l border-slate-200"
            >
              {/* Header */}
              <div className="h-28 px-8 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-2xl tracking-tight">WorkLink AI</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Enterprise Engine v4.0</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Area */}
              <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto flex flex-col gap-8 custom-scrollbar bg-slate-50/30">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'ai' ? 'bg-[#2563EB] text-white' : 'bg-slate-900 text-white'}`}>
                        {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : 'U'}
                      </div>
                      <div className={`max-w-[280px] p-5 rounded-3xl ${msg.role === 'ai' ? 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100' : 'bg-[#2563EB] text-white rounded-tr-sm shadow-xl shadow-blue-600/10'}`}>
                        <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                    {msg.action && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 ml-11 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                        <Navigation className="w-3 h-3" /> {msg.action}
                      </motion.div>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-100">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-white p-5 rounded-3xl rounded-tl-sm border border-slate-100 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce delay-75"></span>
                          <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce delay-150"></span>
                        </div>
                      </div>
                      <div className="space-y-2 ml-1">
                        {thoughts.map((thought, i) => (
                          <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-5 h-px bg-slate-200"></div>
                            {thought}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-8 border-t border-slate-100 bg-white">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask 'Show my earnings'..." 
                    className="w-full h-16 bg-slate-50 border border-slate-200 rounded-[1.25rem] pl-6 pr-16 text-sm text-slate-900 font-bold placeholder-slate-400 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-600/5 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center text-white hover:bg-blue-700 active:scale-90 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Show my earnings', 'System Status', 'Help'].map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => { setQuery(tag); }}
                      className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-100 text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Paperclip, Send, SearchIcon, Phone, Video, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeThread, setActiveThread] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!user) return;
      setLoading(true);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .neq('id', profile?.id)
        .limit(20);
      
      if (profiles) {
        const formattedThreads = profiles.map((p) => ({
          id: p.id,
          name: p.full_name,
          role: p.role,
          time: 'Active Now',
          unread: 0,
          online: true,
          lastMsg: 'Direct database link established...',
        }));
        setThreads(formattedThreads);
        
        if (id) {
          const found = formattedThreads.find(t => t.id === id);
          if (found) setActiveThread(found);
        } else if (formattedThreads.length > 0) {
          setActiveThread(formattedThreads[0]);
        }
      }
      setLoading(false);
    };

    fetchThreads();
  }, [user, id]);

  useEffect(() => {
    if (!activeThread || !user) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile?.id},receiver_id.eq.${activeThread.id}),and(sender_id.eq.${activeThread.id},receiver_id.eq.${profile?.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase.channel(`room:${activeThread.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${profile?.id}` 
      }, (payload) => {
        if (payload.new.sender_id === activeThread.id) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread?.id, user?.uid]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThread || !user) return;
    
    setSending(true);
    const msgData = {
      sender_id: profile?.id,
      receiver_id: activeThread.id,
      content: newMessage,
    };

    const { data, error } = await supabase.from('messages').insert(msgData).select().single();

    if (error) {
      toast.error('Failed to send message');
    } else {
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 h-[calc(100vh-140px)] flex bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden relative z-10 mx-4">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full h-10 border border-slate-200 rounded-xl pl-10 pr-4 text-sm font-medium focus:border-blue-600 outline-none bg-slate-50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-8 text-xs font-bold border-slate-300 rounded-lg flex-1">All Threads</Button>
            <Button variant="ghost" className="h-8 text-xs font-bold text-slate-500 rounded-lg flex-1 hover:bg-slate-100">Unread</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {threads.map((t) => (
            <div 
              key={t.id} 
              onClick={() => {
                setActiveThread(t);
                navigate(`/messages/${t.id}`);
              }}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex gap-3 ${activeThread?.id === t.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center font-black text-slate-600 text-lg">
                  {t.name.substring(0,2).toUpperCase()}
                </div>
                {t.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className={`font-bold text-sm truncate ${activeThread?.id === t.id ? 'text-blue-900' : 'text-slate-900'}`}>{t.name}</h4>
                  <span className="text-xs font-bold text-slate-400">{t.time}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-1 truncate">{t.role}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600 truncate max-w-[180px]">{t.lastMsg}</p>
                  {t.unread > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeThread ? (
          <>
            <div className="h-20 border-b border-slate-200 px-6 flex justify-between items-center bg-white/80 backdrop-blur z-10 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-xl">
                  {activeThread.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-900">{activeThread.name}</h2>
                  <p className="text-xs font-bold text-slate-500">{activeThread.role}</p>
                </div>
              </div>
              <div className="flex gap-2 text-slate-400">
                <button className="w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"><Phone className="w-5 h-5"/></button>
                <button className="w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"><Video className="w-5 h-5"/></button>
                <button className="w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors"><MoreVertical className="w-5 h-5"/></button>
              </div>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-slate-400 font-bold">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex gap-4 ${msg.sender_id === user?.uid ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${msg.sender_id === user?.uid ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {msg.sender_id === user?.uid ? 'ME' : activeThread.name.substring(0,1)}
                  </div>
                  <div className={`p-4 shadow-sm max-w-lg rounded-2xl ${msg.sender_id === user?.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] mt-2 block font-bold ${msg.sender_id === user?.uid ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="relative">
                <button className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-2">
                  <Paperclip className="w-5 h-5"/>
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message... (Real-time enabled)" 
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-16 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
              <Send className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Select a thread</h3>
            <p className="max-w-xs font-medium">Choose a teammate or client from the list on the left to start messaging in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Send, LifeBuoy, MessageSquare, BookOpen, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function Support() {
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .insert({
          user_id: profile?.id,
          subject,
          message,
          status: 'open'
        });

      if (error) throw error;
      setSubmitted(true);
      toast.success('Support ticket submitted successfully!');
    } catch (err: any) {
      toast.error('Failed to submit ticket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Ticket Received!</h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Our specialized enterprise support team has been notified. You will receive an update in your Notification Center within 2-4 hours.
        </p>
        <Button 
          onClick={() => { setSubmitted(false); setSubject(''); setMessage(''); }}
          className="bg-slate-900 hover:bg-black text-white px-8 h-14 rounded-2xl font-bold shadow-xl"
        >
          Submit Another Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Form */}
        <div className="flex-1">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              <LifeBuoy className="w-10 h-10 text-blue-600" /> Help & Support
            </h1>
            <p className="text-slate-500 font-medium mt-3 text-lg">
              Enterprise-grade assistance for your marketplace operations.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Milestone payment dispute, Technical glich..." 
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 uppercase tracking-widest ml-1">Message Detail</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail. Inclusion of Contract IDs helps speed up resolution." 
                  className="w-full h-48 bg-slate-50 border border-slate-200 rounded-3xl p-6 font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all resize-none placeholder:text-slate-400"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Send className="w-5 h-5 mr-3" /> Submit Support Ticket
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side: Quick Links & FAQ */}
        <div className="w-full lg:w-[400px] space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" /> Response Times
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="font-bold text-slate-400">Enterprise Plus</span>
                <span className="font-black text-blue-400">15 Mins</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="font-bold text-slate-400">Standard Support</span>
                <span className="font-black text-emerald-400">2-4 Hours</span>
              </div>
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-2xl p-4 mt-8">
                <p className="text-xs font-bold text-blue-300 leading-relaxed uppercase tracking-tighter">
                  Current Status: Normal Load. Agents are responding to 98% of tickets within target.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Quick Resources</h3>
            <div className="space-y-4">
              {[
                { icon: <BookOpen className="w-5 h-5" />, title: 'Marketplace Knowledge Base', color: 'bg-blue-50 text-blue-600' },
                { icon: <MessageSquare className="w-5 h-5" />, title: 'Community Discourse', color: 'bg-violet-50 text-violet-600' },
                { icon: <LifeBuoy className="w-5 h-5" />, title: 'Technical Documentation', color: 'bg-emerald-50 text-emerald-600' },
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left border border-transparent hover:border-slate-100 group">
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="font-black text-slate-900 text-sm leading-tight">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

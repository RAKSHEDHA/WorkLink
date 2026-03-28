import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileUp, FileText, CheckCircle2, Circle, Plus, Video, Image as ImageIcon, Send,
  ArrowRight, Copy, ExternalLink, Code2, Palette, GitBranch, Terminal,
  ClipboardList, PlusCircle, X, Loader2, ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';



interface Job {
  id: string;
  title: string;
  category: string;
  description?: string;
}

interface Contract {
  id: string;
  job_id: string;
  freelancer_id: string;
  recruiter_id: string;
  total_budget: number | string;
  status: string;
  job?: Job;
  milestones?: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  amount: string | number;
  date: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'released';
  released_at?: string;
}

interface Message {
  id?: string;
  contract_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Task {
  id?: string;
  workroom_id: string;
  title: string;
  assignee: string;
  due_date: string | null;
  status: 'todo' | 'in_progress' | 'done';
}

const DESIGN_ASSETS = [
  { name: 'Hero_Banner_v3.fig', type: 'Design', size: '3.2 MB', thumb: 'bg-gradient-to-br from-blue-400 to-purple-600' },
  { name: 'Dashboard_Mobile.fig', type: 'Design', size: '1.8 MB', thumb: 'bg-gradient-to-br from-emerald-400 to-cyan-600' },
  { name: 'Logo_Primary.svg', type: 'Logo', size: '42 KB', thumb: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { name: 'Color_Palette.pdf', type: 'PDF', size: '540 KB', thumb: 'bg-gradient-to-br from-violet-400 to-indigo-600' },
  { name: 'Icon_Set_v1.zip', type: 'Archive', size: '2.1 MB', thumb: 'bg-gradient-to-br from-slate-400 to-slate-600' },
  { name: 'Typography_Guide.pdf', type: 'PDF', size: '1.2 MB', thumb: 'bg-gradient-to-br from-rose-400 to-pink-600' },
];

export default function Workroom() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [message, setMessage] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  const [workroomType, setWorkroomType] = useState<'Code' | 'Design'>('Code');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vaultFiles, setVaultFiles] = useState([
    { name: 'Brand_Guidelines.pdf', size: '2.4 MB', type: 'pdf', date: '2024-03-25' },
    { name: 'Database_Schema.png', size: '840 KB', type: 'image', date: '2024-03-26' },
  ]);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [meetTitle, setMeetTitle] = useState('');
  const [showRepoPopup, setShowRepoPopup] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Escrow Calculation
  const escrowAmount = milestones
    .filter(m => m.status !== 'released')
    .reduce((sum, m) => sum + (typeof m.amount === 'string' ? parseFloat(m.amount) : m.amount), 0);

  // Supabase Realtime for workroom messages channel
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchContractData = async () => {
      if (!id || !profile) return;
      setLoading(true);
      
      try {
        const { data: contractData } = await supabase
          .from('contracts')
          .select('*, job:jobs(*), milestones(*)')
          .eq('id', id)
          .single();

        if (contractData) {
          setContract(contractData);
          setMilestones(contractData.milestones || []);
          setWorkroomType(contractData.job?.category?.toLowerCase().includes('design') ? 'Design' : 'Code');
        } else {
          toast.error('Workroom Not Found');
          navigate(-1);
        }
      } catch (err) {
        console.error('Workroom data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Fetch messages from DB
    supabase.from('messages').select('*').eq('contract_id', id).order('created_at', { ascending: true })
      .then(({ data: dbMsgs }) => { 
        if (dbMsgs) {
          setMessages(dbMsgs); 
        }
      });

    // Supabase Realtime for workroom messages channel
    const channel = supabase.channel(`workroom:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `contract_id=eq.${id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 50);
      })
      .subscribe();

    channelRef.current = channel;

    // Fetch tasks from DB
    supabase.from('tasks').select('*').eq('workroom_id', id).order('created_at', { ascending: false })
      .then(({ data: dbTasks }) => { if (dbTasks && dbTasks.length > 0) setTasks(dbTasks); });

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !id || !profile) return;
    
    const newMsg = {
      contract_id: id,
      sender_id: profile.id,
      receiver_id: profile.role === 'recruiter' ? contract?.freelancer_id : contract?.recruiter_id,
      content: message,
    };

    const { error } = await supabase.from('messages').insert([newMsg]);
    if (error) {
      toast.error('Failed to send message: ' + error.message);
    } else {
      setMessage('');
    }
  };

  const handleGenerateMeet = async () => {
    if (!meetTitle.trim()) { toast.error('Please enter a meeting title'); return; }
    setGeneratingMeet(true);
    try {
      const p1 = Math.random().toString(36).substring(2, 5);
      const p2 = Math.random().toString(36).substring(2, 6);
      const p3 = Math.random().toString(36).substring(2, 5);
      const link = `https://meet.google.com/${p1}-${p2}-${p3}`;
      
      if (id && profile) {
        // Attempt insert with 'scheduled_for' column
        const meetingData = {
          contract_id: id,
          title: meetTitle,
          link: link,
          scheduled_for: new Date(Date.now() + 3600000).toISOString(),
          created_by: profile.id
        };

        const { error } = await supabase.from('meetings').insert([meetingData]);

        if (error) {
           console.error('Meeting insert error:', error);
           if (error.message.includes('scheduled_for')) {
             // Fallback: Remove 'scheduled_for' if it's missing in schema (e.g. legacy DB)
             const { contract_id, title, link, created_by } = meetingData;
             await supabase.from('meetings').insert([{ contract_id, title, link, created_by }]);
             toast.warning('Scheduled_for column missing - using fallback sync.');
           } else if (!error.message.includes('relation')) {
             throw error;
           }
        }
      }

      setMeetLink(link);
      setShowMeetModal(false);
      toast.success('Meeting scheduled successfully!');
    } catch (err: any) {
      toast.error('Failed to save meeting: ' + err.message);
    } finally {
      setGeneratingMeet(false);
    }
  };

  const handleCopyMeet = () => {
    if (meetLink) { navigator.clipboard.writeText(meetLink); toast.success('Meet link copied!'); }
  };

  const handleRelease = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('id', milestoneId);

      if (error && !error.message.includes('relation')) throw error;

      toast.success("Payment Released!", {
        description: "Funds have been transferred to the freelancer's wallet.",
      });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa']
      });
      
      setMilestones((prev: Milestone[]) => prev.map((m: Milestone) => m.id === milestoneId ? { ...m, status: 'released' } : m));
    } catch (err: unknown) {
      toast.error('Release failed: ' + (err as Error).message);
    }
  };

  const handleSubmitWork = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ status: 'submitted' })
        .eq('id', milestoneId);

      if (error && !error.message.includes('relation')) throw error;

      toast.success("Work Submitted!", {
        description: "The recruiter has been notified of your progress.",
      });
      
      setMilestones((prev: Milestone[]) => prev.map((m: Milestone) => m.id === milestoneId ? { ...m, status: 'submitted' } : m));
    } catch (err: unknown) {
      toast.error('Submission failed: ' + (err as Error).message);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle || !id) { toast.error('Task title is required.'); return; }
    setSubmittingTask(true);
    const newTask: Omit<Task, 'id'> = {
      workroom_id: id,
      title: taskTitle,
      assignee: taskAssignee || (profile?.role === 'recruiter' ? 'Freelancer' : 'Recruiter'),
      due_date: taskDue || null,
      status: 'todo',
    };
    const { error } = await supabase.from('tasks').insert([newTask]);

    if (error && !error.message.includes('column') && !error.message.includes('relation')) {
      toast.error('DB Error: ' + error.message);
    } else {
      toast.success('Task allotted');
      setTasks(prev => [{ ...newTask, id: crypto.randomUUID() } as Task, ...prev]);
      setTaskTitle(''); setTaskAssignee(''); setTaskDue('');
      setShowTaskForm(false);
    }
    setSubmittingTask(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-4 w-40 bg-slate-50 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
            <div className="h-10 w-full bg-slate-50 rounded-xl animate-pulse" />
            <div className="space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-16 w-full bg-slate-50 rounded-2xl animate-pulse" />)}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 w-full bg-slate-100 rounded-3xl animate-pulse" />
            <div className="h-full bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="h-10 w-full bg-slate-50 rounded-xl animate-pulse" />
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className={`h-12 w-2/3 bg-slate-50 rounded-2xl animate-pulse ${i % 2 === 0 ? 'ml-auto bg-blue-50' : ''}`} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Workroom Not Found</h2>
          <p className="text-slate-500 font-medium mb-8">The contract you are looking for does not exist or you do not have permission to view it.</p>
          <Button onClick={() => navigate(profile?.role === 'recruiter' ? '/client/dashboard' : '/dashboard')} className="w-full bg-slate-900 hover:bg-black text-white font-bold h-12 rounded-xl">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-500 px-4 pb-4">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 mb-4 flex justify-between items-center shrink-0 mt-4 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-black text-black">{contract.job?.title || 'Contract'} <span className="text-slate-400 font-bold ml-1 text-base">#{contract.id?.substring(0,8).toUpperCase() || 'N/A'}</span></h1>
              {/* WorkroomType Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1">
                {(['Code', 'Design'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setWorkroomType(t);
                      if (t === 'Code') setShowRepoPopup(!showRepoPopup);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${workroomType === t ? (t === 'Code' ? 'bg-slate-800 text-white shadow-sm' : 'bg-purple-600 text-white shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t === 'Code' ? <Code2 className="w-3.5 h-3.5" /> : <Palette className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Contract • <span className="text-emerald-600">₹{escrowAmount} IN ESCROW</span></p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          {meetLink ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <Video className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-700 max-w-[120px] truncate">{meetLink.replace('https://', '')}</span>
              <button onClick={handleCopyMeet} className="text-emerald-600 hover:text-emerald-800"><Copy className="w-3.5 h-3.5" /></button>
              <a href={meetLink} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-800"><ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          ) : (
          <Button onClick={() => setShowMeetModal(true)} disabled={generatingMeet} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold h-10 px-4 rounded-xl flex items-center gap-2 text-sm">
            <Video className="w-4 h-4" /> Generate Meet
          </Button>
          )}
          <Button 
            onClick={() => navigate('/proposals')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 text-sm"
          >
            Proposals <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Tabs */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex border-b border-slate-100 p-2 shrink-0 gap-1">
            {['milestones', 'tasks', 'vault'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 h-10 font-bold text-xs capitalize rounded-xl transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                {tab === 'vault' ? 'File Vault' : tab === 'tasks' ? 'Tasks' : 'Milestones'}
              </button>
            ))}
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-0">
                {milestones.map((m, i) => (
                  <div key={i} className="relative pl-10 pb-8 last:pb-0">
                    {i !== milestones.length - 1 && (
                      <div className={`absolute left-[15px] top-8 bottom-[-10px] w-0.5 ${m.status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    )}
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white flex items-center justify-center z-10">
                      {m.status === 'completed' ? <CheckCircle2 className="w-8 h-8 text-blue-600 fill-blue-50" />
                        : m.status === 'in_progress' ? <div className="w-5 h-5 bg-blue-600 rounded-full shadow-[0_0_0_6px_rgba(37,99,235,0.2)] animate-pulse" />
                          : <Circle className="w-6 h-6 text-slate-300" />}
                    </div>
                    <div className={`transition-all ${m.status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                      <h4 className="font-black text-slate-900 text-sm">{m.title}</h4>
                      <div className="flex items-center gap-2 mt-1 mb-3">
                        <span className="font-bold text-blue-600 text-sm">{m.amount}</span>
                        <span className="text-xs font-bold text-slate-400">• {m.date}</span>
                        {m.status === 'released' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Released</span>}
                      </div>
                      {m.status === 'in_progress' && profile?.role === 'recruiter' && (
                        <Button 
                          onClick={() => handleRelease(m.id)}
                          className="h-10 px-6 font-black rounded-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                        >
                          Release Funds
                        </Button>
                      )}
                      {m.status === 'in_progress' && profile?.role === 'freelancer' && (
                        <Button 
                          onClick={() => handleSubmitWork(m.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl text-xs"
                        >
                          Submit Work
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Task Allotment Tab (Cluster 5) */}
            {activeTab === 'tasks' && (
              <div className="space-y-3">
                {profile?.role === 'recruiter' && (
                  <button onClick={() => setShowTaskForm((v: boolean) => !v)}
                    className="w-full flex items-center justify-center gap-2 h-11 border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold rounded-2xl text-sm transition-colors">
                    <PlusCircle className="w-4 h-4" /> Allot New Task
                  </button>
                )}
                {showTaskForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                    <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title *"
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm font-medium outline-none focus:border-blue-500 bg-white" />
                    <input value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} placeholder={`Assignee`}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm font-medium outline-none focus:border-blue-500 bg-white" />
                    <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm font-medium outline-none focus:border-blue-500 bg-white" />
                    <div className="flex gap-2">
                      <Button onClick={() => setShowTaskForm(false)} variant="outline" className="flex-1 h-9 text-xs font-bold border-slate-200 rounded-xl">Cancel</Button>
                      <Button onClick={handleAddTask} disabled={submittingTask} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5">
                        {submittingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ClipboardList className="w-3.5 h-3.5" />}
                        {submittingTask ? 'Allotting...' : 'Allot Task'}
                      </Button>
                    </div>
                  </div>
                )}
                {tasks.length === 0 && !showTaskForm && (
                  <div className="text-center py-8 text-slate-400">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No tasks yet</p>
                    <p className="text-xs mt-1">Recruiters can allot tasks to freelancers</p>
                  </div>
                )}
                {tasks.map((t, i) => (
                  <div key={t.id ?? i} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {t.status ?? 'todo'}
                      </span>
                    </div>
                    {t.assignee && <p className="text-xs text-slate-500 font-medium">→ {t.assignee}</p>}
                    {t.due_date && <p className="text-xs text-slate-400 font-bold">Due: {new Date(t.due_date).toLocaleDateString()}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Vault Tab */}
            {activeTab === 'vault' && (
              <div className="space-y-3">
                <label htmlFor="vault-upload" className="w-full h-14 border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold flex items-center justify-center rounded-2xl cursor-pointer transition-colors block text-sm">
                  <input type="file" id="vault-upload" multiple className="hidden" onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0 && id) {
                      const file = files[0];
                      const newFile = {
                        name: file.name,
                        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                        type: file.type.includes('pdf') ? 'pdf' : 'image',
                        date: new Date().toISOString().split('T')[0]
                      };
                      
                      // Simulate Storage Upload to 'banners' bucket
                      toast.promise(
                        new Promise((resolve) => setTimeout(resolve, 1500)),
                        {
                          loading: `Uploading to banners bucket...`,
                          success: () => {
                            setVaultFiles(prev => [newFile, ...prev]);
                            return `${file.name} synced to storage!`;
                          },
                          error: 'Upload failed',
                        }
                      );
                    }
                  }} />
                  <FileUp className="w-5 h-5 mr-2 text-slate-400" /> Upload to Vault
                </label>
                {vaultFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        {file.type === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{file.size} • {file.date}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Type-Aware Panel + Chat */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
          {/* Cluster 11: Conditional WorkroomType Panel */}
          {workroomType === 'Design' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-slate-900">Design Asset Review</h3>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">{DESIGN_ASSETS.length} assets</span>
              </div>
              {/* Masonry Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DESIGN_ASSETS.map((asset, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className={`${asset.thumb} rounded-2xl flex items-end p-3 hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm`} style={{ height: `${100 + (i % 3) * 40}px` }}>
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{asset.type}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-2 truncate">{asset.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{asset.size}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-sm p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-white">GitHub Repository</h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Connected</span>
                </div>
                <button onClick={() => setShowRepoPopup(!showRepoPopup)} className="text-slate-400 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-sm mb-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs">worklink-repo / main</span>
                  <span className="text-emerald-400 font-bold text-xs">worklink-repo / main</span>
                  <span className="ml-auto text-slate-500 text-xs">last commit: 2h ago</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {[
                    { hash: 'a3f8b2c', msg: 'feat: implement real-time workroom messaging', type: 'feat' },
                    { hash: '9d1c5e7', msg: 'fix: resolve TypeScript strict-mode errors', type: 'fix' },
                    { hash: '7b4a2f1', msg: 'chore: update Supabase client to v2.x', type: 'chore' }
                  ].map((c, i) => (
                    <p key={i}><span className="text-blue-400">$</span> <span className="text-slate-500">{c.hash}</span> <span className={`${c.type === 'feat' ? 'text-yellow-300' : c.type === 'fix' ? 'text-green-400' : 'text-blue-300'}`}>{c.type}:</span> <span className="text-white opacity-80">{c.msg}</span></p>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Open PRs', value: 3, color: 'text-yellow-400' },
                  { label: 'Merged', value: 7, color: 'text-emerald-400' },
                  { label: 'Issues', value: 12, color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 shrink-0">
              <div className="w-10 h-10 bg-blue-50 rounded-full border-2 border-white shadow-sm flex items-center justify-center font-black text-blue-600 text-sm">
                {profile?.role === 'recruiter' ? 'F' : 'R'}
              </div>
              <div>
                <h3 className="font-black text-black text-sm">{profile?.role === 'recruiter' ? 'Freelancer' : 'Client Representative'}</h3>
                <p className={`text-xs font-bold flex items-center gap-1.5 text-emerald-600`}>
                  <span className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
                  Online • Real-time
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">⚡ Supabase Realtime</span>
              </div>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={`flex items-end gap-3 ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender_id !== profile?.id && (
                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">{profile?.role === 'recruiter' ? 'F' : 'R'}</div>
                  )}
                  <div>
                    <div className={`max-w-sm rounded-2xl p-3.5 text-sm font-medium leading-relaxed ${msg.sender_id === profile?.id ? 'bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    <p className={`text-[10px] font-bold mt-1 ${msg.sender_id === profile?.id ? 'text-right text-slate-400' : 'text-slate-400'}`}>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <Button onClick={() => toast.info('File attachment feature coming soon!')} variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl w-8 h-8">
                  <Plus className="w-4 h-4" />
                </Button>
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message... (Realtime sync enabled)"
                  className="flex-1 bg-transparent border-none outline-none font-medium text-sm placeholder-slate-400 h-9 px-2"
                />
                <Button onClick={handleSend} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-xl p-0 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Meeting Modal */}
      {showMeetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Schedule Meeting</h2>
              <button onClick={() => setShowMeetModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Meeting Title</label>
                <input 
                  value={meetTitle} 
                  onChange={(e) => setMeetTitle(e.target.value)} 
                  placeholder="e.g. Weekly Sync"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 font-bold focus:border-blue-500 outline-none" 
                />
              </div>
              <Button 
                onClick={handleGenerateMeet} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 rounded-xl shadow-lg shadow-blue-600/20"
                disabled={generatingMeet}
              >
                {generatingMeet ? 'Saving...' : 'Generate & Save Link'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Repository Popup */}
      {showRepoPopup && (
        <div className="fixed top-24 right-10 bg-slate-900 text-white p-5 rounded-[2rem] border border-slate-700 shadow-2xl z-[150] w-72 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-sm text-emerald-400 uppercase tracking-widest">Repository Link</h4>
            <button onClick={() => setShowRepoPopup(false)} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => {
            navigator.clipboard.writeText('https://github.com/worklink/ai-pipeline-core');
            toast.success('Link copied to clipboard!');
          }}>
            <span className="text-[11px] font-mono text-slate-300 truncate">github.com/worklink/ai-pipeline-core</span>
            <Copy className="w-4 h-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 12 Contributors</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> v2.4.0</div>
          </div>
        </div>
      )}
    </div>
  );
}

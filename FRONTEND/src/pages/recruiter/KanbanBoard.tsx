import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-slate-400', textColor: 'text-slate-600', border: 'border-slate-200' },
  { id: 'shortlisted', title: 'Shortlisted', color: 'bg-blue-500', textColor: 'text-blue-600', border: 'border-blue-200' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-amber-500', textColor: 'text-amber-600', border: 'border-amber-200' },
  { id: 'hired', title: 'Hired', color: 'bg-emerald-500', textColor: 'text-emerald-600', border: 'border-emerald-200' },
];

interface Candidate {
  id: string;
  name: string;
  role: string;
  bid: string;
  status: string;
  match: number;
  days: number;
  proposal_id: string;
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      // Fetch recruiter's jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, status')
        .eq('recruiter_id', profile?.id)
        .limit(20);

      if (jobsData) setJobs(jobsData);
      const jobIds = jobsData?.map(j => j.id) || [];

      if (jobIds.length > 0) {
        // Fetch proposals for these jobs, join with profiles
        const { data: proposalsData } = await supabase
          .from('proposals')
          .select('id, status, bid_amount, created_at, freelancer_id, job_id')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false });

        if (proposalsData && proposalsData.length > 0) {
          // Fetch freelancer profiles for these proposals
          const freelancerIds = [...new Set(proposalsData.map(p => p.freelancer_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, skills')
            .in('id', freelancerIds);

          const profileMap = new Map((profiles || []).map(p => [p.id, p]));

          const mapped: Candidate[] = proposalsData.map(p => {
            const prof = profileMap.get(p.freelancer_id);
            const daysSince = Math.max(1, Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)));
            return {
              id: p.id,
              proposal_id: p.id,
              name: prof?.full_name || 'Unknown',
              role: prof?.skills?.[0] || 'Freelancer',
              bid: `₹${Number(p.bid_amount || 0).toLocaleString()}/hr`,
              status: p.status || 'applied',
              match: Math.floor(Math.random() * 20) + 75,
              days: daysSince,
            };
          });
          setCandidates(mapped);
        }
      }

      // Fetch contracts for the contracts tab
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*, freelancer:profiles!contracts_freelancer_id_fkey(full_name, skills)')
        .eq('recruiter_id', profile?.id);

      if (contractsData) setContracts(contractsData);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const moveCandidate = async (candidateId: string, newStatus: string) => {
    // Optimistic update
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
    const candidate = candidates.find(c => c.id === candidateId);
    const column = COLUMNS.find(col => col.id === newStatus);

    // Sync to Supabase
    const { error } = await supabase
      .from('proposals')
      .update({ status: newStatus })
      .eq('id', candidateId);

    if (error) {
      toast.error('Failed to update status in database');
      // Revert optimistic update
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: candidate?.status || 'applied' } : c));
    } else if (candidate && column) {
      toast.success(`${candidate.name} moved to ${column.title}`);
    }
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    setDragging(candidateId);
    e.dataTransfer.setData('candidateId', candidateId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    moveCandidate(candidateId, colId);
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const counts = COLUMNS.reduce((acc, col) => {
    acc[col.id] = candidates.filter(c => c.status === col.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[1500px] mx-auto px-4 h-[calc(100vh-80px)] flex flex-col pb-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-blue-600 text-sm">Syncing Pipeline...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 shrink-0 pt-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruiting Pipeline</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Drag candidates between stages. {candidates.length} total applicants across {jobs.length} active postings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('pipeline')} className={`px-4 h-10 rounded-lg font-bold text-sm transition-colors ${activeTab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pipeline</button>
            <button onClick={() => setActiveTab('contracts')} className={`px-4 h-10 rounded-lg font-bold text-sm transition-colors ${activeTab === 'contracts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Contracts</button>
          </div>
          <Button onClick={() => navigate('/client/post-job')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
        {COLUMNS.map(col => (
          <div key={col.id} className={`bg-white border rounded-2xl px-5 py-4 flex items-center justify-between ${col.border}`}>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{col.title}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{counts[col.id]}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
          </div>
        ))}
      </div>

      {activeTab === 'pipeline' ? (
        <div className="flex-1 flex gap-5 overflow-x-auto pb-4 min-h-0">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className={`flex-none w-72 flex flex-col rounded-3xl border-2 transition-colors ${dragOver === col.id ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-slate-50/40'}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                  <h3 className="font-black text-slate-900 text-sm">{col.title}</h3>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${col.border} ${col.textColor}`}>{counts[col.id]}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {candidates.filter(c => c.status === col.id).map(c => (
                  <motion.div
                    key={c.id}
                    layout
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, c.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => navigate(`/client/proposals/${c.proposal_id}`)}
                    className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${dragging === c.id ? 'opacity-40 scale-95' : 'opacity-100 scale-100'} border-slate-200 hover:border-blue-300 hover:bg-blue-50/20`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600 text-sm shrink-0">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{c.name}</h4>
                        <p className="text-xs font-bold text-blue-600 truncate">{c.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-slate-900 text-sm">{c.bid}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{c.match}% match</span>
                    </div>

                    <p className="text-xs text-slate-400 font-medium mb-3">Applied {c.days}d ago</p>

                    {col.id === 'hired' && (
                      <Button onClick={(e) => { e.stopPropagation(); navigate(`/workroom/${c.id}`); }} className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold h-9 rounded-xl text-xs mb-3">
                        Open Workroom <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}

                    {col.id !== 'hired' && (
                      <div className="flex gap-2">
                        {COLUMNS.filter(nc => nc.id !== col.id && COLUMNS.indexOf(nc) === COLUMNS.indexOf(col) + 1).map(nextCol => (
                          <button key={nextCol.id} onClick={() => moveCandidate(c.id, nextCol.id)} className="flex-1 text-xs font-bold py-1.5 px-2 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            → {nextCol.title}
                          </button>
                        ))}
                        <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center transition-colors shrink-0" onClick={() => navigate('/messages')}>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}

                {candidates.filter(c => c.status === col.id).length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    <p className="text-xs font-bold">Drop candidates here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col min-h-0">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Active Contracts</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {contracts.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-bold">No active contracts yet</div>
            )}
            {contracts.map((contract, i) => (
              <div key={i} onClick={() => navigate(`/client/workrooms/${contract.id}`)} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-black text-blue-600">
                      {(contract.freelancer?.full_name || 'U')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{contract.freelancer?.full_name || 'Freelancer'}</h4>
                      <p className="text-blue-600 font-bold text-xs">{contract.freelancer?.skills?.[0] || 'Specialist'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">₹{Number(contract.total_budget || 0).toLocaleString()}</p>
                    <p className="text-xs font-bold text-slate-400">Budget</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.floor(Math.random() * 60) + 20)}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{contract.status || 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

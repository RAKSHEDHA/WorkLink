import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Contract {
  id: string;
  total_budget: number | string;
  status: string;
  job: { title: string };
  freelancer: { full_name: string; id: string };
  milestones: { amount: number | string; status: string }[];
}

export default function ContractsList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      if (!user) return;
      setLoading(true);

      const { data } = await supabase
        .from('contracts')
        .select(`
          id,
          total_budget,
          status,
          job:jobs(title),
          freelancer:profiles!contracts_freelancer_id_fkey(id, full_name),
          milestones(*)
        `)
        .eq('recruiter_id', profile?.id);

      if (data) {
        setContracts(data as unknown as Contract[]);
      }
      setLoading(false);
    }

    fetchContracts();
  }, [user]);

  const calculateSpent = (milestones: any[]) => {
    return milestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Contracts</h1>
          <p className="text-slate-500 font-medium mt-2">Manage all active agreements and monitor milestone progress.</p>
        </div>
        <Button className="bg-slate-900 hover:bg-black text-white font-bold h-12 px-6 rounded-xl flex items-center shadow-lg">
          Export Ledger
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 pl-6 text-xs font-bold uppercase tracking-widest text-slate-500">Contract Name</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Freelancer</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Spend</th>
                <th className="p-4 pr-6 text-right text-xs font-bold uppercase tracking-widest text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">No active contracts found.</td>
                </tr>
              ) : contracts.map((c) => {
                const spent = calculateSpent(c.milestones || []);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/workroom/${c.id}`)}>
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900 text-sm">{c.job?.title || 'Unknown Project'}</p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">ID: {c.id.substring(0, 8)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {(c.freelancer?.full_name || 'U').substring(0, 1)}
                        </div>
                        <span className="font-bold text-sm text-slate-700">{c.freelancer?.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        c.status === 'completed' || c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {c.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5 animate-[spin_3s_linear_infinite]" />}
                        {c.status}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-900 text-sm">₹{spent.toLocaleString()} <span className="text-slate-400 font-medium">/ ₹{Number(c.total_budget).toLocaleString()}</span></p>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-blue-600">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

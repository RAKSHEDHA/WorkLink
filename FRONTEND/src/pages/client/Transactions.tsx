import { useState, useEffect } from 'react';
import { Download, CreditCard, ArrowUpRight, ArrowDownRight, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Transactions() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ transactions: [], spent: 0, escrow: 0 });

  useEffect(() => {
    const fetchLedger = async () => {
      if (!user) return;
      setLoading(true);
      
      const { data: milestones } = await supabase
        .from('milestones')
        .select(`
          id, title, amount, status, released_at, created_at,
          contracts!inner(recruiter_id)
        `)
        .eq('recruiter_id', profile?.id);

      if (milestones) {
        const spent = milestones
          .filter(m => m.status === 'completed')
          .reduce((acc, m) => acc + Number(m.amount), 0);
        
        const escrow = milestones
          .filter(m => m.status !== 'completed')
          .reduce((acc, m) => acc + Number(m.amount), 0);

        const formatted = milestones.map(m => ({
          id: m.id.substring(0, 8).toUpperCase(),
          type: m.status === 'completed' ? 'Milestone Release' : 'Escrow Deposit',
          amount: `₹${Number(m.amount).toLocaleString()}`,
          date: new Date(m.released_at || m.created_at).toLocaleDateString(),
          status: m.status.charAt(0).toUpperCase() + m.status.slice(1),
          isCredit: false
        }));

        setData({ transactions: formatted, spent, escrow });
      }
      setLoading(false);
    };

    fetchLedger();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-slate-500 font-medium mt-2">Comprehensive ledger of all your enterprise financial activity.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Lifetime Spent</p>
            <h2 className="text-4xl font-black text-slate-900">₹{data.spent.toLocaleString()}</h2>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Pending Escrow</p>
            <h2 className="text-4xl font-black text-white">₹{data.escrow.toLocaleString()}</h2>
          </div>
          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-600/30">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
           <h3 className="font-black text-xl text-slate-900">Ledger Details</h3>
           <button 
             onClick={() => {
               const headers = ['ID', 'Type', 'Amount', 'Date', 'Status'];
               const rows = data.transactions.map((t: any) => [t.id, t.type, t.amount, t.date, t.status]);
               const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
               const blob = new Blob([csvContent], { type: 'text/csv' });
               const url = URL.createObjectURL(blob);
               const a = document.createElement('a');
               a.href = url;
               a.download = `worklink_ledger_${new Date().toISOString().split('T')[0]}.csv`;
               a.click();
               URL.revokeObjectURL(url);
             }}
             className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
           >
              <Download className="w-4 h-4" /> Download CSV
           </button>
        </div>

        <div className="space-y-4">
          {data.transactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold">No transactions found in this cycle.</div>
          ) : data.transactions.map((t: any, i: number) => (
             <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
               <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.isCredit ? 'bg-emerald-50' : 'bg-red-50'}`}>
                   {t.isCredit ? <ArrowDownRight className="w-5 h-5 text-emerald-500" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                 </div>
                 <div>
                   <p className="font-bold text-slate-900 text-sm">{t.type}</p>
                   <p className="text-xs font-bold text-slate-400 mt-0.5">{t.id} • {t.date}</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className={`font-black text-lg ${t.isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>{t.isCredit ? '+' : '-'}{t.amount}</p>
                 <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                   {t.status}
                 </span>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

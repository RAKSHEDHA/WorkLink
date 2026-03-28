import { useState, useEffect } from 'react';
import { Download, ArrowUpRight, TrendingUp, Building2, Landmark, Plus, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Wallet() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(0);
  const [cycleEarnings, setCycleEarnings] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchWallet = async () => {
      setLoading(true);
      // Fetch released milestones for this freelancer
      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('freelancer_id', profile?.id)
        .order('updated_at', { ascending: false });

      const released = milestones?.filter(m => m.status === 'released') || [];
      const total = released.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
      setBalance(total);

      // Cycle earnings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cycle = released
        .filter(m => new Date(m.updated_at) >= thirtyDaysAgo)
        .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
      setCycleEarnings(cycle);

      // Build transactions from milestones
      const txList = (milestones || []).map(m => ({
        id: `WL-${String(m.id).substring(0, 4).toUpperCase()}`,
        desc: m.title || `Milestone Payment`,
        date: new Date(m.updated_at || m.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        amount: m.status === 'released' ? `+₹${Number(m.amount).toLocaleString()}` : `₹${Number(m.amount).toLocaleString()} (Pending)`,
        type: m.status === 'released' ? 'credit' : 'pending',
      }));
      setTransactions(txList);
      setLoading(false);
    };
    fetchWallet();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 px-4">
      {/* Wallet Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 space-y-2">
          <p className="font-bold text-slate-500 uppercase tracking-widest text-sm flex items-center gap-2">
            <Landmark className="w-4 h-4 text-slate-400" /> Available Balance
          </p>
          <h1 className="text-5xl font-black text-black">
            {loading ? '...' : `₹${balance.toLocaleString()}`}
            <span className="text-2xl text-slate-400 font-bold">.00</span>
          </h1>
          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" /> +₹{cycleEarnings.toLocaleString()} this cycle
          </p>
        </div>
        
        <div className="relative z-10 flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-blue-200 text-blue-600 font-bold hover:bg-blue-50 h-12 px-6">
            Tax Documents
          </Button>
          <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 shadow-lg shadow-blue-600/20">
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-slate-200 p-2 gap-2 shadow-sm overflow-x-auto no-scrollbar">
        {['overview', 'ledger', 'withdrawal', 'taxes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold text-sm capitalize transition-colors flex-1 md:flex-none whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'overview' ? 'Earnings Overview' : tab === 'ledger' ? 'Transaction Ledger' : tab === 'withdrawal' ? 'Withdrawal Portal' : 'Tax & Billing'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="font-black text-xl text-black mb-8">Income over 30 days</h3>
              <div className="h-64 flex items-end justify-between gap-2 overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-0 h-px bg-slate-100"></div>
                {transactions.filter(t => t.type === 'credit').slice(0, 10).map((tx, i) => {
                  const amount = parseInt(tx.amount.replace(/[^0-9]/g, '')) || 0;
                  const maxAmount = Math.max(...transactions.filter(t => t.type === 'credit').map(t => parseInt(t.amount.replace(/[^0-9]/g, '')) || 0), 1);
                  const height = Math.max((amount / maxAmount) * 100, 10);
                  return (
                    <div key={i} className="group relative w-full flex justify-center h-full items-end pb-1">
                      <div
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 group-hover:bg-blue-500 ${i === 0 ? 'bg-blue-500' : 'bg-slate-100 cursor-pointer'}`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-10">
                        {tx.amount}
                      </div>
                    </div>
                  );
                })}
                {transactions.filter(t => t.type === 'credit').length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">No earnings data yet</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'ledger' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h3 className="font-black text-xl text-black">Transaction Ledger</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {transactions.length === 0 && (
                  <div className="p-12 text-center text-slate-400 font-bold">No transactions yet</div>
                )}
                {transactions.map((tx, i) => {
                  const rawAmount = parseInt(tx.amount.replace(/[^0-9]/g, '')) || 0;
                  const fee = Math.round(rawAmount * 0.1);
                  const net = rawAmount - fee;
                  return (
                    <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                          {tx.type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tx.desc}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Project Payment</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-slate-400">Fee (10%)</p>
                          <p className="text-sm font-bold text-red-400">-₹{fee.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-400">Net Earned</p>
                          <p className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                            ₹{net.toLocaleString()}
                          </p>
                        </div>
                        <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors" title="Download Invoice">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'withdrawal' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="font-black text-xl text-black mb-6">Linked Accounts</h3>
                <div className="space-y-4">
                  <div className="border-2 border-blue-600 bg-blue-50 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 border border-blue-100">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">HDFC Bank ****4492</p>
                        <p className="text-sm font-bold text-slate-500 mt-1">Primary Transfer Method</p>
                      </div>
                    </div>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Active</div>
                  </div>
                  <div className="border border-slate-200 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors h-32">
                    <Plus className="w-6 h-6 text-slate-400 mb-2" />
                    <p className="font-bold text-slate-600">Add New Payment Method</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Supports Bank Transfer, UPI, or PayPal</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'taxes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="font-black text-xl text-black mb-6">Tax & Billing Information</h3>
              <p className="text-slate-500 font-medium mb-8">Maintain active tax documents to ensure uninterrupted withdrawals.</p>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Legal Entity Name</label>
                  <input type="text" placeholder="Your legal name" className="w-full h-12 border border-slate-200 rounded-xl px-4 font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">GST Identification Number</label>
                    <input type="text" placeholder="22AAAAA0000A1Z5" className="w-full h-12 border border-slate-200 rounded-xl px-4 font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">PAN Number</label>
                    <input type="text" placeholder="ABCDE1234F" className="w-full h-12 border border-slate-200 rounded-xl px-4 font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all" />
                  </div>
                </div>
                <Button className="w-full bg-slate-900 hover:bg-black text-white font-bold h-14 rounded-xl shadow-lg mt-4">
                  Save Tax Information
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden text-white">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-black text-xl mb-3">Download Annual Report</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Generate a complete PDF containing all cleared transactions and withheld taxes for FY 26-27.</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20">
                Generate Tax PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

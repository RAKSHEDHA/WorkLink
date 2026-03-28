import { useState, useEffect } from 'react';
import { 
  Building,
  CreditCard,
  Shield,
  Save,
  Loader2,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  ArrowLeft,
  Plus,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { auth } from '../../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(profile?.role === 'recruiter' ? 'Organization Profile' : 'Billing & Payments');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    website: '',
    full_name: '',
    bio: '',
    location: '',
    hourly_rate: 0,
    skills: [] as string[]
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [spent, setSpent] = useState(0);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setFormData({
        company_name: p.company_name || '',
        industry: p.industry || '',
        website: p.website || '',
        full_name: p.full_name || '',
        bio: p.bio || '',
        location: p.location || '',
        hourly_rate: p.hourly_rate || 0,
        skills: p.skills || []
      });
      fetchTransactions();
    }
  }, [profile]);

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
    setFetching(false);
  }, [profile]);

  async function fetchTransactions() {
    if (!profile?.id) return;
    try {
      // Fetch released milestones as a proxy for transactions
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id')
        .or(`recruiter_id.eq.${profile.id},freelancer_id.eq.${profile.id}`);
      
      if (contracts && contracts.length > 0) {
        const cIds = contracts.map(c => c.id);
        const { data: milestones } = await supabase
          .from('milestones')
          .select('*, contracts(job_id)')
          .in('contract_id', cIds)
          .eq('status', 'released')
          .order('date', { ascending: false });
        
        if (milestones) setTransactions(milestones);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name,
          industry: formData.industry,
          website: formData.website,
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          hourly_rate: formData.hourly_rate,
          skills: formData.skills
        })
        .eq('id', profile?.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Settings updated successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const tabs = [
    ...(profile?.role === 'recruiter' ? [{ name: 'Organization Profile', icon: Building, desc: 'Public identity and bio' }] : []),
    { name: 'Billing & Payments', icon: CreditCard, desc: 'Payment methods and tax info' },
    { name: 'Team & Security', icon: Shield, desc: 'Security overrides and access' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col animate-in fade-in duration-700">
      {/* Settings Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-black text-slate-900">Settings</h1>
           </div>
           <Button 
             onClick={handleSaveProfile} 
             disabled={loading}
             className="bg-blue-600 hover:bg-blue-700 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-blue-600/20"
           >
             {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
             Commit Changes
           </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-12 w-full">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full group text-left p-4 rounded-2xl transition-all duration-300 border ${
                activeTab === tab.name 
                  ? 'bg-white border-blue-600 shadow-premium' 
                  : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  activeTab === tab.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-black text-sm uppercase tracking-tight ${activeTab === tab.name ? 'text-slate-900' : 'text-slate-600'}`}>{tab.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{tab.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Organization Profile */}
          {activeTab === 'Organization Profile' && profile?.role === 'recruiter' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight text-blue-600">Public Enterprise Identity</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Full Name</label>
                    <input 
                      type="text" 
                      value={formData.company_name}
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. WorkLink Enterprise Labs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Vertical</label>
                    <input 
                      type="text" 
                      value={formData.industry}
                      onChange={e => setFormData({...formData, industry: e.target.value})}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. Cloud Infrastructure"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Hub (URL)</label>
                    <input 
                      type="url" 
                      value={formData.website}
                      onChange={e => setFormData({...formData, website: e.target.value})}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. https://worklink.io"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Executive Summary (Company Bio)</label>
                    <textarea 
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                      placeholder="Describe your enterprise mission..."
                      className="w-full p-6 block rounded-[2rem] border border-slate-100 bg-slate-50/50 font-medium focus:bg-white focus:border-blue-600 outline-none transition-all leading-relaxed placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing & Payments */}
          {activeTab === 'Billing & Payments' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-20"><CreditCard className="w-16 h-16" /></div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-12">Vault Status: Secure</p>
                    <div className="flex justify-between items-end">
                       <div>
                         <p className="text-2xl font-black tracking-widest mb-2">•••• •••• •••• 9012</p>
                         <p className="text-sm font-bold text-white/50 uppercase">Verified Master</p>
                       </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1000px-Mastercard-logo.svg.png" className="h-8 opacity-80" alt="Mastercard" />
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                       <div>
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Lifetime Managed</p>
                         <p className="text-xl font-black text-white">₹{spent.toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Compliance</p>
                         <p className="text-sm font-bold text-white/50">L1 Verified</p>
                       </div>
                    </div>
                 </div>
                 
                 <button className="rounded-[2.5rem] border-4 border-dashed border-slate-200 p-10 flex flex-col items-center justify-center group hover:border-blue-600 transition-all bg-white shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all mb-4">
                       <Plus className="w-6 h-6" />
                    </div>
                    <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Connect New Method</p>
                 </button>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Enterprise Ledger <span className="text-blue-600">•</span> <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Last 12 Months</span></h2>
                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-slate-100">
                          <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hash / Date</th>
                          <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                          <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                          <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="pb-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.length > 0 ? transactions.map((tx, i) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                             <td className="py-6 font-mono text-xs font-bold text-slate-400">
                               #{tx.id.substring(0,8).toUpperCase()}
                               <br />
                               <span className="text-[9px] text-slate-300">{tx.date}</span>
                             </td>
                             <td className="py-6 font-black text-slate-900 text-sm truncate max-w-[200px]">{tx.title}</td>
                             <td className="py-6 font-black text-slate-900 text-sm">₹{tx.amount?.toLocaleString()}</td>
                             <td className="py-6">
                                <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                                   Released
                                </span>
                             </td>
                             <td className="py-6 text-right">
                                <button className="p-2 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                                   <Download className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                        )) : (
                          [1,2,3].map(i => (
                            <tr key={i} className="opacity-50">
                              <td className="py-6"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                              <td className="py-6"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                              <td className="py-6"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                              <td className="py-6"><div className="h-6 w-16 bg-slate-100 rounded" /></td>
                              <td className="py-6"></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>
          )}

          {/* Team & Security */}
          {activeTab === 'Team & Security' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                  <Key className="w-8 h-8 text-blue-600" /> Administrative Override
                </h2>
                <div className="max-w-md space-y-6">
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New System Password</label>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-14 pl-5 pr-12 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[38px] text-slate-300 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm System Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={loading || !newPassword}
                    className="bg-slate-900 hover:bg-black text-white px-10 h-14 rounded-2xl font-black shadow-xl h-14"
                  >
                    Update Authentication
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                       <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Multi-Factor Protocol (2FA)</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">Requires biometric or hardware-key validation for high-value releases.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        setTwoFactor(!twoFactor);
                        toast.success(`Security ${!twoFactor ? 'Protocol Engaged' : 'Reduced'}`);
                    }}
                    className={`w-16 h-9 rounded-full relative transition-all duration-500 shadow-inner ${twoFactor ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-500 ${twoFactor ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
                 <div>
                   <p className="font-black text-amber-900 text-xs uppercase tracking-widest">Advanced Compliance Beta</p>
                   <p className="text-xs font-bold text-amber-700/70 mt-1 leading-relaxed">
                     Role-based authorization auditing and SOC2 compliance automation are currently in staging.
                   </p>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

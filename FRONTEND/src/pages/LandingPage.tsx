import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Search, 
  Globe, 
  TrendingUp, 
  Zap, 
  Star, 
  Code, 
  Palette, 
  PenTool, 
  MessageSquare, 
  Scale, 
  BarChart3,
  CheckCircle2,
  Building2,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const [stats, setStats] = useState({ jobs: 0, talent: 0, paid: 0 });
  const [searchMode, setSearchMode] = useState<'talent' | 'jobs'>('talent');
  const [howItWorksMode, setHowItWorksMode] = useState<'hiring' | 'working'>('hiring');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const [jobsRes, talentRes, paidRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'freelancer'),
        supabase.from('milestones').select('amount').filter('status', 'in', '("released", "completed")'),
      ]);
      setStats({
        jobs: (jobsRes.count || 0) + 1200,
        talent: (talentRes.count || 0) + 850,
        paid: (paidRes.data?.reduce((sum, m) => sum + (Number(m.amount) || 0), 0) || 0) + 4500000,
      });
    };
    fetchStats();
  }, []);

  const handleStart = (role?: 'freelancer' | 'recruiter') => {
    if (role) localStorage.setItem('user_role', role);
    navigate('/signup');
  };

  const categories = [
    { icon: Code, title: 'Development & IT', skills: '1.2k+ Skills' },
    { icon: Zap, title: 'AI & Machine Learning', skills: '800+ Skills' },
    { icon: Palette, title: 'Design & Creative', skills: '2.1k+ Skills' },
    { icon: BarChart3, title: 'Sales & Marketing', skills: '1.5k+ Skills' },
    { icon: PenTool, title: 'Writing & Translation', skills: '900+ Skills' },
    { icon: MessageSquare, title: 'Admin & Support', skills: '1.1k+ Skills' },
    { icon: TrendingUp, title: 'Finance & Accounting', skills: '600+ Skills' },
    { icon: Scale, title: 'Legal & Compliance', skills: '400+ Skills' },
  ];

  const pricing = [
    { 
      tier: 'Basic', 
      price: 'Free', 
      features: ['Search talent globally', 'Post 3 jobs active', 'Standard Support', 'Secure Escrow'] 
    },
    { 
      tier: 'Business Plus', 
      price: '₹2,499/mo', 
      features: ['Priority support', 'Unlimited job postings', 'Featured badge', 'Access to Elite Talent', 'Dedicated Account Manager'] 
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#2563eb]/10 selection:text-[#2563eb]">
      <Navbar />

      <main>
        {/* Stage 1: Hero Section */}
        <section className="relative pt-44 pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h1 className="text-7xl md:text-[5.5rem] font-black text-slate-900 leading-[0.95] tracking-tight">
                    Hire experts for your <br />
                    <span className="text-[#2563eb]">business needs.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-lg leading-relaxed pt-4">
                    Instantly connect with verified professionals who bring your vision to life. The elite 1% of talent is here.
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-2 rounded-[2.5rem] shadow-3xl shadow-slate-200/50 border border-slate-100 max-w-2xl">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-[#2563eb] transition-colors" />
                      <input 
                        type="text" 
                        placeholder={searchMode === 'talent' ? "Search for 'Full-Stack Developer'..." : "Search for 'AI Development' jobs..."}
                        className="w-full h-16 pl-16 pr-4 rounded-[2rem] bg-slate-50/50 border border-transparent focus:border-[#2563eb] outline-none font-bold text-lg transition-all"
                      />
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] h-16 shrink-0">
                      <button 
                        onClick={() => setSearchMode('talent')}
                        className={`px-8 h-full rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${searchMode === 'talent' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Talent
                      </button>
                      <button 
                        onClick={() => setSearchMode('jobs')}
                        className={`px-8 h-full rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${searchMode === 'jobs' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Jobs
                      </button>
                    </div>
                    <Button onClick={() => handleStart()} className="h-16 px-10 rounded-[2rem] bg-[#2563eb] hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/30">Go</Button>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="relative">
                <div className="aspect-square relative rounded-[4rem] overflow-hidden shadow-2xl ring-8 ring-white group">
                  <img src="/hero_team.png" alt="Talent" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2563eb]/20 via-transparent to-transparent" />
                </div>
                
                {/* Floating Metrics */}
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }} className="absolute -right-8 top-1/4 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Star className="w-6 h-6 fill-emerald-600" /></div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">4.9/5</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Talent Rating</p>
                  </div>
                </motion.div>

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="absolute -left-8 bottom-1/4 bg-slate-900 p-6 rounded-3xl shadow-xl text-white flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400"><Globe className="w-6 h-6" /></div>
                  <div>
                    <p className="text-2xl font-black">{stats.talent.toLocaleString()}+</p>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Global Professionals</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-32 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-20">
              <div className="space-y-4">
                 <h2 className="text-5xl font-black text-slate-900 tracking-tight">Browse talent by category</h2>
                 <p className="text-lg text-slate-500 font-bold">Find the right vertical for your industrial-grade needs.</p>
              </div>
              <Button onClick={() => handleStart()} variant="ghost" className="text-[#2563eb] font-black gap-2 hover:bg-blue-50 text-lg">See all <ArrowRight className="w-5 h-5" /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <motion.div 
                  key={cat.title} 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleStart()}
                  className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:border-[#2563eb] hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-900 mb-8 flex items-center justify-center group-hover:bg-[#2563eb] group-hover:text-white transition-all">
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 truncate">{cat.title}</h3>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <p className="text-sm font-bold text-slate-400">{cat.skills}</p>
                    <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#2563eb] transition-all"><ArrowRight className="w-4 h-4" /></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Switcher */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex bg-slate-100 p-2 rounded-[2rem] mb-16">
              <button 
                onClick={() => setHowItWorksMode('hiring')}
                className={`px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${howItWorksMode === 'hiring' ? 'bg-[#2563eb] text-white shadow-xl' : 'text-slate-400'}`}
              >
                For Hiring
              </button>
              <button 
                onClick={() => setHowItWorksMode('working')}
                className={`px-10 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${howItWorksMode === 'working' ? 'bg-[#2563eb] text-white shadow-xl' : 'text-slate-400'}`}
              >
                For Working
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={howItWorksMode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="col-span-3 grid md:grid-cols-3 gap-12"
                >
                  {[
                    { 
                      step: '01', 
                      title: howItWorksMode === 'hiring' ? 'Post a Job' : 'Complete Profile', 
                      desc: howItWorksMode === 'hiring' ? 'Tell us about your project and specific skill needs.' : 'Showcase your skills and industry authority.' 
                    },
                    { 
                      step: '02', 
                      title: howItWorksMode === 'hiring' ? 'Vet Talent' : 'Find Pipelines', 
                      desc: howItWorksMode === 'hiring' ? 'Review verified portfolios and hire experts instantly.' : 'Apply to high-intent projects and verified clients.' 
                    },
                    { 
                      step: '03', 
                      title: howItWorksMode === 'hiring' ? 'Secure Escrow' : 'Execute & Get Paid', 
                      desc: howItWorksMode === 'hiring' ? 'Fund milestones and release payments on success.' : 'Complete milestones and withdraw instantly.' 
                    }
                  ].map(step => (
                    <div key={step.step} className="text-center px-8 border-r border-slate-100 last:border-none">
                      <div className="text-6xl font-black text-slate-100 mb-6">{step.step}</div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h3>
                      <p className="text-slate-500 font-bold leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-32 bg-slate-900 text-white rounded-[4rem] mx-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2563eb]/20 rounded-full blur-[100px]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-5xl font-black mb-6 tracking-tight">Scale your business faster.</h2>
            <p className="text-slate-400 font-bold text-lg mb-20">Transparent pricing for every stage of your company.</p>
            
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {pricing.map(plan => (
                <div key={plan.tier} className={`p-16 rounded-[3rem] text-left border ${plan.tier === 'Basic' ? 'bg-white/5 border-white/10' : 'bg-white border-white shadow-2xl'}`}>
                   <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${plan.tier === 'Basic' ? 'text-blue-400' : 'text-[#2563eb]'}`}>{plan.tier}</p>
                   <h3 className={`text-4xl font-black mb-8 ${plan.tier === 'Basic' ? 'text-white' : 'text-slate-900'}`}>{plan.price}</h3>
                   <ul className="space-y-4 mb-12">
                     {plan.features.map(f => (
                       <li key={f} className={`flex items-center gap-3 font-bold text-sm ${plan.tier === 'Basic' ? 'text-slate-400' : 'text-slate-600'}`}>
                         <CheckCircle2 className={`w-5 h-5 ${plan.tier === 'Basic' ? 'text-blue-400' : 'text-[#2563eb]'}`} /> {f}
                       </li>
                     ))}
                   </ul>
                   <Button onClick={() => handleStart()} className={`w-full h-16 rounded-2xl font-black text-lg ${plan.tier === 'Basic' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-[#2563eb] text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30'}`}>
                     Get Started
                   </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 text-center">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            <h2 className="text-6xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter">Everything you need to <br /> <span className="text-[#2563eb]">build anything.</span></h2>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">Join thousands of businesses and professionals building the future together.</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => handleStart('recruiter')} className="h-16 px-10 rounded-2xl bg-[#2563eb] hover:bg-blue-700 text-white font-black text-lg">Hire Talent</Button>
              <Button onClick={() => handleStart('freelancer')} variant="outline" className="h-16 px-10 rounded-2xl border-2 border-slate-200 font-black text-lg hover:bg-slate-50">Find Work</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-slate-50 pt-32 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-black text-xl italic">W</div>
                <span className="text-2xl font-black tracking-tighter text-slate-900">WorkLink</span>
              </div>
              <p className="text-slate-500 font-bold leading-relaxed max-w-sm">The world's first industrial-grade marketplace for elite talent and enterprise partnerships.</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all"><Users className="w-4 h-4" /></div>
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all"><Globe className="w-4 h-4" /></div>
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all"><Building2 className="w-4 h-4" /></div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-8">For Clients</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="hover:text-[#2563eb] cursor-pointer">How to Hire</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Talent Marketplace</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Project Planning</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Enterprise Suite</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-8">For Talent</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="hover:text-[#2563eb] cursor-pointer">How to Work</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Find Pipelines</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Success Stories</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Direct Contracts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em] mb-8">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="hover:text-[#2563eb] cursor-pointer">Help & Support</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Success Hub</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Community</li>
                <li className="hover:text-[#2563eb] cursor-pointer">Developer API</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-400">© 2026 WorkLink Technologies. Built with industrial-grade precision.</p>
            <div className="flex gap-8 text-sm font-bold text-slate-400">
               <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
               <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
               <span className="hover:text-slate-900 cursor-pointer">Cookie Settings</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

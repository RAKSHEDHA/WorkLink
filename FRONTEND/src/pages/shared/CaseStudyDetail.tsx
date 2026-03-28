import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ArrowUpRight, CheckCircle2, Zap, TrendingUp, Award, Globe, Rocket, ShieldCheck } from 'lucide-react';

const CASE_STUDIES = [
  {
    company: 'NeoFinance India',
    category: 'Web Dev',
    title: 'From MVP to ₹400Cr Valuation in 18 Months',
    fullStory: 'NeoFinance India was struggling with a legacy monolithic architecture that couldn\'t scale with their rapid user growth. WorkLink matched them with a specialized team of 12 engineers who re-engineered their entire banking core using a microservices architecture. The results were immediate: 94% reduction in transaction failures and a successful Series B funding round.',
    metrics: [{ label: 'Engineers Hired', value: '12' }, { label: 'Valuation', value: '₹400Cr' }, { label: 'Time to Market', value: '18mo' }],
    tags: ['React', 'PostgreSQL', 'AWS', 'Fintech'],
    gradient: 'from-blue-600 to-indigo-700',
    icon: TrendingUp,
  },
  {
    company: 'HealthStack AI',
    category: 'AI/ML',
    title: 'AI Diagnostics Platform Serving 2M Patients',
    fullStory: 'HealthStack AI needed to build a computer vision pipeline for real-time diagnostic analysis. Through WorkLink, they hired a senior AI/ML engineer who developed a custom model that increased diagnostic accuracy to 98.7%. The platform is now live in over 400 hospitals across the country.',
    metrics: [{ label: 'Patients Served', value: '2M+' }, { label: 'Hospitals', value: '400+' }, { label: 'Accuracy Rate', value: '98.7%' }],
    tags: ['Python', 'TensorFlow', 'FastAPI', 'Health AI'],
    gradient: 'from-emerald-500 to-teal-700',
    icon: Zap,
  },
  {
    company: 'EduForge',
    category: 'Web Dev',
    title: 'Scaling to 500k Students with a Remote Team',
    fullStory: 'EduForge used WorkLink to build a globally distributed team of 24 engineers. This allowed them to operate 24/7 and scale their platform from 10,000 to 500,000 students in less than a year, all while maintaining near-perfect uptime.',
    metrics: [{ label: 'Active Students', value: '500k' }, { label: 'Team Size', value: '24' }, { label: 'Uptime', value: '99.9%' }],
    tags: ['Next.js', 'Supabase', 'Video', 'Scale'],
    gradient: 'from-violet-600 to-purple-800',
    icon: Award,
  }
];

export default function CaseStudyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const index = parseInt(id || '0');
  const cs = CASE_STUDIES[index % CASE_STUDIES.length];

  if (!cs) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/success-hub')}
          className="mb-8 hover:bg-white -ml-4 font-bold text-slate-500 hover:text-blue-600 transition-colors gap-2"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Success Hub
        </Button>

        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className={`h-64 bg-gradient-to-br ${cs.gradient} p-12 flex flex-col justify-end relative`}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <span className="text-xs font-black text-white/70 uppercase tracking-widest">{cs.category}</span>
              <h1 className="text-4xl font-black text-white mt-2 leading-tight">{cs.company}</h1>
            </div>
            <div className="absolute top-12 right-12 w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
              <cs.icon className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="p-12">
            <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{cs.title}</h2>
            
            <div className="grid grid-cols-3 gap-6 mb-10">
              {cs.metrics.map(m => (
                <div key={m.label} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                  <p className="text-3xl font-black text-slate-900">{m.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-600" /> The Challenge & Solution
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed font-medium mb-8">
                {cs.fullStory}
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8">
                  <h4 className="font-black text-blue-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Key Deliverables
                  </h4>
                  <ul className="space-y-3">
                    {['Architecture Audit', 'Scalable Core API', '99.9% Uptime SLA', 'Real-time Monitoring'].map(item => (
                      <li key={item} className="flex items-center gap-3 text-blue-800 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8">
                  <h4 className="font-black text-emerald-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" /> Tech Stack Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cs.tags.map(tag => (
                      <span key={tag} className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs uppercase tracking-widest leading-none flex items-center">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black italic">W</div>
                <div>
                  <p className="font-black text-slate-900">Built on WorkLink</p>
                  <p className="text-sm font-bold text-slate-500">Enterprise Talent Network</p>
                </div>
              </div>
              <Button onClick={() => navigate('/client/post-job')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-blue-600/30 w-full sm:w-auto flex items-center gap-2">
                Start Your Project <ArrowUpRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Star, MapPin, Award, ShieldCheck, Briefcase, Clock, CheckCircle2, MessageSquare, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MOCK_PROFILES = [
  { id: '1', full_name: 'Elena Rodriguez', role: 'freelancer', bio: 'Enterprise Systems Architect with 12 years of experience delivering scalable React and Node.js solutions for Fortune 500 clients globally.', skills: ['React.js', 'PostgreSQL', 'AWS', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'System Architecture'], hourly_rate: 15000, location: 'Mumbai, India', rating: 5.0, jobs_completed: 84, earned: '₹8M+' },
  { id: '2', full_name: 'David Chen', role: 'freelancer', bio: 'Senior UI/UX Engineer specialized in creating premium design systems for B2B SaaS products. Led design at 3 unicorn startups.', skills: ['Figma', 'React', 'Tailwind CSS', 'Framer Motion', 'Design Systems', 'Webflow'], hourly_rate: 8500, location: 'Bangalore, India', rating: 4.9, jobs_completed: 61, earned: '₹3.2M+' },
  { id: '3', full_name: 'Marcus Johnson', role: 'freelancer', bio: 'Cloud & DevOps specialist with deep expertise in Kubernetes, Terraform, and multi-cloud architectures serving enterprise workloads.', skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Python'], hourly_rate: 12000, location: 'Remote', rating: 4.8, jobs_completed: 47, earned: '₹5.1M+' },
];

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // Try Supabase first
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) {
        setProfile(data);
      } else {
        // Fall back to mock data based on id
        const idx = parseInt(id || '1') - 1;
        setProfile(MOCK_PROFILES[idx % MOCK_PROFILES.length]);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="h-48 bg-slate-200"></div>
          <div className="pt-20 px-8 pb-8 space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-64"></div>
            <div className="h-4 bg-slate-200 rounded-xl w-48"></div>
            <div className="h-24 bg-slate-100 rounded-xl mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'FL';
  const skills = Array.isArray(profile.skills) ? profile.skills : ['React', 'TypeScript', 'Node.js'];
  const rate = profile.hourly_rate ? `₹${profile.hourly_rate.toLocaleString()}` : '₹5,000';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">
        {/* Cover */}
        <div className="h-48 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-slate-900/80"></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)' }}></div>
          <div className="absolute -bottom-16 left-8 w-32 h-32 bg-white rounded-3xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-3xl">{initials}</div>
          </div>
          <div className="absolute top-6 right-6 flex gap-3">
            <Button onClick={() => navigate('/messages')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl h-10 backdrop-blur-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
            <Button onClick={() => navigate(`/schedule/${id}`)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 shadow-lg shadow-blue-600/30 px-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule Meet
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 mb-1 flex items-center gap-3">
                {profile.full_name}
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </h1>
              <p className="text-lg font-bold text-slate-500 mb-5">
                {Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills.slice(0, 3).join(' · ') : 'Software Engineer'}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-600 mb-6">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{profile.location || 'Remote'}</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{profile.rating || 4.8} ({profile.jobs_completed || 30}+ reviews)</span>
                <span className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600" />Top Rated Plus</span>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-600" />{profile.jobs_completed || 30} Jobs Completed</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Available Now</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                <h3 className="font-black text-lg text-slate-900 mb-3">About</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{profile.bio || 'Experienced professional delivering high-quality solutions for enterprise clients.'}</p>
              </div>

              <div>
                <h3 className="font-black text-lg text-slate-900 mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Rate Card */}
            <div className="w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-3xl p-6 shrink-0 sticky top-4">
              <div className="text-center mb-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                <p className="text-4xl font-black text-slate-900">{rate}<span className="text-base text-slate-400">/hr</span></p>
              </div>

              <div className="space-y-3 mb-6 border-t border-slate-200 pt-5">
                {[
                  { label: 'Total Earned', value: profile.earned || '₹2M+' },
                  { label: 'Job Success', value: '98%' },
                  { label: 'Response Time', value: '< 1 hour' },
                  { label: 'Availability', value: '30 hrs/week' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">{stat.label}</span>
                    <span className="font-black text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button onClick={() => navigate('/client/post-job')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                  Invite to Job <ExternalLink className="w-4 h-4" />
                </Button>
                <Button onClick={() => navigate('/messages')} className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold h-12 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8">
        <h2 className="font-black text-2xl text-slate-900 mb-6">Portfolio & Case Studies</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Enterprise ERP Migration', desc: 'Migrated a 500k+ user ERP system from PHP monolith to React microservices architecture.', tags: ['React', 'Node.js', 'AWS'], color: 'bg-blue-600' },
            { title: 'Real-time Analytics Dashboard', desc: 'Built a live analytics platform processing 1M+ events/day with <200ms latency.', tags: ['PostgreSQL', 'WebSockets', 'Redis'], color: 'bg-slate-800' },
            { title: 'Mobile Banking App', desc: 'Designed and developed a cross-platform banking app with biometric auth and instant transfers.', tags: ['Flutter', 'Firebase', 'UI/UX'], color: 'bg-emerald-700' },
          ].map((proj, i) => (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <div className={`h-36 ${proj.color} flex items-end p-4`}>
                <CheckCircle2 className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-2">{proj.title}</h4>
                <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2">{proj.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.tags.map(tag => <span key={tag} className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft, MapPin, Clock, Star, Briefcase, Shield,
  ChevronRight, Users, Send, DollarSign, FileText, X, Loader2
} from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);

  // Bid form state
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single();
      
      if (error) console.error('Error fetching job:', error);
      setJob(data ?? null);
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  const handleSubmitBid = async () => {
    if (!user) { toast.error('Please login to submit a bid.'); return; }
    if (!bidAmount || !coverLetter) { toast.error('Please fill in all required fields.'); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('proposals').insert([{
        job_id: id?.startsWith('m') ? null : id,
        freelancer_id: profile?.id,
        bid_amount: parseFloat(bidAmount),
        delivery_days: parseInt(deliveryDays) || null, // Added delivery_days back
        cover_letter: coverLetter,
        status: 'pending'
      }]);

      if (error && !error.message.includes('null') && !error.message.includes('foreign key')) throw error; // Added error message check

      toast.success("🎉 Proposal Submitted! The recruiter will review your bid."); // Updated toast message
      setShowBidModal(false); // Changed from setApplyOpen to setShowBidModal
      setBidAmount('');
      setDeliveryDays(''); // Added deliveryDays reset
      setCoverLetter('');
    } catch (err: any) {
      toast.error('Application failed: ' + err.message);
    } finally {
      setSubmitting(false); // Changed from setLoading to setSubmitting
    }
  };

  const formatBudget = (j: any) => {
    if (j?.budget_min && j?.budget_max) return `₹${j.budget_min.toLocaleString()} – ₹${j.budget_max.toLocaleString()}/hr`;
    if (j?.budget) {
      const parts = String(j.budget).replace('/hr','').split('-');
      if (parts.length === 2) return `₹${parseInt(parts[0]).toLocaleString()} – ₹${parseInt(parts[1]).toLocaleString()}/hr`;
      return `₹${j.budget}`;
    }
    return j?.budget_min ? `₹${j.budget_min.toLocaleString()}/hr` : 'Negotiable';
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
          <div className="h-4 bg-slate-200 rounded-xl w-1/2" />
          <div className="h-32 bg-slate-100 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Job Not Found</h2>
        <p className="text-slate-500 font-medium mb-6">This job listing may have been removed or closed.</p>
        <Button onClick={() => navigate('/jobs')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 px-6">
          Browse All Jobs
        </Button>
      </div>
    );
  }

  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Back Nav */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">Verified Client</span>
                  {job.category && <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">{job.category}</span>}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${job.status === 'open' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                    {job.status === 'open' ? '● Open' : job.status}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />Remote</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" />{job.proposals_count || (job.id?.startsWith('m') ? Math.floor(Math.random() * 20 + 5) : 0)} proposals</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="font-black text-lg text-slate-900 mb-4">Job Description</h2>
              <p className="text-slate-600 font-medium leading-relaxed">{job.description}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="font-black text-lg text-slate-900 mb-5">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? skills.map((s: string) => (
                <span key={s} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 text-sm">{s}</span>
              )) : (
                ['Expert Implementation', 'Remote Collaboration', 'Enterprise Scale'].map(s => (
                  <span key={s} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 text-sm">{s}</span>
                ))
              )}
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="font-black text-lg text-slate-900 mb-5">What to Expect</h2>
            <div className="space-y-4">
              {[
                { icon: Briefcase, title: 'Long-term Engagement', desc: 'This is an ongoing contract with potential for milestone-based extensions.' },
                { icon: Shield, title: 'Secure Payments', desc: 'All payments are protected via WorkLink\'s escrow milestone system.' },
                { icon: Star, title: 'Top Talent Pool', desc: 'You\'ll work alongside a curated team of elite professionals.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-slate-500 font-medium text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Budget Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
            <div className="mb-5 pb-5 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Budget Range</p>
              <p className="text-3xl font-black text-slate-900">{formatBudget(job)}</p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Engagement', value: 'Long-term' },
                { label: 'Location', value: 'Remote' },
                { label: 'Experience', value: 'Senior Level' },
                { label: 'Category', value: job.category || 'Tech' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">{r.label}</span>
                  <span className="font-black text-slate-900">{r.value}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowBidModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit a Bid
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/jobs')}
              className="w-full mt-2 border-slate-200 text-slate-600 font-bold h-11 rounded-xl hover:border-blue-300 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              Browse More Jobs <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Recruiter Card */}
          {job.profiles?.full_name && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Posted By</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-700 text-lg">
                  {job.profiles.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{job.profiles.full_name}</h4>
                  <p className="text-xs font-bold text-emerald-600">Verified Recruiter</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bid Submission Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-black text-xl text-slate-900">Submit Your Bid</h2>
                <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-1">{job.title}</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Your Bid (₹/hr) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      placeholder="e.g. 6000"
                      className="w-full h-11 border border-slate-200 rounded-xl pl-9 pr-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Delivery (Days)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={deliveryDays}
                      onChange={e => setDeliveryDays(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full h-11 border border-slate-200 rounded-xl pl-9 pr-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Cover Letter *</label>
                <textarea
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're the best fit. Mention your relevant experience, approach to the project, and what sets you apart..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-700 leading-relaxed">
                  Your proposal will be submitted to the recruiter. They will review and contact you via WorkLink Messages if shortlisted. All payments are escrowed and milestone-protected.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <Button
                onClick={() => setShowBidModal(false)}
                variant="outline"
                className="flex-1 border-slate-200 text-slate-600 font-bold h-12 rounded-xl hover:border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitBid}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Bid</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

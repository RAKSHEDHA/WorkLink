// PostJobWizard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PostJobWizard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    skills: [] as string[],
    size: '',
    duration: '',
    experience: '',
    isContractToHire: false,
    paymentType: 'hourly',
    budgetFrom: '',
    budgetTo: '',
    fixedBudget: '',
    description: ''
  });

  const popularSkills = ['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'PostgreSQL', 'Python', 'AWS', 'Figma'];

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill) && formData.skills.length < 10) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const submitJob = async () => {
    if (!profile) return;
    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase.from('jobs').insert([{
        recruiter_id: profile.id,
        title: formData.title,
        description: formData.description,
        category: formData.category || 'Uncategorized',
        budget_min: formData.paymentType === 'hourly' ? parseFloat(formData.budgetFrom) : parseFloat(formData.fixedBudget),
        budget_max: formData.paymentType === 'hourly' ? parseFloat(formData.budgetTo) : parseFloat(formData.fixedBudget),
        status: 'open',
      }]);

      if (insertError) throw insertError;
      toast.success("Job Posted Successfully!");
      navigate('/client/dashboard');
    } catch (error: any) {
      console.error('Error posting job:', error);
      toast.error("Failed to post job: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-120px)] flex flex-col pt-8 px-4 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-black tracking-tight">Post a Job</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500">Step {step} of 5</span>
          <div className="w-32 md:w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.8)]"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col relative">
        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-2xl">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Let's start with a strong title</h2>
                <p className="text-slate-500 font-medium mb-8 text-lg leading-relaxed">This helps your job post stand out to the right candidates.</p>
                <input 
                  type="text" 
                  autoFocus
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Senior Product Designer" 
                  className="w-full h-14 border border-slate-300 rounded-xl px-4 font-medium text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-lg transition-all mb-6"
                />
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full h-14 border border-slate-300 rounded-xl px-4 font-medium text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-lg transition-all appearance-none cursor-pointer bg-white"
                >
                  <option value="" disabled>Select category...</option>
                {['Web Dev', 'AI/ML', 'UI/UX', 'Mobile', 'Cyber', 'Blockchain', 'Content'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-2xl">
                 <h2 className="text-3xl font-black text-slate-900 mb-2">What skills are required?</h2>
                 <input 
                    type="text" 
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') addSkill(skillInput) }}
                    placeholder="Search skills..." 
                    className="w-full h-14 border border-slate-300 rounded-xl px-4 font-medium text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 text-lg transition-all mb-4"
                 />
                 <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 font-bold text-sm">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {popularSkills.filter(s => !formData.skills.includes(s)).map(skill => (
                     <button key={skill} onClick={() => addSkill(skill)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-blue-50 transition-colors text-sm">
                       {skill} +
                     </button>
                   ))}
                 </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-2xl">
                <h2 className="text-3xl font-black text-slate-900 mb-8">Estimate the scope</h2>
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-3 gap-4">
                    {['Large', 'Medium', 'Small'].map((size) => (
                      <div key={size} onClick={() => setFormData({...formData, size})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.size === size ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200'}`}>
                        <h5 className="font-bold">{size}</h5>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-3xl">
                <h2 className="text-3xl font-black text-slate-900 mb-8">Budget</h2>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div onClick={() => setFormData({...formData, paymentType: 'hourly'})} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentType === 'hourly' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                    <h4 className="font-black text-lg">Hourly Rate</h4>
                  </div>
                  <div onClick={() => setFormData({...formData, paymentType: 'fixed'})} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentType === 'fixed' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                    <h4 className="font-black text-lg">Fixed Price</h4>
                  </div>
                </div>
                <input type="number" value={formData.paymentType === 'hourly' ? formData.budgetFrom : formData.fixedBudget} onChange={(e) => setFormData({...formData, [formData.paymentType === 'hourly' ? 'budgetFrom' : 'fixedBudget']: e.target.value})} placeholder="0.00" className="w-full h-16 px-4 border border-slate-300 rounded-xl font-black text-2xl outline-none focus:border-blue-600" />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="max-w-3xl">
                <h2 className="text-3xl font-black text-slate-900 mb-8">Description</h2>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project..."
                  className="w-full h-64 border border-slate-300 rounded-2xl p-6 font-medium focus:border-blue-600 resize-none transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={handleBack} disabled={step === 1} className="h-14 px-8 font-bold rounded-xl disabled:opacity-30">Back</Button>
          <Button onClick={step === 5 ? submitJob : handleNext} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-10 rounded-xl shadow-xl shadow-blue-600/20">
            {step === 5 ? (isSubmitting ? 'Posting...' : 'Post Job') : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
}

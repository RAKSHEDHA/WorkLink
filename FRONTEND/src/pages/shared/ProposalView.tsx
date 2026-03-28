import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Download, MessageSquare, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function ProposalDetail() {
  const { id } = useParams();
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
       <div className="mb-8 mt-4">
         <Link to="/kanban">
           <Button variant="link" className="text-slate-500 font-bold flex items-center p-0 h-auto hover:text-blue-600 hover:no-underline">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applicants
           </Button>
         </Link>
       </div>

       <div className="flex flex-col lg:flex-row gap-8">
         <div className="flex-1 space-y-6">
           {/* Freelancer Header */}
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400 relative">
                  SJ
                  <div className="absolute -bottom-2 -right-2 bg-emerald-100 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div>
                   <h1 className="text-2xl font-black text-slate-900">Sarah Jenkins <span className="text-slate-300 font-medium text-sm ml-2">#{id}</span></h1>
                   <p className="text-sm font-bold text-slate-500 mt-1">Senior UI/UX Designer & Frontend Developer</p>
                   <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-1">Top Rated Plus • ₹3,500/hr</p>
                </div>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
               <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-slate-50">
                 Message
               </Button>
               <Button className="flex-1 md:flex-none h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                 Hire Talent
               </Button>
             </div>
           </div>

           {/* Proposal Content */}
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <h3 className="font-black text-xl text-slate-900 mb-6">Cover Letter</h3>
             <div className="space-y-4 text-slate-700 font-medium leading-relaxed">
                <p>Hi there,</p>
                <p>I read through your job description for the Custom Redesign, and I am highly interested. I have spent the last 6 years building massive scalable React applications mapping explicit global state accurately without hooks crashing natively.</p>
                <p>I noticed you specifically require complex integration mechanisms. I just finished a similar gig establishing real-time WebSockets tracking direct database pushes explicitly avoiding structural overlap boundaries natively isolating generic variables securely mapping dynamic properties exclusively parsing Live Postgres correctly!</p>
                <p>I would love to jump on a quick call to map out the exact data structures you need. Let me know if you are free tomorrow.</p>
                <p>Best,<br/>Sarah</p>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-100">
               <h4 className="font-bold text-slate-900 mb-4">Attachments</h4>
               <div className="flex flex-wrap gap-4">
                 <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer group">
                   <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                     <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   </div>
                   <div>
                     <p className="font-bold text-slate-800 text-sm">Resume_Jenkins_2026.pdf</p>
                     <p className="text-xs font-bold text-slate-400">1.2 MB</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Sidebar Stats & Bid */}
         <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <h3 className="font-black text-xl mb-6 relative z-10">Proposed Terms</h3>
               
               <div className="space-y-6 relative z-10">
                 <div>
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Bid Amount</p>
                   <p className="text-3xl font-black">₹40,000</p>
                   <p className="text-sm font-medium text-slate-400 mt-1">For the entire project</p>
                 </div>
                 <div className="w-full h-px bg-slate-800"></div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Timeline</p>
                   <p className="text-lg font-bold">1 to 3 months</p>
                 </div>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
               <h4 className="font-black text-slate-900 mb-4">About the freelancer</h4>
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="font-bold text-slate-700 text-sm">Identity Verified</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <Briefcase className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="font-bold text-slate-700 text-sm">18 Jobs Completed</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <MessageSquare className="w-5 h-5 text-slate-400" />
                   <div>
                     <p className="font-bold text-slate-700 text-sm">Usually replies in 1 hr</p>
                   </div>
                 </div>
               </div>
            </div>

            <Button onClick={() => setShowComparison(!showComparison)} variant="outline" className="w-full h-12 rounded-xl font-bold text-slate-600 border-slate-300">
               {showComparison ? 'Hide Comparison' : 'Compare with others'}
            </Button>
         </div>
       </div>

       {/* Comparison Tool Expanded */}
       {showComparison && (
         <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h3 className="font-black text-xl text-slate-900 mb-6">Applicant Comparison</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <th className="pb-4 pl-4 min-w-[200px]">Applicant</th>
                    <th className="pb-4">Bid Amount</th>
                    <th className="pb-4">Job Success</th>
                    <th className="pb-4">Total Earned</th>
                    <th className="pb-4">Best Skill Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-blue-50/50">
                    <td className="py-4 pl-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-xs">SJ</div> Sarah Jenkins (Current)
                    </td>
                    <td className="py-4 font-black">₹40,000</td>
                    <td className="py-4 font-bold text-emerald-600">100%</td>
                    <td className="py-4 font-medium text-slate-600">₹1.2M+</td>
                    <td className="py-4 font-bold text-slate-700"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-black uppercase tracking-widest">React</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-xs">MR</div> Mike Ross
                    </td>
                    <td className="py-4 font-black">₹25,000</td>
                    <td className="py-4 font-bold text-slate-500">88%</td>
                    <td className="py-4 font-medium text-slate-600">₹400k</td>
                    <td className="py-4 font-bold text-slate-700"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-black uppercase tracking-widest">Figma</span></td>
                  </tr>
                </tbody>
             </table>
           </div>
         </div>
       )}
    </div>
  );
}

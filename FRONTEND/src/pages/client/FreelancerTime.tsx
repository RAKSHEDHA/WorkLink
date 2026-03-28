import { Button } from '../../components/ui/button';
import { CalendarIcon, Download, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function FreelancerTime() {
  const data = [
    { name: 'Elena R.', hours: 14.5 },
    { name: 'David C.', hours: 40.0 },
    { name: 'Sarah J.', hours: 5.5 },
    { name: 'Marcus J.', hours: 22.0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Time by Freelancer</h1>
          <p className="text-slate-500 font-medium mt-2">Visualize hourly distribution across your active contracts.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 h-10 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm">
            <CalendarIcon className="w-4 h-4 text-slate-400" /> This Week
          </div>
          <Button variant="outline" className="h-10 border-slate-300 font-bold text-slate-700 rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
           <h3 className="font-bold text-slate-500 text-sm">Total Logged Hours</h3>
           <p className="text-4xl font-black text-slate-900 mt-2">82.0 <span className="text-xl text-slate-400">hrs</span></p>
         </div>
         <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
           <h3 className="font-bold text-slate-500 text-sm">Active Hourly Contracts</h3>
           <p className="text-4xl font-black text-slate-900 mt-2">4</p>
         </div>
         <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
           <h3 className="font-bold text-slate-500 text-sm">Average Hours / Freelancer</h3>
           <p className="text-4xl font-black text-blue-600 mt-2">20.5 <span className="text-xl text-blue-400">hrs</span></p>
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-blue-600" /> Hourly Distribution
          </h3>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
              <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

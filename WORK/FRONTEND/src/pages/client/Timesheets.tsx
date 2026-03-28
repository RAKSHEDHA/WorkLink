import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Calendar as CalendarIcon, Filter, Search, Download, Clock } from 'lucide-react';

export default function Timesheets() {
  const [activeTab, setActiveTab] = useState('review');
  const timesheets = [
    { id: 1, name: "Elena Rodriguez", job: "Enterprise Architecture Consultation", hours: 14.5, limit: 20, status: "pending", total: "₹217,500" },
    { id: 2, name: "David Chen", job: "Senior UI/UX Design", hours: 40.0, limit: 40, status: "approved", total: "₹320,000" },
    { id: 3, name: "Sarah Jenkins", job: "Product Management Scoping", hours: 5.5, limit: 10, status: "approved", total: "₹55,000" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Timesheets</h1>
          <p className="text-slate-500 font-medium mt-2">Review and approve hours logged by your freelancers this week.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 border-slate-300 font-bold text-slate-700 rounded-xl">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold rounded-xl shadow-md">
            Review All
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 mb-8">
        {[
          { id: 'review', label: 'In Review', count: 1 },
          { id: 'approved', label: 'Approved', count: 2 },
          { id: 'paid', label: 'Paid', count: 12 },
          { id: 'all', label: 'All Timesheets', count: 0 }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab.label} {tab.count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span>Oct 18, 2026 - Oct 24, 2026</span>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search freelancers..." className="w-full h-10 border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium focus:border-blue-600 outline-none" />
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider font-black text-slate-400 bg-slate-50/50">
              <th className="p-6">Freelancer & Job</th>
              <th className="p-6">Hours Logged</th>
              <th className="p-6">Weekly Limit</th>
              <th className="p-6">Amount</th>
              <th className="p-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {timesheets.filter(t => activeTab === 'all' ? true : t.status === (activeTab === 'review' ? 'pending' : activeTab)).map(sheet => (
              <tr key={sheet.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">
                      {sheet.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{sheet.name}</h4>
                      <p className="font-medium text-slate-500 mt-0.5">{sheet.job}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 font-black text-slate-900">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" /> {sheet.hours} hrs
                  </span>
                </td>
                <td className="p-6 font-bold text-slate-500">{sheet.limit} hrs</td>
                <td className="p-6 font-black text-slate-900">{sheet.total}</td>
                <td className="p-6 text-right">
                  {sheet.status === 'pending' ? (
                    <Button className="h-9 px-4 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-none shadow-none">
                      Approve Time
                    </Button>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full uppercase tracking-widest">
                      Approved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

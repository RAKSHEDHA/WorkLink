import { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight, Activity, Clock, Search } from 'lucide-react';

export default function WorkDiaries() {
  const [activeUser, setActiveUser] = useState("Elena Rodriguez");
  
  const diaryEntries = Array.from({ length: 6 }).map((_, i) => ({
    time: `10:${i}0 AM`,
    activity: Math.floor(Math.random() * 40) + 60, // 60-100%
    isIdle: Math.random() > 0.8
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Work Diaries</h1>
          <p className="text-slate-500 font-medium mt-2">Monitor 10-minute activity segments and screenshots for hourly contracts.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={activeUser}
            onChange={(e) => setActiveUser(e.target.value)}
            className="h-10 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 bg-white shadow-sm outline-none focus:border-blue-600"
          >
            <option value="Elena Rodriguez">Elena Rodriguez</option>
            <option value="David Chen">David Chen</option>
            <option value="Sarah Jenkins">Sarah Jenkins</option>
          </select>
          <div className="flex items-center gap-2 px-4 h-10 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm shadow-sm">
            <button className="text-slate-400 hover:text-slate-900"><ChevronLeft className="w-5 h-5" /></button>
            <CalendarIcon className="w-4 h-4 mx-2 text-blue-600" /> Today
            <button className="text-slate-400 cursor-not-allowed opacity-50"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
               {activeUser.substring(0, 2).toUpperCase()}
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-900">{activeUser}</h3>
               <p className="text-sm font-bold text-slate-500">{activeUser === 'Elena Rodriguez' ? 'Enterprise Architecture' : 'UI Design'} • 2:00 hrs logged today</p>
             </div>
          </div>
          <div className="text-right">
             <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Segment Activity</div>
             <div className="text-2xl font-black text-emerald-600 flex items-center gap-2 justify-end">
               <Activity className="w-6 h-6" /> 84% Average
             </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* 10:00 AM Block */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              <h4 className="font-bold text-lg text-slate-900">10:00 AM - 11:00 AM</h4>
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">1.0 hrs</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {diaryEntries.map((entry, idx) => (
                <div key={idx} className="group relative">
                  <div className={`aspect-video rounded-xl border-2 flex items-center justify-center overflow-hidden mb-3 transition-colors ${entry.isIdle ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400 cursor-pointer pointer-events-auto'}`}>
                    {entry.isIdle ? (
                       <span className="text-xs font-bold text-amber-600">No Activity</span>
                    ) : (
                       <div className="w-full h-full bg-slate-200 relative">
                         <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                           <Search className="w-6 h-6 text-blue-600" />
                         </div>
                       </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-600">{entry.time}</span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${entry.isIdle ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${entry.activity}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 11:00 AM Block */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              <h4 className="font-bold text-lg text-slate-900">11:00 AM - 12:00 PM</h4>
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">1.0 hrs</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {diaryEntries.map((_entry, idx) => (
                <div key={`b-${idx}`} className="group relative">
                  <div className={`aspect-video rounded-xl border-2 flex items-center justify-center overflow-hidden mb-3 transition-colors ${Math.random() > 0.9 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400 cursor-pointer'}`}>
                    {Math.random() > 0.9 ? (
                       <span className="text-xs font-bold text-amber-600">No Activity</span>
                    ) : (
                       <div className="w-full h-full bg-slate-200 relative">
                         <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                           <Search className="w-6 h-6 text-blue-600" />
                         </div>
                       </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-600">11:{idx}0 AM</span>
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${Math.random() > 0.9  ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

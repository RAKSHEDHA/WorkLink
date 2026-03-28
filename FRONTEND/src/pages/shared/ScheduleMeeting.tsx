import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Calendar as CalendarIcon, Clock, Video, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  const availableTimes = ['09:00 AM', '10:30 AM', '01:00 PM', '02:00 PM', '04:30 PM'];

  if (booked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Consultation Confirmed!</h1>
        <p className="text-lg text-slate-500 font-medium mb-8">An invitation has been sent to Elena Rodriguez. A secure WorkLink video room will be generated 5 minutes prior to the meeting.</p>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto mb-8 shadow-sm text-left">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold text-slate-900">Architecture Discovery Call</h3>
               <p className="text-sm font-bold text-slate-500">With Elena Rodriguez • 45 Minutes</p>
             </div>
           </div>
           
           <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center text-sm font-bold text-slate-700">
              <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400" /> October 28, 2026</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {selectedTime}</span>
           </div>
        </div>

        <Button onClick={() => navigate('/client/dashboard')} className="bg-slate-900 hover:bg-black text-white font-bold h-14 px-8 rounded-xl shadow-lg">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-slate-400 hover:text-slate-900 mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Profile
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Info Panel */}
        <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-200">
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl mb-6 shadow-inner">
             ER
           </div>
           <h2 className="text-xl font-black text-slate-900 mb-2">Elena Rodriguez</h2>
           <p className="text-sm font-bold text-slate-500 mb-8">Scheduling an Enterprise Architecture Consultation</p>

           <div className="space-y-4">
             <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
               <Clock className="w-5 h-5 text-blue-600" /> 45 Minutes
             </div>
             <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
               <Video className="w-5 h-5 text-blue-600" /> Secure Video Meeting
             </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-200">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Timezone is explicitly locked to your geographic layout natively avoiding conversion races.</p>
           </div>
        </div>

        {/* Right Calendar Panel */}
        <div className="w-full md:w-2/3 p-8">
           <h1 className="text-2xl font-black text-slate-900 mb-8">Select a Date & Time</h1>

           <div className="flex gap-8 flex-col lg:flex-row">
             <div className="flex-1">
               <div className="flex items-center justify-between font-bold text-lg mb-6 text-slate-900">
                 October 2026
                 <div className="flex gap-2">
                   <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                   <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-900"><ChevronRight className="w-5 h-5" /></button>
                 </div>
               </div>
               
               <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-4">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
               </div>

               <div className="grid grid-cols-7 gap-2 text-sm font-bold">
                 {Array.from({ length: 31 }).map((_, i) => {
                   const date = i + 1;
                   const isPast = date < 24;
                   const isSelected = selectedDate === date;
                   return (
                     <button
                       key={i}
                       disabled={isPast}
                       onClick={() => setSelectedDate(date)}
                       className={`w-full aspect-square flex items-center justify-center rounded-xl transition-all ${
                         isPast ? 'text-slate-300 cursor-not-allowed' : 
                         isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 
                         'text-slate-700 hover:bg-slate-100'
                       }`}
                     >
                       {date}
                     </button>
                   )
                 })}
               </div>
             </div>

             {selectedDate && (
               <div className="w-full lg:w-48 animate-in slide-in-from-right-4 duration-300">
                 <h3 className="font-bold text-slate-900 mb-4 text-center">Available Times</h3>
                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {availableTimes.map((time) => (
                     <button 
                       key={time}
                       onClick={() => setSelectedTime(time)}
                       className={`w-full h-12 flex items-center justify-center rounded-xl font-bold transition-all border ${
                         selectedTime === time ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-blue-200 text-blue-600 hover:border-blue-600'
                       }`}
                     >
                       {time}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </div>

           {selectedDate && selectedTime && (
             <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end animate-in fade-in duration-300">
               <Button onClick={() => setBooked(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg shadow-blue-600/20 text-lg">
                 Confirm Booking
               </Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

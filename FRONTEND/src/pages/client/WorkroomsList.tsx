import { MessageSquare, LayoutGrid, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WorkroomsList() {
  const navigate = useNavigate();
  const rooms = [
    { title: "Enterprise AI Pipeline Deployment", unread: 4, lastActive: "2 mins ago", id: "c1", category: "AI/ML" },
    { title: "React 19 System Core Migration", unread: 2, lastActive: "15 mins ago", id: "c1", category: "Web Dev" },
    { title: "Global Security Audit & Hardening", unread: 0, lastActive: "1 hour ago", id: "c1", category: "Cyber" },
    { title: "NextGen UI/UX Transformation", unread: 7, lastActive: "3 hours ago", id: "c1", category: "UI/UX" },
    { title: "Solidity Smart Contract Audit", unread: 0, lastActive: "5 hours ago", id: "c1", category: "Blockchain" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Workrooms</h1>
          <p className="text-slate-500 font-medium mt-2">Collaborate securely with your hired talent in real-time.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, i) => (
          <div key={i} onClick={() => navigate(`/workroom/${room.id}`)} className="bg-white rounded-3xl border border-slate-200 p-6 cursor-pointer hover:border-blue-600 transition-all hover:shadow-lg hover:shadow-blue-600/5 group relative overflow-hidden">
            {room.unread > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-md">
                {room.unread} New
              </div>
            )}
            
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            
            <h3 className="font-black text-xl text-slate-900 leading-tight mb-2 pr-8">{room.title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Room ID: #{room.id}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <Clock className="w-4 h-4" /> {room.lastActive}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
        
        {/* Placeholder for new room */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-not-allowed opacity-70">
           <LayoutGrid className="w-8 h-8 text-slate-400 mb-4" />
           <p className="font-bold text-slate-600">Hire talent to open more rooms</p>
        </div>
      </div>
    </div>
  );
}

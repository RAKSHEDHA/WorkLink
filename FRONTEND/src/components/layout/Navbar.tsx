import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleStart = (role?: 'freelancer' | 'recruiter') => {
    if (role) {
      localStorage.setItem('user_role', role);
    }
    navigate('/signup');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100/50 h-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl text-white flex items-center justify-center font-black text-xl italic shadow-lg group-hover:scale-105 transition-transform">W</div>
            <span className="font-black text-2xl text-slate-900 tracking-tighter">WorkLink</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleStart('freelancer')} 
              className="text-sm font-bold text-slate-600 hover:text-[#2563eb] transition-colors"
            >
              Find Work
            </button>
            <button 
              onClick={() => handleStart('recruiter')} 
              className="text-sm font-bold text-slate-600 hover:text-[#2563eb] transition-colors"
            >
              Hire Talent
            </button>
            <Link to="/success-hub" className="text-sm font-bold text-slate-600 hover:text-[#2563eb] transition-colors">
              Why WorkLink
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-center px-8">
          <div className="w-full max-w-xs relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search talent..." 
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-bold text-xs transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/client/talent');
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/auth')} 
            className="text-sm font-bold text-slate-600 hover:text-[#2563eb] px-4 py-2"
          >
            Log In
          </button>
          <Button 
            onClick={() => handleStart()} 
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-black px-6 h-11 rounded-xl shadow-lg shadow-blue-500/20"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}

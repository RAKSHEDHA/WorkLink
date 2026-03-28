import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft,
  Globe,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import FreelancerProfile from './FreelancerProfile';
import RecruiterProfile from './RecruiterProfile';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 animate-in fade-in duration-1000">
      {/* Hero Header (Shared) */}
      <div className="h-[40vh] bg-slate-900 relative overflow-hidden">
        {profile.header_url ? (
          <img src={profile.header_url} alt="Banner" className="w-full h-full object-cover opacity-50 scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(37,99,235,0.3) 0%, transparent 40%)' }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        {/* Floating Controls */}
        <div className="absolute top-10 left-10 z-50">
           <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            size="icon" 
            className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 transition-all backdrop-blur-md"
           >
             <ArrowLeft className="w-6 h-6" />
           </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-10">
        {profile.role === 'recruiter' ? (
          <RecruiterProfile profile={profile} isOwnProfile={true} onRefresh={refreshProfile} />
        ) : (
          <FreelancerProfile profile={profile} isOwnProfile={true} onRefresh={refreshProfile} />
        )}
      </div>

      {/* Persistent Edit Button (for mobile/scrolled) */}
      <div className={`fixed bottom-10 right-10 z-50 transition-all duration-500 scale-90 md:scale-100 ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <Button onClick={() => navigate('/settings')} className="h-16 px-8 rounded-[2rem] bg-slate-900 text-white font-black shadow-2xl flex items-center gap-3 active:scale-95 group">
             <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
             Manage Identity
          </Button>
      </div>
    </div>
  );
}

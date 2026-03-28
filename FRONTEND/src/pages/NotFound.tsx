import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-8"
        >
          <div className="relative">
            <h1 className="text-9xl font-black text-slate-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center pt-8">
              <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl italic shadow-2xl relative z-10">
                W
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">You've drifted off-course.</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              The page you are looking for has been moved or deleted. Let's get you back to the home orbit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
               onClick={() => navigate('/')} 
               className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
            >
              <Home className="w-5 h-5 mr-2" /> Return to Orbit
            </Button>
            <Button 
               onClick={() => navigate(-1)} 
               variant="outline"
               className="flex-1 h-14 border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50"
            >
               <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

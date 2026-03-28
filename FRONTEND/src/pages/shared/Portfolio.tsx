import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Code, 
  Palette, 
  Gem, 
  Cpu, 
  Globe, 
  Layout,
  Rocket
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const MOCK_PORTFOLIO = [
  {
    id: 1,
    title: "Quantum Fintech Engine",
    description: "A high-frequency trading dashboard with real-time risk assessment and predictive liquidity modeling.",
    category: "Fintech",
    icon: Gem,
    color: "bg-blue-600",
    image: "https://images.unsplash.com/photo-1611974717482-9625bb602434?auto=format&fit=crop&q=80&w=800",
    tags: ["React", "WebSockets", "D3.js"]
  },
  {
    id: 2,
    title: "Neural-Sync AI Agent",
    description: "Autonomous customer success agent capable of resolving 80% of tier-1 support tickets in under 60 seconds.",
    category: "AI & ML",
    icon: Cpu,
    color: "bg-purple-600",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    tags: ["Python", "LLMs", "Vector DB"]
  },
  {
    id: 3,
    title: "Ether-Vault Web3 Protocol",
    description: "Non-custodial asset management platform with multi-sig security and automated gas-less transactions.",
    category: "Web3",
    icon: Globe,
    color: "bg-indigo-600",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
    tags: ["Solidity", "Ethers.js", "Polygon"]
  },
  {
    id: 4,
    title: "Nova Design System",
    description: "An enterprise-grade design framework for scaling SaaS interfaces with zero CSS overhead.",
    category: "Design",
    icon: Palette,
    color: "bg-rose-600",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
    tags: ["Figma", "Tailwind", "React"]
  },
  {
    id: 5,
    title: "Grid-Scale SaaS LMS",
    description: "Learning Management System optimized for 100k+ concurrent users with offline sync capabilities.",
    category: "EdTech",
    icon: Layout,
    color: "bg-amber-600",
    image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=800",
    tags: ["Next.js", "GraphQL", "Postgres"]
  },
  {
    id: 6,
    title: "Hyper-Connect API Gateway",
    description: "Ultra-low latency middleware for enterprise microservices with automated documentation.",
    category: "Infrastructure",
    icon: Code,
    color: "bg-emerald-600",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?auto=format&fit=crop&q=80&w=800",
    tags: ["Go", "gRPC", "Kubernetes"]
  }
];

export default function Portfolio() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Fintech', 'AI & ML', 'Web3', 'Design', 'EdTech', 'Infrastructure'];
  const filteredProjects = filter === 'All' 
    ? MOCK_PORTFOLIO 
    : MOCK_PORTFOLIO.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-90"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <span className="text-sm font-black text-blue-400 uppercase tracking-[0.3em] font-mono">Creative Ledger</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
              Digital <span className="text-blue-500">Masterpieces</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl">
              Showcasing enterprise-grade solutions built for the next generation of global industry leaders.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 py-6 px-6">
        <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry-style Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="break-inside-avoid bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-6 right-6">
                  <div className={`w-12 h-12 ${project.color} text-white rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
                    <project.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-slate-400 border border-slate-100 px-3 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-slate-100 text-slate-900 font-black hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                >
                  View Case Study <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-40 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">No projects found in this category</h3>
            <p className="text-slate-500 mt-2 font-medium">Try another filter or check back later for new elite drops.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/40">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
           <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                Ready to launch your<br />next flagship project?
              </h2>
              <Button 
                onClick={() => navigate('/jobs')}
                className="bg-white text-blue-600 hover:bg-slate-50 font-black h-16 px-12 rounded-2xl shadow-xl text-lg transition-transform active:scale-95"
              >
                Find Elite Talent
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

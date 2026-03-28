import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SPEND_DATA = [
  { month: 'Oct', spend: 85000, hires: 2 },
  { month: 'Nov', spend: 120000, hires: 3 },
  { month: 'Dec', spend: 95000, hires: 2 },
  { month: 'Jan', spend: 165000, hires: 4 },
  { month: 'Feb', spend: 185000, hires: 5 },
  { month: 'Mar', spend: 240000, hires: 6 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-slate-700">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-blue-400">₹{(payload[0].value / 1000).toFixed(0)}k spend</p>
        <p className="text-emerald-400">{payload[1]?.value || 0} hires</p>
      </div>
    );
  }
  return null;
};

export default function SpendingChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg">Spending Over Time</h3>
          <p className="text-xs font-bold text-slate-400 mt-0.5">Last 6 months · All Contracts</p>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Spend
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Hires
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={SPEND_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hireGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="#2563EB"
            strokeWidth={2.5}
            fill="url(#spendGrad)"
            dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#2563EB' }}
          />
          <Area
            type="monotone"
            dataKey="hires"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#hireGrad)"
            dot={{ r: 3, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
            yAxisId={1}
            activeDot={{ r: 5 }}
          />
          <YAxis yAxisId={1} orientation="right" hide />
        </AreaChart>
      </ResponsiveContainer>

      {/* Hiring Velocity Stat */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiring Velocity</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">8.3 <span className="text-sm font-bold text-slate-400">days avg</span></p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Released</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">₹7.9L</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Spenders</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">6</p>
        </div>
      </div>
    </div>
  );
}

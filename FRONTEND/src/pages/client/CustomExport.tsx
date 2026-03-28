import { Button } from '../../components/ui/button';
import { Download, FileText, Table, CheckCircle2 } from 'lucide-react';

export default function CustomExport() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Export Financial Data</h1>
        <p className="text-lg text-slate-500 font-medium">Generate custom CSV or PDF reports for your accounting department.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 max-w-2xl mx-auto">
        <div className="space-y-8">
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Start Date</label>
                <input type="date" className="w-full h-12 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 focus:border-blue-600 outline-none" defaultValue="2026-10-01" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">End Date</label>
                <input type="date" className="w-full h-12 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 focus:border-blue-600 outline-none" defaultValue="2026-10-31" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4">Data Points Included</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Hours Logged', 'Hourly Equivalents', 'Direct Contract Amounts', 'Milestone Escrow', 'WorkLink Fees', 'Tax Identifiers'].map((point, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{point}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <Button className="flex-1 bg-slate-900 hover:bg-black h-14 rounded-xl font-bold shadow-md text-lg">
              <Table className="w-5 h-5 mr-2" /> Download CSV
            </Button>
            <Button className="flex-1 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 h-14 rounded-xl font-bold shadow-sm text-lg">
              <FileText className="w-5 h-5 mr-2" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-sm font-bold text-slate-400 mt-8 flex items-center justify-center gap-2">
        <Download className="w-4 h-4" /> Reports are generated securely via edge functions tracking strict localization parameters.
      </p>
    </div>
  );
}

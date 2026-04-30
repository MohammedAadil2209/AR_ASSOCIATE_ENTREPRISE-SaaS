import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);

  const reportGroups = [
    {
      id: 'inventory',
      label: 'Inventory Reports',
      reports: [
        { name: 'Inventory Details', desc: 'Detailed view of stock levels across all nodes.', endpoint: 'products' },
        { name: 'Inventory Valuation Summary', desc: 'Current value of your stock in hand.', endpoint: 'products' },
        { name: 'Warehouse Performance', desc: 'Efficiency metrics for multi-node storage.', endpoint: 'warehouses' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales Reports',
      reports: [
        { name: 'Sales by Item', desc: 'Analyze which items are driving your revenue.', endpoint: 'transactions' },
        { name: 'Customer Ledger', desc: 'Complete financial history of client accounts.', endpoint: 'transactions' },
        { name: 'Executive Efficiency', desc: 'Performance audit of the field sales force.', endpoint: 'saleslogs' }
      ]
    },
    {
      id: 'purchases',
      label: 'Purchase Reports',
      reports: [
        { name: 'Purchase History', desc: 'Complete log of all procurement requests.', endpoint: 'transactions' },
        { name: 'Vendor Directory', desc: 'Master database of authorized suppliers.', endpoint: 'vendors' }
      ]
    }
  ];

  const handleDownload = async (report) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/${report.endpoint}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("No data available for this audit.");
        return;
      }
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "AuditData");
      XLSX.writeFile(wb, `${report.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success(`${report.name} exported successfully.`);
    } catch (e) {
      toast.error("Analytics export failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalExport = async () => {
    toast.loading("Compiling global enterprise data...");
    // Just a demo export of transactions
    handleDownload({ name: 'Global_Enterprise_Ledger', endpoint: 'transactions' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Hub</h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
              <ShieldCheck size={14} className="text-emerald-500" /> Advanced Enterprise Analytics Engine
            </p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all hover:bg-slate-50">
              <Calendar size={18} /> This Month
           </button>
           <button 
             onClick={handleGlobalExport}
             disabled={loading}
             className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
           >
              <Download size={18} /> {loading ? 'Compiling...' : 'Export Global Data'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         <div className="lg:col-span-1 space-y-4">
            {reportGroups.map(group => (
              <button 
                key={group.id}
                onClick={() => setActiveTab(group.id)}
                className={`w-full text-left p-6 rounded-[28px] transition-all flex items-center justify-between group ${activeTab === group.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white border border-slate-100 text-slate-500 hover:border-indigo-100 hover:bg-indigo-50/30'}`}
              >
                 <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${activeTab === group.id ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'}`}>
                       {group.id === 'inventory' ? <Layers size={20} /> : group.id === 'sales' ? <TrendingUp size={20} /> : <PieChart size={20} />}
                    </div>
                    <span className="font-black uppercase tracking-widest text-xs">{group.label}</span>
                 </div>
                 <ChevronRight size={16} className={activeTab === group.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
              </button>
            ))}
         </div>

         <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 min-h-[500px]">
               <h2 className="text-2xl font-black tracking-tight mb-8">
                 {reportGroups.find(g => g.id === activeTab).label}
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportGroups.find(g => g.id === activeTab).reports.map((report, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleDownload(report)}
                      className="p-8 rounded-[32px] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                    >
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <FileText size={20} />
                          </div>
                          <div className="text-slate-300 group-hover:text-indigo-600 transition-colors"><Download size={18} /></div>
                       </div>
                       <h3 className="text-lg font-black text-slate-900 mb-2">{report.name}</h3>
                       <p className="text-sm text-slate-400 font-medium">{report.desc}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900 rounded-[40px] p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Value</p>
                     <TrendingUp size={20} className="text-emerald-400" />
                  </div>
                  <h4 className="text-3xl font-black tracking-tighter mb-4">₹1,24,45,000</h4>
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest">
                     <ArrowUpRight size={14} /> 12.5% vs Last Quarter
                  </div>
               </div>
               <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sales Burn Rate</p>
                     <TrendingUp size={20} className="text-indigo-600" />
                  </div>
                  <h4 className="text-3xl font-black tracking-tighter mb-4">₹4,20,000 <span className="text-sm text-slate-400 font-bold">/ Day</span></h4>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                     Steady Operation
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  TrendingDown, 
  RefreshCw,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Download,
  Trash2,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';
import DocumentPrinter from '../components/DocumentPrinter';
import * as XLSX from 'xlsx';

export default function Purchases() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printData, setPrintData] = useState(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/transactions/type/ORDER');
      const data = await res.json();
      // Filter for Purchases specifically if the backend supports categories, 
      // otherwise we treat all Orders as Purchases here for demo purposes or filter by amount > 0
      setPurchaseOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      toast.error('Sync failed');
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, []);

  const handleExport = () => {
    if (purchaseOrders.length === 0) return toast.error("No procurement data.");
    const ws = XLSX.utils.json_to_sheet(purchaseOrders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    XLSX.writeFile(wb, `Procurement_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Procurement ledger exported.");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge procurement record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("PO purged.");
        fetchPurchases();
      }
    } catch (e) {
      toast.error("Operation failed.");
    }
  };

  const filteredOrders = purchaseOrders.filter(po => 
    (po.vendorName || po.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (po.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
      case 'RECEIVED': case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'OPEN': case 'PENDING': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'DRAFT': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Purchase Hub</h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
              <ShieldCheck size={14} className="text-emerald-500" /> Enterprise Procurement Pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPurchases} className="bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 p-3.5 rounded-2xl transition-all shadow-sm">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black shadow-sm hover:bg-slate-50 flex items-center gap-2 text-[13px] tracking-wider transition-all">
             <Download size={20} /> EXPORT
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black shadow-xl flex items-center gap-2 text-[13px] tracking-wider transition-all active:scale-95">
            <Plus size={20} /> INITIATE PROCUREMENT
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Procured', value: `₹${filteredOrders.reduce((a, b) => a + (b.amount || 0), 0).toLocaleString()}`, icon: TrendingDown, color: 'rose' },
           { label: 'Orders Tracked', value: filteredOrders.length, icon: Clock, color: 'blue' },
           { label: 'Active Pipeline', value: filteredOrders.filter(o => o.status !== 'RECEIVED').length, icon: CheckCircle2, color: 'emerald' },
           { label: 'Cloud Synced', value: 'Live', icon: ShieldCheck, color: 'indigo' }
         ].map((s, i) => (
           <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-600`}>
                 <s.icon size={22} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                 <p className="text-xl font-black text-slate-900">{s.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="px-8 pt-8 pb-4 flex flex-col lg:flex-row justify-between items-center gap-6">
           <div className="flex gap-2">
              {['ALL', 'OPEN', 'RECEIVED', 'DRAFT'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {f}
                </button>
              ))}
           </div>
           <div className="relative w-full lg:max-w-xs group">
              <Search className="absolute left-4 top-[14px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search POs or Vendors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/10" 
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left whitespace-nowrap">
              <thead>
                 <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-50">
                    <th className="px-10 py-6">Order Identity</th>
                    <th className="px-10 py-6">Vendor / Supplier</th>
                    <th className="px-10 py-6">Reference Date</th>
                    <th className="px-10 py-6 text-right">Value</th>
                    <th className="px-10 py-6 text-center">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {loading ? (
                   <tr><td colSpan={6} className="py-40 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={48} /></td></tr>
                 ) : filteredOrders.length === 0 ? (
                   <tr><td colSpan={6} className="py-40 text-center font-black text-slate-300 uppercase text-xs tracking-widest">No procurement records found</td></tr>
                 ) : filteredOrders.map(po => (
                   <tr key={po._id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-10 py-7">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                               <FileText size={18} />
                            </div>
                            <div>
                               <p className="font-black text-slate-900 tracking-tight">{po.transactionId || 'PO-SYSTEM'}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(po.date).toLocaleDateString('en-GB')}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-7">
                         <p className="font-black text-slate-700">{po.vendorName || po.customerName || 'Standard Supplier'}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Source</p>
                      </td>
                      <td className="px-10 py-7">
                         <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <Clock size={14} /> {new Date(po.date).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                         <p className="font-black text-lg tracking-tight text-slate-900">₹{(po.amount || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-7 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${getStatusStyle(po.status || po.orderStatus)}`}>
                            {po.status || po.orderStatus || 'DRAFT'}
                         </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => setPrintData(po)} className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Print Document">
                              <Printer size={16} />
                           </button>
                           <button onClick={() => handleDelete(po._id)} className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      <DataModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type="Transactions" 
        onSave={fetchPurchases} 
      />
      <DocumentPrinter 
        isOpen={!!printData}
        data={printData}
        onClose={() => setPrintData(null)}
      />
    </div>
  );
}

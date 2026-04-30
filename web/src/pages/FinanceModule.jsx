import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  RefreshCw, 
  Download,
  LayoutGrid,
  List,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  CreditCard,
  Wallet,
  Receipt,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';
import DocumentPrinter from '../components/DocumentPrinter';
import * as XLSX from 'xlsx';

export default function FinanceModule({ title, subtitle, icon: Icon, type }) {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [printData, setPrintData] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/transactions`)
      .then(res => res.json())
      .then(resData => {
        const filtered = Array.isArray(resData) ? resData.filter(t => t.type === type) : [];
        setData(filtered);
        setLoading(false);
      })
      .catch(err => {
        toast.error(`Financial sync failure for ${title}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleExport = () => {
    if (data.length === 0) return toast.error("Ledger empty.");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title}_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`${title} ledger exported.`);
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Purge [${name}] transaction from ledger?`)) return;
    fetch(`http://localhost:5000/api/transactions/${id}`, { method: 'DELETE' })
      .then(res => {
        if(res.ok) {
           toast.success(`[${name}] record erased.`);
           fetchData();
        }
      });
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const renderStatus = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    const isPositive = s === 'PAID' || s === 'CONFIRMED' || s === 'SETTLED';
    const isWarning = s === 'PENDING' || s === 'DRAFT' || s === 'DUE';
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black tracking-widest uppercase ${
        isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
        isWarning ? 'bg-amber-50 text-amber-600 border-amber-100' : 
        'bg-rose-50 text-rose-600 border-rose-100'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'}`} />
        {s}
      </div>
    );
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/10">
            <Icon size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
               {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1 mr-2 shadow-sm">
              <button onClick={() => setView('list')} className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}><List size={20} /></button>
              <button onClick={() => setView('grid')} className={`p-2.5 rounded-xl transition-all ${view === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}><LayoutGrid size={20} /></button>
           </div>
           <button onClick={fetchData} className="bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 p-3.5 rounded-2xl transition-all shadow-sm">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black shadow-sm hover:bg-slate-50 flex items-center gap-2 text-[11px] uppercase tracking-widest transition-all">
             <Download size={20} /> EXPORT
           </button>
           <button onClick={() => { setSelectedItem({ type: type }); setIsModalOpen(true); }} className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest transition-all active:scale-95">
             <Plus size={20} /> INITIATE
           </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/20">
           <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by ID or Client..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all" 
              />
           </div>
           <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Partition: {type}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Records: {filteredData.length}</span>
           </div>
        </div>

        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40"><RefreshCw className="animate-spin text-indigo-600" size={64} /></div>
         ) : filteredData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                   <Receipt size={64} strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No footprints found</h2>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed uppercase text-[10px] tracking-widest">Financial ledger partition empty for {type}.</p>
                <button onClick={() => { setSelectedItem({ type: type }); setIsModalOpen(true); }} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20">Initialize Ledger Entry</button>
            </div>
         ) : view === 'list' ? (
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left whitespace-nowrap">
                  <thead>
                     <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-50">
                        <th className="px-10 py-6">Transaction Identity</th>
                        <th className="px-10 py-6">Counterparty</th>
                        <th className="px-10 py-6 text-right">Settlement Value</th>
                        <th className="px-10 py-6 text-center">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredData.map(item => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-all group">
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Icon size={20} />
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{item.transactionId}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(item.createdAt || item.date).toLocaleDateString('en-GB')}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <p className="font-black text-slate-700">{item.customerName || item.vendorName || 'System Generated'}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">By {item.salesmanName || 'Operator'}</p>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <p className={`font-black text-lg tracking-tight ${type === 'PAYMENT' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                 {type === 'PAYMENT' ? '+' : ''} ₹{Number(item.amount || 0).toLocaleString()}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Valuation Basis</p>
                           </td>
                           <td className="px-10 py-7 text-center">
                              {renderStatus(item.invoiceStatus || item.orderStatus || 'COMPLETED')}
                           </td>
                           <td className="px-10 py-7 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                 <button onClick={() => setPrintData(item)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Print Document"><Printer size={18} /></button>
                                 <button onClick={() => openEdit(item)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit"><Edit2 size={18} /></button>
                                 <button onClick={() => handleDelete(item._id, item.transactionId)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-10 flex-1 bg-slate-50/20">
               {filteredData.map(item => (
                  <div key={item._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col">
                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleDelete(item._id, item.transactionId)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                     </div>
                     <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-2xl mb-8 group-hover:scale-110 transition-transform ring-4 ring-indigo-50">
                        <Icon size={32} />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">{item.transactionId}</h3>
                     <p className="text-sm font-bold text-slate-400 mb-6 truncate">{item.customerName || item.vendorName || 'Enterprise Audit'}</p>
                     
                     <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement</p>
                           <p className="text-2xl font-black text-slate-900 flex items-center gap-1 tracking-tighter">
                              <span className="text-emerald-500 text-sm">₹</span>
                              {Number(item.amount || 0).toLocaleString()}
                           </p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setPrintData(item)} className="w-12 h-12 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-[16px] flex items-center justify-center transition-all">
                              <Printer size={20} />
                           </button>
                           <button onClick={() => openEdit(item)} className="w-12 h-12 bg-slate-900 text-white rounded-[16px] flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-black">
                              <Edit2 size={20} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>

      <DataModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }} 
        type="Transactions" 
        onSave={fetchData} 
        initialData={selectedItem}
      />
      <DocumentPrinter 
        isOpen={!!printData}
        data={printData}
        onClose={() => setPrintData(null)}
      />
    </div>
  );
}

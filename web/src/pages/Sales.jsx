import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  CreditCard, 
  ChevronDown, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  SearchIcon, 
  RefreshCw, 
  Smartphone, 
  TrendingUp, 
  History, 
  ClipboardCheck, 
  Wallet,
  ArrowUpRight,
  Receipt,
  ShieldCheck,
  Trash2,
  MoreVertical,
  List,
  LayoutGrid,
  Edit2,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';
import DocumentPrinter from '../components/DocumentPrinter';
import * as XLSX from 'xlsx';

export default function Sales() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [view, setView] = useState('list');
  const [transactions, setTransactions] = useState([]);
  const [salesLogs, setSalesLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [customers, setCustomers] = useState([]);

  const fetchSalesData = () => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:5000/api/transactions').then(res => res.json()),
      fetch('http://localhost:5000/api/saleslogs').then(res => res.json()),
      fetch('http://localhost:5000/api/customers').then(res => res.json())
    ]).then(([trans, logs, custs]) => {
      setTransactions(Array.isArray(trans) ? trans : []);
      setSalesLogs(Array.isArray(logs) ? logs : []);
      setCustomers(Array.isArray(custs) ? custs : []);
      setLoading(false);
    }).catch(() => {
      toast.error('Global financial sync failed.');
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleExport = () => {
    if (transactions.length === 0) return toast.error("Ledger empty.");
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales_Transactions");
    XLSX.writeFile(wb, `Sales_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Sales ledger exported.");
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge transaction record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Record erased.");
        fetchSalesData();
      }
    } catch (e) {
      toast.error("Operation failed.");
    }
  };

  const renderStatus = (status) => {
    if (!status) return null;
    const s = status.toUpperCase();
    const isPositive = s === 'PAID' || s === 'CONFIRMED' || s === 'DELIVERED';
    const isWarning = s === 'PENDING' || s === 'DUE' || s === 'DRAFT';
    
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

  const orders = transactions.filter(t => t.type === 'ORDER');
  const invoices = transactions.filter(t => t.type === 'INVOICE');
  const payments = transactions.filter(t => t.type === 'PAYMENT');

  const filteredOrders = orders.filter(o => (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (o.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredInvoices = invoices.filter(i => (i.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (i.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPayments = payments.filter(p => (p.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.transactionId || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDispatches = salesLogs.filter(l => (l.unitName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.salesPersonName || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const currentData = activeTab === 'orders' ? filteredOrders : activeTab === 'invoices' ? filteredInvoices : activeTab === 'payments' ? filteredPayments : filteredDispatches;

  const tabs = [
    { id: 'orders', label: 'Orders', icon: FileText, count: orders.length, color: 'indigo' },
    { id: 'invoices', label: 'Invoices', icon: Receipt, count: invoices.length, color: 'blue' },
    { id: 'payments', label: 'Payments', icon: Wallet, count: payments.length, color: 'emerald' },
    { id: 'dispatches', label: 'Dispatches', icon: Smartphone, count: salesLogs.length, color: 'orange' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/10">
            <TrendingUp size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Hub</h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1 uppercase tracking-widest text-[10px]">
              <ShieldCheck size={14} className="text-emerald-500" />
              Unified Financial Intelligence System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex gap-1 mr-2 shadow-sm">
              <button 
                onClick={() => setView('list')} 
                className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setView('grid')} 
                className={`p-2.5 rounded-xl transition-all ${view === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <LayoutGrid size={20} />
              </button>
           </div>
           <button onClick={fetchSalesData} className="bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 p-3.5 rounded-2xl transition-all shadow-sm">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
           <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black shadow-sm hover:bg-slate-50 flex items-center gap-2 text-[11px] uppercase tracking-widest transition-all">
             <Download size={20} /> EXPORT
           </button>
           <button 
             onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
             className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest transition-all active:scale-95"
           >
             <Plus size={20} /> INITIATE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: `₹${transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}`, icon: ArrowUpRight, color: 'indigo' },
          { label: 'Open Invoices', value: invoices.length, icon: Clock, color: 'amber' },
          { label: 'Settled', value: payments.length, icon: CheckCircle2, color: 'emerald' },
          { label: 'Field Logs', value: salesLogs.length, icon: History, color: 'blue' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
            <div className={`w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform`}>
              <s.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[650px]">
        <div className="px-8 pt-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-end gap-6 bg-slate-50/20">
          <div className="flex gap-1 overflow-x-auto custom-scrollbar w-full lg:w-auto">
            {tabs.map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)} 
                 className={`group flex items-center gap-3 pb-6 px-4 border-b-[3px] font-black text-[11px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                   activeTab === tab.id ? `border-indigo-600 text-indigo-700` : 'border-transparent text-slate-400 hover:text-slate-600'
                 }`}
               >
                 <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-500'} />
                 {tab.label} 
                 <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === tab.id ? `bg-indigo-100 text-indigo-700` : 'bg-slate-100 text-slate-400'}`}>
                   {tab.count}
                 </span>
               </button>
            ))}
          </div>

          <div className="pb-6 relative w-full lg:max-w-xs group">
             <Search className="absolute left-4 top-[14px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
             <input 
              type="text" 
              placeholder="Search ID or Client..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-[13px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all" 
             />
          </div>
        </div>

        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40"><RefreshCw className="animate-spin text-indigo-600" size={64} /></div>
         ) : currentData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                   <Receipt size={64} strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No footprints found</h2>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed uppercase text-[10px] tracking-widest">Financial ledger partition empty.</p>
            </div>
         ) : view === 'list' ? (
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left whitespace-nowrap">
                  <thead>
                     <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-50">
                        <th className="px-10 py-6">Identity & Reference</th>
                        <th className="px-10 py-6">Customer / Client</th>
                        <th className="px-10 py-6 text-right">Value Basis</th>
                        <th className="px-10 py-6 text-center">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {currentData.map(item => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-all group">
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {activeTab === 'dispatches' ? <Smartphone size={18} /> : <Receipt size={18} />}
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{item.transactionId || 'DISPATCH_LOG'}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(item.date).toLocaleDateString('en-GB')}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <p className="font-black text-slate-700">{item.customerName || 'Field Operation'}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.salesmanName || item.salesPersonName || 'System'}</p>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <p className={`font-black text-lg tracking-tight ${activeTab === 'payments' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                 {activeTab === 'payments' ? '+' : ''} ₹{(item.amount || item.totalAmount || 0).toLocaleString()}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Management Base</p>
                           </td>
                           <td className="px-10 py-7 text-center">
                              {renderStatus(item.orderStatus || item.invoiceStatus || 'COMPLETED')}
                           </td>
                           <td className="px-10 py-7 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                 <button onClick={() => setPrintData(item)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Print Document"><Printer size={18} /></button>
                                 <button onClick={() => openEdit(item)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                 <button onClick={() => handleDelete(item._id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-10 flex-1 bg-slate-50/20">
               {currentData.map(item => (
                  <div key={item._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col">
                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleDelete(item._id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                     </div>
                     <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-2xl mb-8 group-hover:scale-110 transition-transform ring-4 ring-indigo-50">
                        {activeTab === 'dispatches' ? <Smartphone size={32} /> : <Receipt size={32} />}
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">{item.transactionId || 'LOG-ID'}</h3>
                     <p className="text-sm font-bold text-slate-400 mb-6 truncate">{item.customerName || 'Field Audit'}</p>
                     
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
        onSave={fetchSalesData} 
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

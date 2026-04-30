import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  X, 
  PackageOpen, 
  LayoutGrid, 
  DollarSign, 
  Trash2, 
  Edit, 
  ArrowUpRight, 
  ArrowDownRight, 
  Box, 
  RefreshCw, 
  ClipboardList, 
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Boxes,
  Warehouse,
  Layers,
  ShieldCheck,
  ChevronRight,
  Archive,
  Download,
  List,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';
import * as XLSX from 'xlsx';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('UNIT'); 
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, warehouseRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/warehouses')
      ]);
      const prods = await prodRes.json();
      const whs = await warehouseRes.json();
      setProducts(Array.isArray(prods) ? prods : []);
      setWarehouses(Array.isArray(whs) ? whs : []);
      setLoading(false);
    } catch (err) {
      toast.error('Global inventory sync failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    if (products.length === 0) return toast.error("Inventory empty.");
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Global stock ledger exported.");
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleResetToZero = (id, name) => {
    if (!id) return;
    if (!window.confirm(`Are you sure you want to flag [${name}] as Depleted?`)) return;
    
    fetch(`http://localhost:5000/api/products/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 0, status: 'OUT_OF_STOCK' })
    })
      .then(res => {
        if(res.ok) {
           toast.success(`[${name}] status updated to Out of Stock.`);
           fetchData();
        } else toast.error('Failed to update status.');
      });
  };

  const handleInlineStockUpdate = (item, amount) => {
    if (!item || !item._id) return;
    const qtyNum = Number(item.quantity) || 0;
    const newQty = Math.max(0, qtyNum + amount);
    
    setProducts(prev => (prev || []).map(p => p._id === item._id ? { ...p, quantity: newQty, status: newQty === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK' } : p));

    fetch(`http://localhost:5000/api/products/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty, status: newQty === 0 ? 'OUT_OF_STOCK' : 'IN_STOCK' })
    }).then(res => {
      if(!res.ok) {
        toast.error('Sync Error. Reverting changes.');
        fetchData();
      } else {
        const logData = item.itemType === 'UNIT' ? {
           productId: item._id, unitName: item.name, salesPersonName: 'Terminal Sync',
           action: amount < 0 ? 'OUT_FOR_DELIVERY' : 'RETURNED', quantity: Math.abs(amount)
        } : {
           productId: item._id, partName: item.name, technicianName: 'Admin Adjustment',
           action: amount < 0 ? 'ISSUED' : 'RETURNED', quantity: Math.abs(amount)
        };

        const endpoint = item.itemType === 'UNIT' ? 'saleslogs' : 'partlogs';
        fetch(`http://localhost:5000/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        
        toast.success(`Inventory adjusted: ${item.name}`);
      }
    });
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredItems = safeProducts.filter(p => {
    const isCorrectType = p?.itemType === activeTab;
    const nameMatch = (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const skuMatch = (p?.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const warehouseMatch = selectedWarehouse === 'ALL' || p?.warehouseId === selectedWarehouse;
    return isCorrectType && (nameMatch || skuMatch) && warehouseMatch;
  });

  const stats = {
    total: filteredItems.length,
    lowStock: filteredItems.filter(p => p.quantity > 0 && p.quantity < 5).length,
    outOfStock: filteredItems.filter(p => p.quantity === 0).length,
    totalValue: filteredItems.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-xl ring-4 ring-slate-900/5">
             <Archive size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Hub</h1>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" />
              Multi-node enterprise synchronization active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
          <button onClick={fetchData} className="bg-white border border-slate-200 text-slate-400 hover:text-slate-900 p-3.5 rounded-2xl shadow-sm transition-all active:rotate-180 duration-500">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black shadow-sm hover:bg-slate-50 flex items-center gap-2 text-[11px] uppercase tracking-widest transition-all active:scale-95">
            <Download size={20} /> EXPORT
          </button>
          <button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest active:scale-95">
            <Plus size={20} /> ADD RESOURCE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tracked', value: stats.total, icon: Boxes, color: 'indigo' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'amber' },
          { label: 'Depleted', value: stats.outOfStock, icon: X, color: 'rose' },
          { label: 'Global Valuation', value: `₹${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: 'emerald' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-indigo-100 transition-colors group">
            <div className={`w-14 h-14 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform`}>
              <s.icon size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[650px] flex flex-col">
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-full lg:w-auto shadow-inner">
            <button 
              onClick={() => setActiveTab('UNIT')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'UNIT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Whole Units
            </button>
            <button 
              onClick={() => setActiveTab('SPARE')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SPARE' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Service Spares
            </button>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64 group">
               <Warehouse className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <select 
                 value={selectedWarehouse}
                 onChange={(e) => setSelectedWarehouse(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-black appearance-none outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
               >
                  <option value="ALL">All Warehouses</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
               </select>
            </div>
            <div className="relative flex-[2] lg:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={`Search in ${activeTab === 'UNIT' ? 'Products' : 'Spares'}...`} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40"><RefreshCw className="animate-spin text-indigo-600" size={64} /></div>
         ) : filteredItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                   <PackageOpen size={64} strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No enterprise resources located</h2>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed uppercase text-[10px] tracking-widest">Database partition empty for the selected criteria.</p>
                <button onClick={() => setIsModalOpen(true)} className="border-2 border-slate-900 text-slate-900 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Initialize SKU Node</button>
            </div>
         ) : view === 'list' ? (
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left whitespace-nowrap">
                  <thead>
                     <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-50">
                        <th className="px-10 py-6">Resource Information</th>
                        <th className="px-10 py-6">Warehouse Node</th>
                        <th className="px-10 py-6 text-center">Physical Stock</th>
                        <th className="px-10 py-6 text-center">Batch Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredItems.map(item => (
                        <tr key={item?._id} className="hover:bg-slate-50/50 transition-all group border-b border-transparent hover:border-slate-100">
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-5">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:rotate-6 ${activeTab === 'UNIT' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                                    {activeTab === 'UNIT' ? <Box size={24} /> : <Wrench size={24} />}
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{item?.name || 'Unlabeled resource'}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded border border-slate-200">SKU: {item?.serialNumber || 'N/A'}</span>
                                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">₹{item?.price?.toLocaleString()}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-2">
                                 <Warehouse size={14} className="text-slate-400" />
                                 <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                    {warehouses.find(w => w._id === item.warehouseId)?.name || 'Central Hub'}
                                 </span>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <div className="flex items-center justify-center">
                                 <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white ring-4 ring-transparent hover:ring-slate-100 transition-all">
                                    <button onClick={() => handleInlineStockUpdate(item, -1)} className="px-4 py-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-black border-r border-slate-100 transition-all">-</button>
                                    <div className="px-6 py-2.5 bg-slate-50/30 font-black text-slate-900 min-w-[50px] text-center text-sm">{item?.quantity || 0}</div>
                                    <button onClick={() => handleInlineStockUpdate(item, 1)} className="px-4 py-2.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 font-black border-l border-slate-100 transition-all">+</button>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7 text-center">
                              <div className="flex flex-col items-center gap-2">
                                 <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${item.quantity > 5 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {item.quantity > 5 ? 'OPTIMAL' : 'CRITICAL'}
                                 </div>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Telemetry</p>
                              </div>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                 <button onClick={() => openEdit(item)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                 <button onClick={() => handleResetToZero(item._id, item.name)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-10 flex-1 bg-slate-50/20">
               {filteredItems.map(item => (
                  <div key={item._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col">
                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleResetToZero(item._id, item.name)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                     </div>
                     <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl mb-8 group-hover:scale-110 transition-transform ring-4 ring-slate-50 ${activeTab === 'UNIT' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                        {activeTab === 'UNIT' ? <Box size={32} /> : <Wrench size={32} />}
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                     <div className="flex items-center gap-2 mb-8">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{warehouses.find(w => w._id === item.warehouseId)?.name || 'Central'}</span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">SKU: {item.serialNumber}</span>
                     </div>
                     
                     <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Vol.</p>
                           <p className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
                              {item.quantity || 0}
                              <span className="text-slate-300 text-xs font-bold">UNITS</span>
                           </p>
                        </div>
                        <button onClick={() => openEdit(item)} className="w-14 h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-black">
                           <Edit2 size={24} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}

        <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Inventory Access Node</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
             <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Cloud Sync Active</div>
             <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"/> AES-256 Encrypted</div>
          </div>
        </div>
      </div>

      <DataModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }} 
        type="Products" 
        onSave={fetchData} 
        initialData={selectedItem}
      />
    </div>
  );
}

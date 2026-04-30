import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Box, 
  Edit, 
  RefreshCw, 
  Wrench, 
  X,
  Download,
  LayoutGrid,
  List,
  Edit2,
  Package,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';
import * as XLSX from 'xlsx';

export default function Products() {
  const [activeTab, setActiveTab] = useState('UNIT'); // 'UNIT' or 'SPARE'
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeBrandFilter, setActiveBrandFilter] = useState('All');

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        toast.error('Failed to load global catalog.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleExport = () => {
    if (products.length === 0) return toast.error("Catalog empty.");
    const ws = XLSX.utils.json_to_sheet(products);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, `Product_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Global catalog exported.");
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Purge SKU [${name}]?`)) return;
    fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' })
      .then(res => {
        if(res.ok) {
           toast.success(`[${name}] removed.`);
           fetchProducts();
        }
      });
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const isCorrectType = p.itemType === activeTab;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = activeBrandFilter === 'All' || p.brand === activeBrandFilter;
    return isCorrectType && matchesSearch && matchesBrand;
  });

  const uniqueBrands = ['All', ...new Set(products.filter(p => p.itemType === activeTab).map(p => p.brand))];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 fade-in pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-xl">
               <Package size={24} />
            </div>
            Catalog Master
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2 uppercase tracking-widest text-[10px]">
             Enterprise SKU Governance & Resource Management
          </p>
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
          <button onClick={fetchProducts} className="bg-white border text-slate-400 hover:text-slate-900 border-slate-200 p-3.5 rounded-2xl shadow-sm transition-all active:rotate-180 duration-500">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all">
            <Download size={20} /> EXPORT
          </button>
          <button 
            onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> ADD SKU
          </button>
        </div>
      </div>

       <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        <button 
          onClick={() => setActiveTab('UNIT')}
          className={`flex items-center gap-2 pb-4 px-2 border-b-4 font-black text-xs uppercase tracking-[0.15em] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'UNIT' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400'
          }`}
        >
          Finished Whole Units
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{products.filter(p => p.itemType === 'UNIT').length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('SPARE')}
          className={`flex items-center gap-2 pb-4 px-2 border-b-4 font-black text-xs uppercase tracking-[0.15em] transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'SPARE' ? 'border-orange-600 text-orange-700' : 'border-transparent text-slate-400'
          }`}
        >
          Service Spares & Hardware
          <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{products.filter(p => p.itemType === 'SPARE').length}</span>
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col xl:flex-row gap-6 justify-between items-center">
            <div className="relative w-full max-w-[440px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={`Search in ${activeTab === 'UNIT' ? 'Units' : 'Spares'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-3xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-sm shadow-sm"
              />
            </div>
            
            <div className="flex bg-white border border-slate-200 rounded-2xl p-1.5 overflow-x-auto max-w-full shadow-sm">
               {uniqueBrands.map(b => (
                 <button key={b} onClick={() => setActiveBrandFilter(b)} className={`shrink-0 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeBrandFilter === b ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}>
                   {b}
                 </button>
               ))}
            </div>
        </div>

        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40"><RefreshCw className="animate-spin text-indigo-600" size={64} /></div>
         ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                   <Box size={64} strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No active SKUs found</h2>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed uppercase text-[10px] tracking-widest">Database partition empty for the selected criteria.</p>
                <button onClick={() => setIsModalOpen(true)} className="border-2 border-slate-900 text-slate-900 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Initialize SKU Node</button>
            </div>
         ) : view === 'list' ? (
            <div className="overflow-x-auto">
               <table className="w-full text-left whitespace-nowrap border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                        <th className="px-10 py-6">Product Info & SKU Identifier</th>
                        <th className="px-10 py-6">Brand / Source</th>
                        <th className="px-10 py-6 text-right">Price Valuation</th>
                        <th className="px-10 py-6 text-center">Status</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredProducts.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-5">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 overflow-hidden ${activeTab === 'UNIT' ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-orange-50 border-orange-100 text-orange-500'}`}>
                                    {activeTab === 'UNIT' ? <Box size={24} /> : <Wrench size={24} />}
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</p>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 block">SKU: {item.serialNumber}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <p className="font-black text-slate-700 text-sm">{item.brand}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{item.category}</p>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <div className="flex flex-col items-end">
                                 <p className="font-black text-xl text-slate-900 tracking-tighter">
                                    <span className="text-emerald-500 text-xs mr-1">₹</span>
                                    {Number(item.price || 0).toLocaleString()}
                                 </p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Management Basis</p>
                              </div>
                           </td>
                           <td className="px-10 py-7 text-center">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">In Stock</span>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                 <button onClick={() => openEdit(item)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                 <button onClick={() => handleDelete(item._id, item.name)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-10 flex-1 bg-slate-50/20">
               {filteredProducts.map(item => (
                  <div key={item._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col">
                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleDelete(item._id, item.name)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                     </div>
                     <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl mb-8 group-hover:scale-110 transition-transform ring-4 ring-slate-50 ${activeTab === 'UNIT' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                        {activeTab === 'UNIT' ? <Box size={32} /> : <Wrench size={32} />}
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                     <div className="flex items-center gap-2 mb-8">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.brand}</span>
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">SKU: {item.serialNumber}</span>
                     </div>
                     
                     <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mkt. Value</p>
                           <p className="text-2xl font-black text-slate-900 flex items-center gap-1 tracking-tighter">
                              <span className="text-emerald-500 text-sm">₹</span>
                              {Number(item.price || 0).toLocaleString()}
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
      </div>

      <DataModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }} 
        type="Products" 
        onSave={fetchProducts} 
        initialData={selectedItem}
      />
    </div>
  );
}

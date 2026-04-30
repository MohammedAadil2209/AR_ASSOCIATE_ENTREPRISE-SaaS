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
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Box,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';
import * as XLSX from 'xlsx';

export default function GenericModule({ title, subtitle, icon: Icon, endpoint }) {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/${endpoint}`)
      .then(res => res.json())
      .then(resData => {
        setData(Array.isArray(resData) ? resData : []);
        setLoading(false);
      })
      .catch(err => {
        toast.error(`Sync failure for ${title}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleExport = () => {
    if (data.length === 0) return toast.error("Database partition empty.");
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title}_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`${title} ledger exported.`);
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Purge [${name}] from system?`)) return;
    fetch(`http://localhost:5000/api/${endpoint}/${id}`, { method: 'DELETE' })
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

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-20 max-w-[1600px] mx-auto">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-xl ring-4 ring-slate-900/5">
             <Icon size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{title} Hub</h1>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2 text-[10px] uppercase tracking-widest">
              {subtitle}
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
          <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black shadow-sm hover:bg-slate-50 flex items-center gap-2 text-[11px] uppercase tracking-widest transition-all">
            <Download size={20} /> EXPORT
          </button>
          <button 
            onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 text-[11px] uppercase tracking-widest"
          >
            <Plus size={20} /> ADD RECORD
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Toolbar */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div className="relative w-full max-w-[440px] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder={`Search ${title}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-3xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Nodes: {filteredData.length}</span>
            </div>
        </div>

        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40"><RefreshCw className="animate-spin text-indigo-600" size={64} /></div>
         ) : filteredData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-40 text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                   <Icon size={64} strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No active records located</h2>
                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed uppercase text-[10px] tracking-widest">Database partition empty for {title}.</p>
                <button onClick={() => setIsModalOpen(true)} className="border-2 border-slate-900 text-slate-900 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Initialize Partition</button>
            </div>
         ) : view === 'list' ? (
            <div className="overflow-x-auto">
               <table className="w-full text-left whitespace-nowrap">
                  <thead>
                     <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-50">
                        <th className="px-10 py-6">Identity & Info</th>
                        <th className="px-10 py-6">Communication</th>
                        <th className="px-10 py-6">Ref / ID</th>
                        <th className="px-10 py-6 text-right">Value Basis</th>
                        <th className="px-10 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredData.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 transition-all group">
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Icon size={24} />
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 text-base leading-tight">{item.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                      <MapPin size={10} /> {item.address || 'Global Node'}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <Phone size={12} className="text-slate-300" /> {item.phone || 'N/A'}
                                 </div>
                                 <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                                    <Mail size={12} className="text-slate-300" /> {item.email || 'N/A'}
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7">
                              <span className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {item.serialNumber || item.transactionId || item._id.slice(-8).toUpperCase()}
                              </span>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <p className="font-black text-lg text-slate-900 tracking-tight">
                                <span className="text-emerald-500 text-xs mr-1">₹</span>
                                {Number(item.price || item.amount || 0).toLocaleString()}
                              </p>
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
               {filteredData.map(item => (
                  <div key={item._id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden flex flex-col">
                     <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleDelete(item._id, item.name)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                     </div>
                     <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center font-black text-2xl mb-8 group-hover:scale-110 transition-transform ring-4 ring-white shadow-sm">
                        <Icon size={32} />
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{item.name}</h3>
                     <div className="flex flex-col gap-2 mb-8">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                           <Phone size={12} /> {item.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                           <Mail size={12} /> {item.email || 'N/A'}
                        </div>
                     </div>
                     
                     <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mkt. Value</p>
                           <p className="text-2xl font-black text-slate-900 flex items-center gap-1 tracking-tighter">
                              <span className="text-emerald-500 text-sm">₹</span>
                              {Number(item.price || item.amount || 0).toLocaleString()}
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
        type={title} 
        onSave={fetchData} 
        initialData={selectedItem}
      />
    </div>
  );
}

import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { toast } from 'sonner';
import { ShoppingCart, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SalesForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    serialNumber: '',
    customerName: '',
    phone: '',
    warranty: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assuming your backend route is set up at POST /api/sales
      const res = await axios.post(`${API_URL}/api/sales`, formData);

      // Show success alert/toast
      toast.success("Sale added successfully ✅");

      // Reset form
      setFormData({
        product: '',
        serialNumber: '',
        customerName: '',
        phone: '',
        warranty: ''
      });
    } catch (err) {
      console.error('Submission Error:', err);
      toast.error("Error adding sale ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
          <ShoppingCart size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Record New Sale</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Database Integration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Name</label>
            <input 
              type="text" 
              name="product"
              required
              value={formData.product} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
              placeholder="e.g. RO Purifier X1" 
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Serial Number</label>
            <input 
              type="text" 
              name="serialNumber"
              required
              value={formData.serialNumber} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
              placeholder="SN-100200" 
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Warranty Duration</label>
            <input 
              type="text" 
              name="warranty"
              required
              value={formData.warranty} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
              placeholder="12 Months" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Customer Name</label>
            <input 
              type="text" 
              name="customerName"
              required
              value={formData.customerName} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
              placeholder="Full Name" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              required
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm" 
              placeholder="+91 00000 00000" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[20px] shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
             <><RefreshCw className="animate-spin" size={18} /> Processing...</>
          ) : (
             <><CheckCircle2 size={18} /> Complete Sale</>
          )}
        </button>
      </form>
    </div>
  );
}

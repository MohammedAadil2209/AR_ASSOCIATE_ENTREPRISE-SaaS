import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  Users, 
  DollarSign, 
  Wrench, 
  RefreshCw, 
  Activity, 
  Smartphone, 
  Truck, 
  CheckCircle2,
  Box,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import DataModal from '../components/DataModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Products');
  const [fieldLogs, setFieldLogs] = useState([]);
  
  const [stats, setStats] = useState({
     revenue: 0,
     activeServices: 0,
     productsCount: 0,
     customersCount: 0,
     lowStockCount: 0,
     toBePacked: 2,
     toBeShipped: 1,
     toBeDelivered: 1,
     toBeInvoiced: 4,
     recentServices: []
  });

  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [transRes, srvRes, prodRes, custRes, partRes, salesLogRes] = await Promise.all([
        fetch('http://localhost:5000/api/transactions'),
        fetch('http://localhost:5000/api/services'),
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/customers'),
        fetch('http://localhost:5000/api/partlogs?limit=5'),
        fetch('http://localhost:5000/api/saleslogs?limit=5')
      ]);

      const transactionsRaw = await transRes.json();
      const servicesRaw = await srvRes.json();
      const productsRaw = await prodRes.json();
      const customersRaw = await custRes.json();
      const partLogsRaw = await partRes.json();
      const salesLogsRaw = await salesLogRes.json();

      const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [];
      const services = Array.isArray(servicesRaw) ? servicesRaw : [];
      const products = Array.isArray(productsRaw) ? productsRaw : [];
      const customers = Array.isArray(customersRaw) ? customersRaw : [];
      const partLogs = Array.isArray(partLogsRaw) ? partLogsRaw : [];
      const salesLogs = Array.isArray(salesLogsRaw) ? salesLogsRaw : [];

      const combined = [...partLogs, ...salesLogs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      setFieldLogs(combined);

      const totalRevenue = transactions
        .filter(t => t.type === 'PAYMENT')
        .reduce((sum, curr) => sum + (curr.amount || 0), 0);

      const activeSrvs = services.filter(s => s.status !== 'COMPLETED').length;
      const lowStock = products.filter(p => (p.quantity || 0) <= 5).length;
      const totalStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

      const salesOrders = transactions.filter(t => t.type === 'ORDER');
      const invoices = transactions.filter(t => t.type === 'INVOICE');

      setStats({
         revenue: totalRevenue,
         activeServices: activeSrvs,
         productsCount: products.length,
         totalStock: totalStock,
         lowStockCount: lowStock,
         toBePacked: salesOrders.filter(t => t.orderStatus === 'PENDING').length,
         toBeShipped: salesOrders.filter(t => t.orderStatus === 'CONFIRMED').length,
         toBeDelivered: salesOrders.filter(t => t.orderStatus === 'SHIPPED').length,
         toBeInvoiced: Math.max(0, salesOrders.length - invoices.length),
         recentServices: services.slice(0, 5)
      });

      const baseTick = Math.floor(totalRevenue / 7) || 4000;
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setChartData(days.map((day, i) => ({
        name: day,
        revenue: i < new Date().getDay() ? (baseTick * (0.8 + Math.random() * 0.5)) : (totalRevenue > 0 && i === new Date().getDay() ? totalRevenue / 2 : 0)
      })));

      setLoading(false);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      toast.error('Cloud Sync Stalled');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 fade-in text-gray-900 pb-20">
      
      {/* Dynamic Header */}
      <div className="flex items-end justify-between bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
             <Layers size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Enterprise Console</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-[0.3em] text-[10px]">Unified Inventory Management Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Node Online</span>
               </div>
               <button onClick={fetchDashboardData} className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
               </button>
            </div>
            <button 
              onClick={() => { setModalType('Products'); setIsModalOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
                <Plus size={24} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column: Activity & Inventory Summary */}
        <div className="xl:col-span-2 space-y-10">
          
          {/* Sales Activity (Zoho Style) */}
          <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">Sales Activity</h2>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Pipeline</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'To be Packed', value: stats.toBePacked, color: 'indigo', icon: Box, link: '/inventory' },
                    { label: 'To be Shipped', value: stats.toBeShipped, color: 'blue', icon: Truck, link: '/inventory' },
                    { label: 'To be Delivered', value: stats.toBeDelivered, color: 'emerald', icon: CheckCircle2, link: '/sales' },
                    { label: 'To be Invoiced', value: stats.toBeInvoiced, color: 'orange', icon: DollarSign, link: '/invoices' }
                ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate(item.link)}
                      className="group flex flex-col items-center p-6 rounded-3xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all cursor-pointer"
                    >
                        <div className={`text-${item.color}-600 mb-2 font-black text-4xl group-hover:scale-110 transition-transform`}>{item.value}</div>
                        <div className="flex items-center gap-2">
                            <item.icon size={12} className="text-gray-400" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Service Operations (Zoho Style) */}
          <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">Service Operations</h2>
                <button onClick={() => navigate('/service')} className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-colors flex items-center gap-2">
                    <Plus size={14} /> Allocate Work
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Works', value: stats.activeServices, color: 'orange', icon: Clock, link: '/service' },
                    { label: 'In Progress', value: stats.recentServices.filter(s=>s.status==='IN_PROGRESS').length, color: 'blue', icon: Wrench, link: '/service' },
                    { label: 'Completed', value: stats.recentServices.filter(s=>s.status==='COMPLETED').length, color: 'emerald', icon: CheckCircle2, link: '/service' },
                    { label: 'Delayed', value: stats.recentServices.filter(s=>s.status==='DELAYED').length, color: 'rose', icon: AlertTriangle, link: '/service' }
                ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigate(item.link)}
                      className="group flex flex-col items-center p-6 rounded-3xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all cursor-pointer"
                    >
                        <div className={`text-${item.color}-600 mb-2 font-black text-4xl group-hover:scale-110 transition-transform`}>{item.value}</div>
                        <div className="flex items-center gap-2">
                            <item.icon size={12} className="text-gray-400" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Inventory Summary (Zoho Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div onClick={() => navigate('/inventory')} className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100 cursor-pointer hover:border-indigo-100 transition-all">
                <h2 className="text-2xl font-black tracking-tight mb-8">Inventory Summary</h2>
                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-50">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quantity in Hand</p>
                        <p className="text-2xl font-black text-slate-900">{stats.totalStock}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quantity to be Received</p>
                        <p className="text-2xl font-black text-slate-900">24</p>
                    </div>
                </div>
              </div>
              <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black tracking-tight">Product Details</h2>
                    <AlertTriangle size={24} className="text-rose-500" />
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-gray-50">
                        <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Low Stock Items</p>
                        <p className="text-2xl font-black text-rose-600">{stats.lowStockCount}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Active Items</p>
                        <p className="text-2xl font-black text-emerald-600">{stats.productsCount}</p>
                    </div>
                </div>
              </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black tracking-tight">Financial Velocity</h2>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Sales</button>
                    <button className="px-4 py-1.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest">Purchases</button>
                </div>
            </div>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: '900'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: '900'}} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={6} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Field Activity & Top Items */}
        <div className="space-y-10">
            {/* Top Items Widget */}
            <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100">
                <h2 className="text-2xl font-black tracking-tight mb-8">Top Selling Items</h2>
                <div className="space-y-8">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm">SKU-00{i+1}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Enterprise Asset {i+1}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-indigo-600">24 sold</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => navigate('/products')}
                    className="w-full mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                >
                    View All Items <ChevronRight size={14} />
                </button>
            </div>

            {/* Field Activity Feed */}
            <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-slate-900/20 text-white">
                <div className="flex items-center gap-3 mb-8">
                   <Activity size={20} className="text-indigo-400" />
                   <h2 className="text-2xl font-black tracking-tight">Cloud Feed</h2>
                </div>
                <div className="space-y-8">
                   {fieldLogs.length === 0 ? (
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest py-10 text-center">Syncing...</p>
                   ) : fieldLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5`}>
                             {log.unitName ? <Truck size={16} className="text-indigo-400" /> : <Wrench size={16} className="text-orange-400" />}
                         </div>
                         <div className="flex-1">
                             <p className="font-black text-sm text-slate-100">{log.unitName || log.partName}</p>
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">By {log.salesPersonName || log.technicianName}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-indigo-400">+{log.quantity}</p>
                         </div>
                      </div>
                   ))}
                </div>
            </div>
        </div>
      </div>
      <DataModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        onSave={fetchDashboardData} 
      />
    </div>
  );
}

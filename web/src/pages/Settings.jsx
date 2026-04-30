import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Lock, Bell, Shield, UserPlus, Trash2, Mail, Save, X, RefreshCw, BadgeCheck, AlertTriangle, Database, Activity, Key, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'team', 'inventory', 'security'
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Inventory Settings State
  const [invSettings, setInvSettings] = useState({
    lowStockThreshold: 5,
    autoLogOutbound: true,
    enableSerialTracking: true,
    currency: 'INR'
  });

  // New User Form State
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', role: 'SALESMAN'
  });

  const fetchTeam = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(data => {
        setTeam(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'team') fetchTeam();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(res => {
      if (res.ok) {
        toast.success(`Access granted to ${formData.name}`);
        setIsModalOpen(false);
        setFormData({ name: '', username: '', password: '', role: 'SALESMAN' });
        fetchTeam();
      } else {
        toast.error('Identity conflict detected.');
      }
    });
  };

  const deleteMember = (id) => {
    if (!window.confirm("Terminate this user's cloud access?")) return;
    fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' })
      .then(() => fetchTeam());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-900 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-black/20 border border-white/10">
                 <SettingsIcon size={32} />
              </div>
              <div>
                 <h1 className="text-4xl font-black tracking-tight">Control Center</h1>
                 <p className="text-gray-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Cloud Infrastructure & Team Operations</p>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <span className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
              <Activity size={12} /> System Online
           </span>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Sidebar Nav */}
        <div className="w-72 space-y-3 shrink-0">
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 hover:shadow-lg'}`}>
            <Lock size={18} /> Personal Identity
          </button>
          <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-4 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 hover:shadow-lg'}`}>
            <Users size={18} /> Team Governance
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 hover:shadow-lg'}`}>
            <Database size={18} /> Stock Parameters
          </button>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-4 px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.1em] transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 hover:shadow-lg'}`}>
            <Shield size={18} /> Cloud Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden p-12 min-h-[600px]">
          {activeTab === 'profile' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-10 pb-10 border-b border-gray-50">
                   <div className="w-28 h-28 rounded-[40px] bg-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-600/30 border-8 border-indigo-50">
                      {user?.name?.charAt(0)}
                   </div>
                   <div>
                      <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{user?.name}</h2>
                      <div className="flex items-center gap-3 mt-4">
                         <span className="px-3 py-1 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{user?.role}</span>
                         <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Operator ID: @{user?.username}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                   <div className="p-8 bg-gray-50 rounded-[32px] border border-transparent hover:border-gray-200 transition-all border-dashed">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Account Persistence</p>
                      <p className="font-black text-gray-900 mb-1">Authenticated via In-Memory Secure Layer</p>
                      <p className="text-xs text-gray-400 font-bold">Your session expires in 24 hours of inactivity.</p>
                   </div>
                   <div className="p-8 bg-indigo-50/20 rounded-[32px] border border-indigo-100/50">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Cloud Footprint</p>
                      <p className="font-black text-gray-900 mb-1 tracking-tight">Active Terminal Node: 127.0.0.1</p>
                      <p className="text-xs text-indigo-600 font-bold italic underline">Global Activity Log Enabled</p>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Personnel Directory</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase mt-2 tracking-[0.2em]">Manage Cloud-Identity Tokens</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer">
                  <UserPlus size={18} /> Provision Access
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-10">
                {loading ? (
                   <div className="py-20 text-center"><RefreshCw size={32} className="animate-spin mx-auto text-gray-200" /></div>
                ) : team.map(member => (
                   <div key={member._id} className="group flex items-center justify-between p-7 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-[32px] transition-all duration-500 hover:shadow-xl hover:shadow-gray-100/50">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black text-indigo-600 shadow-sm uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                            {member.name.charAt(0)}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-gray-900 text-lg tracking-tight">{member.name}</h3>
                                {member.role === 'ADMIN' && <BadgeCheck size={16} className="text-indigo-600" />}
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">ID: @{member.username} • Clearance: {member.role}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            member.role === 'SALESMAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            member.role === 'TECHNICIAN' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                         }`}>
                           {member.role}
                         </span>
                         {member.username !== user.username && (
                            <button onClick={() => deleteMember(member._id)} className="p-3 text-gray-300 hover:text-rose-600 transition-colors bg-white rounded-xl shadow-sm border border-gray-100">
                               <Trash2 size={18} />
                            </button>
                         )}
                      </div>
                   </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h2 className="text-3xl font-black text-gray-900 tracking-tight">Stock Parameters</h2>
                   <p className="text-gray-400 font-bold text-xs uppercase mt-2 tracking-[0.2em]">Automated Inventory Governance</p>
                </div>

                <div className="space-y-10">
                   <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                            <AlertTriangle size={22} />
                         </div>
                         <div>
                            <p className="font-black text-gray-900">Low Stock Notification Threshold</p>
                            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Alert system master when units fall below this value</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <input type="number" value={invSettings.lowStockThreshold} onChange={(e) => setInvSettings({...invSettings, lowStockThreshold: e.target.value})} className="w-24 bg-white border border-gray-200 rounded-xl px-4 py-3 font-black text-center text-gray-900 focus:border-indigo-600 outline-none" />
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Units</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border border-gray-100">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <Activity size={22} />
                         </div>
                         <div>
                            <p className="font-black text-gray-900">Auto-Log Outbound Movements</p>
                            <p className="text-xs text-gray-400 font-bold uppercase mt-1">Automatically create telemetry logs for audit trails</p>
                         </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={invSettings.autoLogOutbound} onChange={() => setInvSettings({...invSettings, autoLogOutbound: !invSettings.autoLogOutbound})} className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                   </div>

                   <div className="flex items-center justify-between p-8 bg-indigo-50/20 rounded-[32px] border border-indigo-100 border-dashed">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <Database size={22} />
                         </div>
                         <div>
                            <p className="font-black text-indigo-900">Cloud Backup Configuration</p>
                            <p className="text-xs text-indigo-600 font-bold uppercase mt-1">Interval: Every 24 hours of cluster activity</p>
                         </div>
                      </div>
                      <button className="px-6 py-3 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">Trigger Manual Sync</button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                   <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cloud Security</h2>
                   <p className="text-gray-400 font-bold text-xs uppercase mt-2 tracking-[0.2em]">Terminal Guard & Encryption Shields</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                   <div className="p-10 bg-gray-50/50 rounded-[40px] border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 border border-indigo-50 shadow-xl shadow-indigo-600/5">
                            <Fingerprint size={32} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-400 font-bold mt-1">Add an extra layer of biometric terminal shielding.</p>
                         </div>
                      </div>
                      <button className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-600 font-black rounded-2xl text-[10px] uppercase tracking-widest cursor-not-allowed">Enable TFA</button>
                   </div>

                   <div className="p-10 bg-gray-50/50 rounded-[40px] border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-500 border border-rose-50 shadow-xl shadow-rose-600/5">
                            <Key size={32} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight">Cryptographic Session Lock</h4>
                            <p className="text-sm text-gray-400 font-bold mt-1">Automatically terminate idle console connections.</p>
                         </div>
                      </div>
                      <select className="bg-white border border-gray-200 rounded-2xl px-6 py-3 font-black text-xs text-gray-900 outline-none focus:border-indigo-600">
                         <option>After 15 Minutes</option>
                         <option>After 30 Minutes</option>
                         <option>After 1 Hour</option>
                         <option>Never (Low Security)</option>
                      </select>
                   </div>

                   <div className="p-10 bg-gray-900 rounded-[40px] shadow-2xl shadow-indigo-600/10 flex items-center justify-between text-white">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-white/10">
                            <Shield size={32} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black tracking-tight">Universal Audit Shield</h4>
                            <p className="text-sm text-white/50 font-bold mt-1 uppercase tracking-widest text-[10px]">Real-time monitoring of all staff activity is ACTIVE.</p>
                         </div>
                      </div>
                      <span className="px-5 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase">SYSTEM SECURE</span>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-12 pt-12 pb-8 flex items-center justify-between">
              <div>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">Provision Console Access</h2>
                 <p className="text-gray-400 font-bold text-xs uppercase mt-2 tracking-widest">New Operator Induction</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-100 p-3 rounded-full cursor-pointer hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="px-12 pb-12 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-inner" placeholder="Ex: Vikram Singh" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Console Username</label>
                      <input required name="username" value={formData.username} onChange={handleInputChange} className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-inner" placeholder="vikram_s" />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Key (Pass)</label>
                      <div className="relative">
                          <input required type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all shadow-inner" placeholder="••••••••" />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 cursor-pointer">
                             {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Operational Sector</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-gray-50/80 border border-gray-100 rounded-2xl px-6 py-4 font-black text-gray-900 outline-none appearance-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 shadow-inner">
                    <option value="SALESMAN">SALESMAN (REVENUE HUB)</option>
                    <option value="TECHNICIAN">TECHNICIAN (SERVICE HUB)</option>
                    <option value="STAFF">OFFICE STAFF (BACKOFFICE)</option>
                    <option value="ADMIN">ADMINISTRATOR (SYS-OPS)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-600/30 transition-all transform active:scale-95 uppercase tracking-[0.2em] text-xs">
                Log New Operator & Provision 
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

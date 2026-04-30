import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(username, password);
    
    if (result.success) {
      toast.success("Identity Verified. Syncing workspace...");
      navigate('/');
    } else {
      toast.error(result.message || "Authentication Failed. Please check your secure credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden backdrop-blur-3xl">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse delay-1000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <Logo className="w-72 h-36 mb-4" />
        <p className="mt-2 text-center text-[10px] font-black text-indigo-500/60 tracking-[0.6em] uppercase">
          Unified Enterprise Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl py-10 px-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10 sm:rounded-[32px] sm:px-12 relative overflow-hidden group">
          <form className="space-y-6 relative" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Unique Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-white/5 bg-white/5 rounded-xl text-white font-bold placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all sm:text-sm" placeholder="ID Handle" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full pl-11 pr-12 py-3.5 border border-white/5 bg-white/5 rounded-xl text-white font-bold placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all sm:text-sm" placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-xl shadow-indigo-600/20 text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition-all transform active:scale-95 disabled:opacity-50 group">
              {loading ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center gap-2">
                  Authenticate Session <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <ShieldCheck size={14} /> 256-Bit Encrypted Link
          </div>
        </div>
        
        <div className="mt-6 flex flex-col gap-2 items-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Available Roles</p>
            <div className="flex gap-4">
                <span className="text-[9px] font-black text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded">ADMIN</span>
                <span className="text-[9px] font-black text-blue-400 border border-blue-400/20 px-2 py-0.5 rounded">SALESMAN</span>
                <span className="text-[9px] font-black text-orange-400 border border-orange-400/20 px-2 py-0.5 rounded">TECHNICIAN</span>
                <span className="text-[9px] font-black text-gray-400 border border-gray-400/20 px-2 py-0.5 rounded">STAFF</span>
            </div>
        </div>
      </div>
    </div>
  );
}

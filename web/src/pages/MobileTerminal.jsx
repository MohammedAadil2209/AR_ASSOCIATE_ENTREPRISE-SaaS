import { useState, useEffect } from "react";
import {
  Home,
  Clipboard,
  Package,
  User,
  Plus,
  Search,
  Smartphone,
  Info,
  MapPin,
  Wrench,
  Truck,
  LogOut,
  ChevronRight,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../config/api";
import { toast } from "sonner";

export default function MobileTerminal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home"); // 'home', 'actions', 'inventory', 'profile'
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState([]); // Jobs for Techs, Sales for Salesmen
  const [spares, setSpares] = useState([]);

  // Modals
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionForm, setActionForm] = useState({
    itemId: "",
    itemName: "",
    quantity: 1,
    remarks: "",
    deskId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint =
        user?.role === "TECHNICIAN" ? "/api/services" : "/api/saleslogs";
      const [ctxRes, productsRes] = await Promise.all([
        api.get(endpoint),
        api.get("/api/products"),
      ]);

      setContextData(ctxRes.data);
      setSpares(
        productsRes.data.filter((p) =>
          user?.role === "TECHNICIAN"
            ? p.itemType === "SPARE"
            : p.itemType === "UNIT",
        ),
      );
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    const endpoint =
      user?.role === "TECHNICIAN" ? "/api/partlogs" : "/api/saleslogs";

    const selectedProduct = spares.find((s) => s.name === actionForm.itemName);

    const payload =
      user?.role === "TECHNICIAN"
        ? {
            productId: selectedProduct?._id,
            technicianName: user?.name,
            partName: actionForm.itemName,
            action: "ISSUED",
            quantity: actionForm.quantity,
            syncedFromMobile: true,
          }
        : {
            productId: selectedProduct?._id,
            salesPersonName: user?.name,
            unitName: actionForm.itemName,
            action: "OUT_FOR_DELIVERY",
            quantity: actionForm.quantity,
            syncedFromMobile: true,
          };

    try {
      await api.post(endpoint, payload);
      toast.success("Field Transaction Sync Complete");
      setShowActionModal(false);
      fetchData();
      setActionForm({
        itemId: "",
        itemName: "",
        quantity: 1,
        remarks: "",
        deskId: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Sync failed");
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/api/services/${taskId}`, { status });
      toast.success(`Task marked as ${status}`);
      setSelectedTask(null);
      fetchData();
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const filteredSpares = spares.filter((part) =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      {/* Top Identity Bar */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight">{user?.name}</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {user?.role} NODE
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2.5 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-6 space-y-6">
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Greeting */}
            <div>
              <h2 className="text-2xl font-black tracking-tighter">
                Field Operations Hub
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Universal Field Control Terminal
              </p>
            </div>

            {/* Primary Action Card */}
            <button
              onClick={() => setShowActionModal(true)}
              className="w-full bg-indigo-600 p-8 rounded-[32px] text-left text-white shadow-2xl shadow-indigo-600/30 active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="relative z-10 space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-4">
                  {user?.role === "TECHNICIAN" ? (
                    <Wrench size={24} />
                  ) : (
                    <Truck size={24} />
                  )}
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  {user?.role === "TECHNICIAN"
                    ? "Log Used Spares"
                    : "Log Field Dispatch"}
                </h3>
                <p className="text-xs text-white/60 font-bold uppercase tracking-widest">
                  Update Cloud Inventory Instantly
                </p>
              </div>
              <div className="absolute top-0 right-0 p-8 text-white/5 group-active:text-white/20 transition-all">
                <Plus size={120} />
              </div>
            </button>

            {/* Status List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Your Assigned Queue ({contextData.length})
                </h4>
                <button onClick={fetchData} className="p-1 text-indigo-600">
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>

              <div className="space-y-3">
                {contextData.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (user?.role === "TECHNICIAN") setSelectedTask(item);
                    }}
                    className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:bg-gray-50 transition-colors ${user?.role === "TECHNICIAN" ? "cursor-pointer hover:border-indigo-200" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-900 leading-none">
                          {item.description || item.unitName || "Job Ticket"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin size={10} className="text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {item.customerId?.address ||
                              item.action ||
                              "Field Location"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tighter">
                Cloud Catalog
              </h2>
            </div>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm outline-none focus:border-indigo-600 shadow-sm"
                placeholder="Search Materials..."
              />
            </div>
            <div className="space-y-3">
              {filteredSpares.map((part) => (
                <div
                  key={part._id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-900">
                        {part.name}
                      </p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Stock: {part.quantity} Units Available
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 py-10">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-indigo-600 rounded-[32px] mx-auto flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-600/30">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {user?.name}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {user?.role} ACCESS ENABLED
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-gray-400" />
                  <span className="text-sm font-black text-gray-700">
                    Device ID Authorized
                  </span>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-gray-400" />
                  <span className="text-sm font-black text-gray-700">
                    App Version 2.0.4 Premium
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hub Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button
          onClick={() => setActiveTab("home")}
          className={`p-3 rounded-2xl transition-all ${activeTab === "home" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-gray-400 hover:text-gray-900"}`}
        >
          <Home size={22} />
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`p-3 rounded-2xl transition-all ${activeTab === "inventory" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-gray-400 hover:text-gray-900"}`}
        >
          <Package size={22} />
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`p-3 rounded-2xl transition-all ${activeTab === "profile" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-gray-400 hover:text-gray-900"}`}
        >
          <User size={22} />
        </button>
      </div>

      {/* Field Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white w-full rounded-t-[40px] p-10 pb-12 animate-in slide-in-from-bottom-full duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight">
                  {user?.role === "TECHNICIAN"
                    ? "Part Consumption"
                    : "Unit Dispatch"}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Instant Cloud Sync Logging
                </p>
              </div>
              <button
                onClick={() => setShowActionModal(false)}
                className="bg-gray-100 p-2.5 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Select{" "}
                  {user?.role === "TECHNICIAN"
                    ? "Spare Part"
                    : "Inventory Unit"}
                </label>
                <select
                  required
                  value={actionForm.itemName}
                  onChange={(e) =>
                    setActionForm({ ...actionForm, itemName: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-black text-gray-800 outline-none focus:ring-2 focus:ring-indigo-600/10"
                >
                  <option value="">-- Choose From Catalog --</option>
                  {spares.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name} ({s.quantity} Left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Quantity Consumed
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setActionForm({
                        ...actionForm,
                        quantity: Math.max(1, actionForm.quantity - 1),
                      })
                    }
                    className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black"
                  >
                    -
                  </button>
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 text-center font-black">
                    {actionForm.quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActionForm({
                        ...actionForm,
                        quantity: actionForm.quantity + 1,
                      })
                    }
                    className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-black"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-600/30 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
              >
                Confirm Cloud Data Sync
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Status Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end animate-in fade-in duration-300">
          <div className="bg-white w-full rounded-t-[40px] p-10 pb-12 animate-in slide-in-from-bottom-full duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight">
                  Update Job Status
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {selectedTask.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-gray-100 p-2.5 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() =>
                  handleUpdateTaskStatus(selectedTask._id, "IN_PROGRESS")
                }
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-black py-4 rounded-[20px] transition-all transform active:scale-95 uppercase tracking-widest text-xs border border-blue-100"
              >
                Mark as In-Progress
              </button>
              <button
                onClick={() =>
                  handleUpdateTaskStatus(selectedTask._id, "COMPLETED")
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-[20px] shadow-xl shadow-emerald-600/30 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

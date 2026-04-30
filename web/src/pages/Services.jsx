import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Wrench,
  Clock,
  CheckCircle2,
  User,
  MapPin,
  RefreshCw,
  Smartphone,
  Package,
  ChevronRight,
  TrendingUp,
  X,
  UserCheck,
  Download,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Services() {
  const [activeTab, setActiveTab] = useState("tickets"); // 'tickets', 'parts', 'logs'
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [techLogs, setTechLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    customerId: "",
    productId: "",
    description: "",
    areaSector: "",
    assignedTo: "",
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:5000/api/services").then((res) => res.json()),
      fetch("http://localhost:5000/api/products").then((res) => res.json()),
      fetch("http://localhost:5000/api/customers").then((res) => res.json()),
      fetch("http://localhost:5000/api/partlogs").then((res) => res.json()),
      fetch("http://localhost:5000/api/saleslogs").then((res) => res.json()),
      fetch("http://localhost:5000/api/users").then((res) => res.json()),
    ])
      .then(([s, p, c, l, sl, u]) => {
        setServices(Array.isArray(s) ? s : []);
        setProducts(
          Array.isArray(p) ? p.filter((item) => item.itemType === "UNIT") : [],
        );
        setCustomers(Array.isArray(c) ? c : []);
        const mergedLogs = [...(Array.isArray(l) ? l : []), ...(Array.isArray(sl) ? sl : [])]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTechLogs(mergedLogs);
        setUsers(
          Array.isArray(u)
            ? u.filter((user) => user.role === "TECHNICIAN")
            : [],
        );
        setLoading(false);
      })
      .catch(() => {
        toast.error("Cloud Sync Failure");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const exportData = activeTab === "tickets" ? services : techLogs;
    if (exportData.length === 0) return toast.error("No service logs.");
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      activeTab === "tickets" ? "ServiceTickets" : "FieldLogs",
    );
    XLSX.writeFile(
      wb,
      `Service_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Service telemetry exported.");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge job record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Job Ticket Purged.");
        fetchData();
      }
    } catch (e) {
      toast.error("Operation failed.");
    }
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket),
    }).then((res) => {
      if (res.ok) {
        toast.success("Job Ticket Allocated Successfully");
        setIsModalOpen(false);
        fetchData();
        setNewTicket({
          customerId: "",
          productId: "",
          description: "",
          areaSector: "",
          assignedTo: "",
        });
      }
    });
  };

  const updateJobStatus = (id, status) => {
    fetch(`http://localhost:5000/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(() => {
      toast.success(`Job status synchronized to ${status}`);
      fetchData();
    });
  };

  const filteredTickets = services.filter(
    (s) =>
      (s.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.areaSector || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredLogs = techLogs.filter(
    (l) =>
      (l.partName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.technicianName || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
            <Wrench size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Service Allocation Hub
            </h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
              Receptionist Desk & Field Ops Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="bg-white border text-gray-400 hover:text-orange-600 border-gray-200 p-3.5 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExport}
            className="bg-white border border-gray-200 text-gray-600 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all hover:bg-gray-50"
          >
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> New Service Job
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2.5 pb-4 px-2 border-b-4 font-black text-xs uppercase tracking-[0.15em] transition-all whitespace-nowrap cursor-pointer ${activeTab === "tickets" ? "border-orange-600 text-orange-700" : "border-transparent text-gray-400"}`}
        >
          Active Job Tickets{" "}
          <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
            {services.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2.5 pb-4 px-2 border-b-4 font-black text-xs uppercase tracking-[0.15em] transition-all whitespace-nowrap cursor-pointer ${activeTab === "logs" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-400"}`}
        >
          Live Mobile Audit{" "}
          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
            {techLogs.length}
          </span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-[400px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`Global Desk Filter...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-orange-600/10 focus:border-orange-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">
              Displaying{" "}
              {activeTab === "tickets"
                ? filteredTickets.length
                : filteredLogs.length}{" "}
              Entries
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {activeTab === "tickets" && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#fbfcff] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Job Profile / Area</th>
                  <th className="px-8 py-5">Allocated Tech</th>
                  <th className="px-8 py-5">Lifecycle Status</th>
                  <th className="px-8 py-5 text-right">Desk Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-orange-50/10 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${job.status === "COMPLETED" ? "bg-emerald-500" : "bg-orange-500"}`}
                        >
                          {job.description?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                            {job.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={10} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {job.areaSector || "General Sector"}
                            </span>
                          </div>
                          {/* Items Used Display */}
                          <div className="mt-3 flex flex-wrap gap-2">
                             {techLogs.filter(l => l.serviceId?._id === job._id || l.serviceId === job._id).map((log, li) => (
                                <span key={li} className="text-[8px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                                   {log.partName} x{log.quantity}
                                </span>
                             ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase">
                        <User size={14} className="text-orange-400" />
                        {job.assignedTo?.name || (
                          <span className="text-gray-300">
                            Wait For Allocation
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          job.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : job.status === "DELAYED"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : job.status === "EXTENDED"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : job.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-gray-100 text-gray-400 border-gray-200"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => updateJobStatus(job._id, "PENDING")}
                          className={`p-2 rounded-lg border ${job.status === "PENDING" ? "bg-gray-900 text-white" : "bg-white text-gray-400 hover:text-gray-900"}`}
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() =>
                            updateJobStatus(job._id, "IN_PROGRESS")
                          }
                          className={`p-2 rounded-lg border ${job.status === "IN_PROGRESS" ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-blue-600"}`}
                        >
                          <TrendingUp size={16} />
                        </button>
                        <button
                          onClick={() => updateJobStatus(job._id, "COMPLETED")}
                          className={`p-2 rounded-lg border ${job.status === "COMPLETED" ? "bg-emerald-600 text-white" : "bg-white text-gray-400 hover:text-emerald-600"}`}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 rounded-lg border bg-white text-gray-300 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "logs" && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#fbfcff] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Cloud Sync Event</th>
                  <th className="px-8 py-5">Field Staff</th>
                  <th className="px-8 py-5">Item Details</th>
                  <th className="px-8 py-5">Quantity Logged</th>
                  <th className="px-8 py-5">Job Reference</th>
                  <th className="px-8 py-5 text-right">Telemetry Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-blue-50/10 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900 text-sm">
                        {new Date(log.date).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase">
                        {new Date(log.date).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-8 py-6 font-black text-blue-600 uppercase text-xs tracking-wider">
                      {log.technicianName || log.salesPersonName}
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-700 text-sm italic">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span>"{log.partName || log.unitName}"</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-black text-rose-600 uppercase tracking-widest">
                          {log.quantity} UNITS
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                          {log.serviceId?.description || "Direct Field Event"}
                       </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${log.syncedFromMobile ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}
                      >
                        {log.syncedFromMobile ? (
                          <Smartphone size={12} />
                        ) : (
                          <div className="w-3 h-3 bg-gray-200 rounded-full" />
                        )}
                        {log.syncedFromMobile ? "Mobile Sync" : "Direct Desk"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F1A]/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4 font-sans">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-10 pt-10 pb-6 flex items-center justify-between bg-orange-50/30">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  Allocate Field Service
                </h2>
                <p className="text-gray-400 font-bold text-xs uppercase mt-2 tracking-widest">
                  Desk: Dispatch Center A
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 bg-white border border-gray-100 p-3 rounded-full cursor-pointer hover:rotate-90 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Service Problem Description
                  </label>
                  <input
                    required
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-orange-600/10 focus:border-orange-600 transition-all shadow-inner"
                    placeholder="E.g. Filter blockage in RO Unit..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Assign Customer
                  </label>
                  <select
                    required
                    value={newTicket.customerId}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, customerId: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 font-black text-gray-900 outline-none cursor-pointer focus:ring-2 focus:ring-orange-600/10 shadow-inner"
                  >
                    <option value="">Select Target Customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Assign Whole Unit
                  </label>
                  <select
                    required
                    value={newTicket.productId}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, productId: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 font-black text-gray-900 outline-none cursor-pointer focus:ring-2 focus:ring-orange-600/10 shadow-inner"
                  >
                    <option value="">Select Deployed Model</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 ml-1">
                    Geographic Area / Sector
                  </label>
                  <input
                    required
                    value={newTicket.areaSector}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, areaSector: e.target.value })
                    }
                    className="w-full bg-indigo-50/30 border border-indigo-100 rounded-2xl px-6 py-4 font-black text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all shadow-inner"
                    placeholder="E.g. Sector 12, Area B"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 ml-1">
                    Primary Technician
                  </label>
                  <select
                    required
                    value={newTicket.assignedTo}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, assignedTo: e.target.value })
                    }
                    className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-6 py-4 font-black text-orange-900 outline-none cursor-pointer focus:ring-2 focus:ring-orange-600/10 shadow-inner"
                  >
                    <option value="">Select From Field Team</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-orange-600/30 transition-all transform active:scale-95 uppercase tracking-widest text-xs"
              >
                Authorize Dispatch and Allocation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

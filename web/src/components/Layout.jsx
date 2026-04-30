import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Settings,
  Wrench,
  Menu,
  Bell,
  Search,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
  Plus,
  ShieldCheck,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

const SIDEBAR_STRUCTURE = [
  {
    name: "Home",
    path: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SALESMAN", "TECHNICIAN", "STAFF"],
  },
  {
    name: "Items",
    icon: Boxes,
    roles: ["ADMIN", "SALESMAN", "STAFF"],
    subItems: [
      { name: "Items", path: "/products" },
      { name: "Composite Items", path: "/composite-items" },
      { name: "Item Groups", path: "/item-groups" },
      { name: "Price Lists", path: "/price-lists" },
    ],
  },
  {
    name: "Inventory",
    icon: Warehouse,
    roles: ["ADMIN", "TECHNICIAN", "STAFF"],
    subItems: [
      { name: "Assemblies", path: "/assemblies" },
      { name: "Inventory Adjustments", path: "/inventory" },
      { name: "Packages", path: "/packages" },
      { name: "Shipments", path: "/shipments" },
    ],
  },
  {
    name: "Sales",
    icon: ShoppingBag,
    roles: ["ADMIN", "SALESMAN"],
    subItems: [
      { name: "Customers", path: "/customers" },
      { name: "Retainer Invoices", path: "/retainer-invoices" },
      { name: "Sales Orders", path: "/sales" },
      { name: "Invoices", path: "/invoices" },
      { name: "Delivery Challans", path: "/delivery-challans" },
      { name: "Payments Received", path: "/payments" },
      { name: "Sales Returns", path: "/sales-returns" },
      { name: "Credit Notes", path: "/credit-notes" },
    ],
  },
  {
    name: "Purchases",
    icon: ShoppingCart,
    roles: ["ADMIN", "SALESMAN"],
    subItems: [
      { name: "Vendors", path: "/vendors" },
      { name: "Purchase Orders", path: "/purchases" },
      { name: "Purchase Receives", path: "/purchase-receives" },
      { name: "Bills", path: "/bills" },
      { name: "Payments Made", path: "/payments-made" },
      { name: "Vendor Credits", path: "/vendor-credits" },
    ],
  },
  { name: "Reports", path: "/reports", icon: BarChart3, roles: ["ADMIN"] },
  {
    name: "Service Hub",
    path: "/service",
    icon: Wrench,
    roles: ["ADMIN", "STAFF"],
  },
  {
    name: "Documents",
    path: "/documents",
    icon: ClipboardList,
    roles: ["ADMIN", "STAFF"],
  },
  { name: "Settings", path: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openGroups, setOpenGroups] = useState([
    "Items",
    "Inventory",
    "Sales",
    "Purchases",
  ]);

  const toggleGroup = (name) => {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name],
    );
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [alerts, setAlerts] = useState([]);
  const notifiedAlertsRef = useRef(new Set());

  const fetchAlerts = async () => {
    try {
      const [prodRes, servRes] = await Promise.all([
        fetch("http://localhost:5000/api/products").then((r) =>
          r.ok ? r.json() : [],
        ),
        fetch("http://localhost:5000/api/services").then((r) =>
          r.ok ? r.json() : [],
        ),
      ]);

      const newAlerts = [];

      // Check for Low Stock
      if (Array.isArray(prodRes)) {
        prodRes.forEach((p) => {
          if (p && p.quantity <= 3 && p.quantity > 0) {
            newAlerts.push({
              id: `low-${p._id}`,
              title: "Low Stock Alert",
              message: `${p.name} is running low (${p.quantity} left)`,
              type: "warning",
              time: "System Monitor",
              path: "/inventory",
            });
          } else if (p && p.quantity === 0) {
            newAlerts.push({
              id: `out-${p._id}`,
              title: "Critical: Out of Stock",
              message: `${p.name} is completely depleted.`,
              type: "error",
              time: "Immediate Action",
              path: "/inventory",
            });
          }
        });
      }

      // Check for Pending Services
      if (Array.isArray(servRes)) {
        servRes
          .filter((s) => s && s.status === "PENDING")
          .forEach((s) => {
            newAlerts.push({
              id: `serv-${s._id}`,
              title: "New Service Request",
              message: `Ticket for ${s.areaSector || "Field"} is awaiting assignment.`,
              type: "info",
              time: "Field Update",
              path: "/service",
            });
          });
      }

      const latestAlerts = newAlerts.slice(0, 10);

      // Real-time Toast Notifications for NEW alerts only
      latestAlerts.forEach((alert) => {
        if (!notifiedAlertsRef.current.has(alert.id)) {
          const toastType =
            alert.type === "error"
              ? "error"
              : alert.type === "warning"
                ? "warning"
                : "info";
          toast[toastType](alert.title, {
            description: alert.message,
            action: {
              label: "VIEW",
              onClick: () => navigate(alert.path),
            },
            duration: 5000,
          });
          notifiedAlertsRef.current.add(alert.id);
        }
      });

      // Cleanup old IDs from ref that are no longer in latest alerts to allow re-notifying if they reappear
      const currentIds = new Set(latestAlerts.map((a) => a.id));
      notifiedAlertsRef.current.forEach((id) => {
        if (!currentIds.has(id)) notifiedAlertsRef.current.delete(id);
      });

      setAlerts(latestAlerts);
    } catch (e) {
      console.error("Alert Sync Failed", e);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // 10s for real-time feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      user &&
      (user.role === "TECHNICIAN" || user.role === "SALESMAN") &&
      location.pathname === "/"
    ) {
      navigate("/mobile");
    }
  }, [user, location, navigate]);

  useEffect(() => {
    setShowMobileSidebar(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const filteredSidebar = SIDEBAR_STRUCTURE.filter(
    (item) => item.roles.includes(user?.role) || user?.role === "ADMIN",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleGlobalSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const [p, c, t, s] = await Promise.all([
        fetch("http://localhost:5000/api/products").then((r) =>
          r.ok ? r.json() : [],
        ),
        fetch("http://localhost:5000/api/customers").then((r) =>
          r.ok ? r.json() : [],
        ),
        fetch("http://localhost:5000/api/transactions").then((r) =>
          r.ok ? r.json() : [],
        ),
        fetch("http://localhost:5000/api/services").then((r) =>
          r.ok ? r.json() : [],
        ),
      ]);

      const results = [
        ...p.map((x) => ({ ...x, type: "Item", path: "/products" })),
        ...c.map((x) => ({ ...x, type: "Customer", path: "/customers" })),
        ...t.map((x) => ({
          ...x,
          type: "Transaction",
          name: x.transactionId,
          path: x.type === "ORDER" ? "/sales" : "/invoices",
        })),
        ...s.map((x) => ({
          ...x,
          type: "Service",
          name: x.description,
          path: "/service",
        })),
      ]
        .filter(
          (item) =>
            (item.name || "").toLowerCase().includes(query.toLowerCase()) ||
            (item.transactionId || "")
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .slice(0, 8);

      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
    setIsSearching(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden w-full text-slate-900">
      {/* Mobile Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#0F172A] text-white flex flex-col z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full shadow-none"}`}
      >
        {/* Logo Section */}
        <div className="px-8 py-10 flex items-center justify-between border-b border-slate-800/50 mb-4 bg-slate-900/20">
          <Link to="/" className="flex items-center gap-4 group">
            <Logo className="w-20 h-10" />
            <div className="leading-tight">
              <span className="font-black text-2xl tracking-tighter block text-white uppercase group-hover:text-indigo-400 transition-colors">
                AR ASSOCIATE
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
                Enterprise SaaS
              </span>
            </div>
          </Link>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Matrix */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-4">
          {filteredSidebar.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isGroupOpen = openGroups.includes(item.name);
            const isTopActive =
              location.pathname === item.path ||
              (hasSubItems &&
                item.subItems.some((s) => s.path === location.pathname));

            return (
              <div key={item.name} className="space-y-1">
                {hasSubItems ? (
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                      isTopActive
                        ? "bg-indigo-600/10 text-white translate-x-1"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        size={19}
                        className={`${isTopActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                      />
                      <span className="font-bold text-[13px] tracking-tight">
                        {item.name}
                      </span>
                    </div>
                    {isGroupOpen ? (
                      <ChevronDown size={14} className="opacity-50" />
                    ) : (
                      <ChevronRight size={14} className="opacity-50" />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                      location.pathname === item.path
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon
                        size={19}
                        className={`${location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                      />
                      <span className="font-bold text-[13px] tracking-tight">
                        {item.name}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Sub-Items Rendering */}
                {hasSubItems && isGroupOpen && (
                  <div className="pl-12 pr-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={`flex items-center justify-between py-2.5 px-4 rounded-xl text-[12px] font-medium transition-all ${
                          location.pathname === sub.path
                            ? "text-white bg-indigo-500/10"
                            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <span>{sub.name}</span>
                        {sub.name === "Composite Items" && (
                          <Plus size={12} className="opacity-40" />
                        )}
                        {sub.name === "Customers" && (
                          <Plus size={12} className="opacity-40" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile / Status */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-[20px] border border-slate-800">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 uppercase">
                {user?.name?.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0F172A] rounded-full shadow-sm shadow-emerald-500/50"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-white">
                {user?.name || "Operator"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={10} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-400 transition-all hover:bg-rose-400/10 rounded-xl"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full w-full">
        {/* Modern Header */}
        <header
          className={`h-20 flex items-center justify-between px-8 z-30 transition-all duration-300 sticky top-0 gap-6 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-transparent"}`}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-900 md:hidden transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-[440px] group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search across all modules..."
                value={searchQuery}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="w-full bg-slate-100/80 border border-transparent hover:bg-slate-100 focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all text-[14px] font-medium placeholder:text-slate-400"
              />
              {searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white shadow-2xl border border-slate-100 rounded-[28px] overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Search Results
                    </span>
                    {isSearching && (
                      <RefreshCw
                        size={12}
                        className="animate-spin text-indigo-500"
                      />
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No footprints located.
                      </div>
                    ) : (
                      searchResults.map((res, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            navigate(res.path);
                            setSearchQuery("");
                          }}
                          className="p-5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all font-black text-[10px] uppercase">
                              {res.type[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">
                                {res.name}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {res.type} Node
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className="text-slate-300 group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* System Status */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full mr-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                System Online
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${showNotifications ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 shadow-sm"}`}
              >
                <Bell size={20} />
                {alerts.length > 0 && !showNotifications && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-96 bg-white shadow-2xl border border-slate-100 rounded-[32px] overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">
                      System Alerts
                    </h3>
                    <span className="text-[9px] font-black bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-sm shadow-rose-500/20">
                      {alerts.length} ACTIONABLE
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[440px] overflow-y-auto custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <CheckCircle2
                          className="mx-auto mb-3 opacity-20"
                          size={40}
                        />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                          System Health Optimal
                          <br />
                          No active anomalies
                        </p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <Link
                          key={alert.id}
                          to={alert.path}
                          className="p-6 hover:bg-indigo-50/30 cursor-pointer transition-all group block relative border-l-4 border-transparent hover:border-indigo-500"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm ${
                                alert.type === "error"
                                  ? "bg-rose-500 shadow-rose-500/50"
                                  : alert.type === "warning"
                                    ? "bg-amber-500 shadow-amber-500/50"
                                    : "bg-indigo-500 shadow-indigo-500/50"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-[13px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none mb-1.5">
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                                {alert.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-70 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {alert.time}
                                </span>
                                <span className="text-[10px] font-black text-indigo-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                  VIEW DETAILS →
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="p-5 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAlerts();
                      }}
                      className="w-full py-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl text-[11px] font-black text-slate-600 hover:text-indigo-600 uppercase tracking-[0.15em] transition-all shadow-sm flex items-center justify-center gap-2 group/btn"
                    >
                      <RefreshCw
                        size={14}
                        className="group-hover/btn:rotate-180 transition-transform duration-500"
                      />
                      Force Cloud Synchronization
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto layout-content relative custom-scrollbar">
          <div className="p-8 max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

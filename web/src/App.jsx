import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Warehouses from './pages/Warehouses';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import MobileTerminal from './pages/MobileTerminal';
import GenericModule from './pages/GenericModule';
import FinanceModule from './pages/FinanceModule';
import { 
  Boxes, 
  Warehouse, 
  ShoppingBag, 
  ShoppingCart, 
  Layers, 
  FileText, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  Users, 
  ClipboardList 
} from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/mobile" element={<PrivateRoute><MobileTerminal /></PrivateRoute>} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Items Cluster */}
            <Route path="products" element={<Products />} />
            <Route path="composite-items" element={<GenericModule title="Composite Items" subtitle="Bundled SKU Hub" icon={Boxes} endpoint="products" />} />
            <Route path="item-groups" element={<GenericModule title="Item Groups" subtitle="Asset Categorization" icon={Layers} endpoint="products" />} />
            <Route path="price-lists" element={<GenericModule title="Price Lists" subtitle="Custom Pricing Master" icon={FileText} endpoint="products" />} />
            
            {/* Inventory Cluster */}
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="assemblies" element={<GenericModule title="Assemblies" subtitle="Manufacturing Hub" icon={Warehouse} endpoint="warehouses" />} />
            <Route path="packages" element={<GenericModule title="Packages" subtitle="Shipment Preparation" icon={Boxes} endpoint="transactions" />} />
            <Route path="shipments" element={<GenericModule title="Shipments" subtitle="Global Logistics" icon={Truck} endpoint="transactions" />} />
            
            {/* Sales Cluster */}
            <Route path="customers" element={<Customers />} />
            <Route path="sales" element={<Sales />} />
            <Route path="retainer-invoices" element={<FinanceModule title="Retainer Invoices" subtitle="Advance Payments" icon={FileText} type="INVOICE" />} />
            <Route path="invoices" element={<FinanceModule title="Invoices" subtitle="Receivables Master" icon={FileText} type="INVOICE" />} />
            <Route path="delivery-challans" element={<GenericModule title="Delivery Challans" subtitle="Consignment Logistics" icon={Truck} endpoint="transactions" />} />
            <Route path="payments" element={<FinanceModule title="Payments Received" subtitle="Settlement Engine" icon={CreditCard} type="PAYMENT" />} />
            <Route path="sales-returns" element={<GenericModule title="Sales Returns" subtitle="Returns & RMA Hub" icon={RotateCcw} endpoint="transactions" />} />
            <Route path="credit-notes" element={<FinanceModule title="Credit Notes" subtitle="Account Adjustments" icon={FileText} type="VENDOR_CREDIT" />} />
            
            {/* Purchases Cluster */}
            <Route path="purchases" element={<Purchases />} />
            <Route path="vendors" element={<GenericModule title="Vendors" subtitle="Supplier Directory" icon={Users} endpoint="vendors" />} />
            <Route path="purchase-receives" element={<GenericModule title="Purchase Receives" subtitle="Inbound Logistics" icon={Truck} endpoint="transactions" />} />
            <Route path="bills" element={<FinanceModule title="Bills" subtitle="Payables Master" icon={FileText} type="BILL" />} />
            <Route path="payments-made" element={<FinanceModule title="Payments Made" subtitle="Outbound Settlements" icon={CreditCard} type="PAYMENT" />} />
            <Route path="vendor-credits" element={<FinanceModule title="Vendor Credits" subtitle="Supplier Claims" icon={FileText} type="VENDOR_CREDIT" />} />
            
            {/* Global Modules */}
            <Route path="service" element={<Services />} />
            <Route path="reports" element={<Reports />} />
            <Route path="documents" element={<GenericModule title="Documents" subtitle="Enterprise File Vault" icon={ClipboardList} endpoint="transactions" />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

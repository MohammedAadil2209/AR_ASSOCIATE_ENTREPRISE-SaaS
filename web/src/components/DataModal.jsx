import { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Save, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export default function DataModal({ isOpen, onClose, type, onSave, initialData = null }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'import'
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form States based on type
  const [formData, setFormData] = useState({});
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }

    if (isOpen) {
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => setProductsList(Array.isArray(data) ? data : []))
        .catch(err => console.error("Could not fetch products", err));
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length > 0) {
           toast.success(`Parsed ${data.length} records from ${file.name}`);
           handleBulkSave(data);
        } else {
           toast.error("No data found in spreadsheet.");
        }
      } catch (err) {
        toast.error("File processing failed. Ensure valid XLSX format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const endpointMap = {
    'products': 'products',
    'composite items': 'products',
    'item groups': 'products',
    'price lists': 'products',
    'customers': 'customers',
    'vendors': 'vendors',
    'warehouses': 'warehouses',
    'transactions': 'transactions',
    'invoices': 'transactions',
    'bills': 'transactions',
    'retainer invoices': 'transactions',
    'delivery challans': 'transactions',
    'sales orders': 'transactions',
    'purchase orders': 'transactions',
    'services': 'services',
    'assemblies': 'warehouses',
    'packages': 'transactions',
    'shipments': 'transactions'
  };

  const getEndpoint = () => endpointMap[type.toLowerCase()] || 'products';

  const handleBulkSave = async (dataList) => {
    setLoading(true);
    let successCount = 0;
    const endpoint = getEndpoint();

    for (const item of dataList) {
       try {
         // Sanitize and map excel fields to standard schema keys
         const sanitized = {};
         Object.keys(item).forEach(k => {
            if (['_id', '__v', 'createdAt', 'updatedAt'].includes(k)) return;
            
            const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            if (clean === 'name' || clean === 'productname' || clean === 'fullname') sanitized.name = item[k];
            else if (clean === 'phone' || clean === 'contact' || clean === 'phonenumber') sanitized.phone = String(item[k]);
            else if (clean === 'email' || clean === 'emailaddress') sanitized.email = item[k];
            else if (clean === 'address' || clean === 'physicaladdress') sanitized.address = item[k];
            else if (clean === 'brand') sanitized.brand = item[k];
            else if (clean === 'category') sanitized.category = item[k];
            else if (clean === 'sku' || clean === 'serialnumber' || clean === 'serial') sanitized.serialNumber = String(item[k]);
            else if (clean === 'quantity' || clean === 'qty' || clean === 'stock' || clean === 'stocklevel') sanitized.quantity = Number(item[k]);
            else if (clean === 'price' || clean === 'amount' || clean === 'unitprice' || clean === 'value') {
               sanitized.price = Number(item[k]) || 0;
               sanitized.amount = Number(item[k]) || 0;
            }
            else if (clean === 'type' || clean === 'itemtype' || clean === 'producttype') {
               sanitized.type = String(item[k]).toUpperCase();
               sanitized.itemType = String(item[k]).toUpperCase();
            }
            else if (clean === 'customername' || clean === 'clientname') sanitized.customerName = item[k];
            else if (clean === 'transactionid' || clean === 'ref') sanitized.transactionId = item[k];
            else sanitized[k] = item[k]; // Preserve exact keys if they already matched
         });

         const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(sanitized)
         });
         if (res.ok) {
            successCount++;
         } else {
            const err = await res.json();
            console.error("Row import failed:", sanitized, err);
            toast.error(`Row Failed: ${err.message || 'Validation error'}`);
         }
       } catch (e) {
          console.error("Network error during import:", e);
       }
    }

    if (successCount > 0) {
       toast.success(`Successfully imported ${successCount} entries!`);
    } else if (dataList.length > 0) {
       toast.error("0 entries imported. Please check the error messages above.");
    }
    
    setLoading(false);
    onSave();
    onClose();
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = getEndpoint();
    const isEdit = !!initialData?._id;

    try {
      const url = isEdit 
        ? `http://localhost:5000/api/${endpoint}/${initialData._id}` 
        : `http://localhost:5000/api/${endpoint}`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEdit ? "Record updated." : "Record established.");
        onSave();
        onClose();
      } else {
        toast.error("Persistence failure. Check data integrity.");
      }
    } catch (e) {
      toast.error("Connection lost.");
    }
    setLoading(false);
  };

  const renderFields = () => {
    const t = type.toLowerCase();
    
    if (t === 'customers' || t === 'vendors') {
      return (
        <>
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Entity Full Name</label>
            <input required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="E.g. Acme Corp" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
            <input required value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="+91 00000 00000" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <input required value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="contact@domain.com" />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Physical Address</label>
            <textarea required value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner h-24" placeholder="Full street address..." />
          </div>
        </>
      );
    }

    if (t === 'products' || t === 'items' || t === 'composite items') {
        return (
          <>
            <div className="col-span-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Name</label>
              <input required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="E.g. RO Purifier Model X" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Brand</label>
              <input required value={formData.brand || ''} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="Manufacturer" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
              <input required value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="Electronics/Spare/etc." />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">SKU / Serial</label>
              <input required value={formData.serialNumber || ''} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="UNI-001" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Stock Level</label>
              <input required type="number" value={formData.quantity || ''} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Unit Price (₹)</label>
              <input required type="number" value={formData.price || ''} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="0.00" />
            </div>
            <div className="col-span-2">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Type</label>
               <select value={formData.itemType || 'UNIT'} onChange={(e) => setFormData({...formData, itemType: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all">
                  <option value="UNIT">Finished Unit</option>
                  <option value="SPARE">Service Spare</option>
               </select>
            </div>
          </>
        );
    }

    if (t === 'transactions' || t === 'invoices' || t === 'bills' || t === 'payments') {
        return (
            <>
              <div className="col-span-2">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Transaction Ref / ID</label>
                <input required value={formData.transactionId || ''} onChange={(e) => setFormData({...formData, transactionId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="INV-001" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Entity / Client Name</label>
                <input required value={formData.customerName || ''} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="Client Name" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Amount (₹)</label>
                <input required type="number" value={formData.amount || ''} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="0.00" />
              </div>
              <div className="col-span-2">
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Selection</label>
                 <select required value={formData.description || ''} onChange={(e) => {
                     const selectedProd = productsList.find(p => p.name === e.target.value);
                     setFormData({
                       ...formData, 
                       description: e.target.value, 
                       amount: selectedProd ? selectedProd.price : formData.amount
                     });
                   }} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all">
                    <option value="" disabled>Select a product...</option>
                    {productsList.map(p => (
                       <option key={p._id} value={p.name}>{p.name} - ₹{p.price}</option>
                    ))}
                    <option value="Generic Service / Custom Entry">Generic Service / Custom Entry</option>
                 </select>
              </div>
              <div className="col-span-2">
                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Transaction Category</label>
                 <select value={formData.type || 'ORDER'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all">
                    <option value="ORDER">Sales Order</option>
                    <option value="INVOICE">Tax Invoice</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="BILL">Purchase Bill</option>
                    <option value="VENDOR_CREDIT">Credit Note</option>
                 </select>
              </div>
            </>
        );
    }

    // Fallback for generic modules
    return (
      <>
        <div className="col-span-2">
           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Record Title / Name</label>
           <input required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="E.g. Nexus Corp or Premium Filter A" />
        </div>
        <div>
           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Identifier Key</label>
           <input value={formData.serialNumber || formData.transactionId || ''} onChange={(e) => setFormData({...formData, serialNumber: e.target.value, transactionId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="Unique Key" />
        </div>
        <div>
           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Valuation / Stock</label>
           <input required type="number" value={formData.price || formData.amount || formData.quantity || ''} onChange={(e) => setFormData({...formData, price: e.target.value, amount: e.target.value, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-inner" placeholder="0.00" />
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden transform animate-in zoom-in-95 duration-300">
        <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{initialData ? 'Update' : 'Provision'} {type}</h2>
            <p className="text-slate-400 font-bold text-[9px] uppercase mt-1 tracking-[0.2em]">Enterprise Data Induction Node</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        {!initialData && (
            <div className="flex bg-slate-50 p-1.5 gap-1.5 mx-8 mt-6 rounded-2xl shadow-inner">
               <button onClick={() => setActiveTab('manual')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Manual Entry</button>
               <button onClick={() => setActiveTab('import')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'import' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Bulk XLSX Import</button>
            </div>
        )}

        <div className={initialData ? "p-10 pt-6" : "p-10"}>
          {activeTab === 'manual' || initialData ? (
            <form onSubmit={handleManualSave} className="space-y-6">
               <div className="grid grid-cols-2 gap-5">
                  {renderFields()}
               </div>
               
               <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-indigo-600/20 transition-all transform active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-4">
                 {loading ? <RefreshCw className="animate-spin" size={18} /> : <><Save size={18} /> {initialData ? 'Commit Changes' : 'Authorize Persistence'}</>}
               </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border-4 border-dashed border-slate-100 rounded-[40px] text-center">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
                  <FileText size={40} />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Bulk Ingestion Engine</h3>
               <p className="text-slate-400 font-medium mb-8 max-w-xs text-[12px]">Upload an .XLSX spreadsheet to populate the {type} database instantly.</p>
               
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileImport} 
                 className="hidden" 
                 accept=".xlsx, .xls, .csv" 
               />
               
               <button 
                 onClick={() => fileInputRef.current.click()}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center gap-3 transition-all active:scale-95"
               >
                  <Upload size={20} /> Select Secure Spreadsheet
               </button>
               
               <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Auto-column mapping active
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

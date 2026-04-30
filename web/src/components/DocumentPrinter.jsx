import { Printer, X, Download } from 'lucide-react';
import { useEffect } from 'react';

export default function DocumentPrinter({ isOpen, onClose, data }) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const typeLabel = 
    data.type === 'BILL' ? 'PURCHASE BILL' : 
    data.type === 'INVOICE' ? 'TAX INVOICE' : 
    data.type === 'PAYMENT' ? 'PAYMENT RECEIPT' : 
    data.type === 'VENDOR_CREDIT' ? 'CREDIT NOTE' : 'DOCUMENT';

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
        }
      `}} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0">
        
        {/* Interface Container */}
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden print:max-h-none print:h-auto print:shadow-none print:rounded-none">
          
          {/* Action Header (Hidden during print) */}
          <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Document Generator
            </h2>
            <div className="flex gap-3">
               <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                  <Printer size={16} /> Print Document
               </button>
               <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm">
                  <X size={20} />
               </button>
            </div>
          </div>

          {/* Printable Area */}
          <div id="print-area" className="p-10 sm:p-16 overflow-y-auto bg-white flex-1 relative">
             
             {/* Header */}
             <div className="flex justify-between items-start mb-16">
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">AR ASSOCIATE</h1>
                   <p className="text-slate-500 text-sm font-medium">Bharath complex, P.N Road, Near Santhi theater</p>
                   <p className="text-slate-500 text-sm font-medium">Tirupur, Tamil Nadu 641604</p>
                   <p className="text-slate-500 text-sm font-medium">GSTIN: 29AAAAA0000A1Z5</p>
                </div>
                <div className="text-right">
                   <h2 className="text-3xl font-black text-indigo-600 tracking-[0.2em] uppercase mb-2">
                      {typeLabel}
                   </h2>
                   <p className="text-slate-900 font-black text-lg"># {data.transactionId}</p>
                   <p className="text-slate-400 font-bold text-sm mt-1">Date: {new Date(data.date || data.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
             </div>

             {/* Billed To & Info */}
             <div className="grid grid-cols-2 gap-10 mb-16">
                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-3">Billed To</h3>
                   <p className="font-black text-slate-900 text-xl mb-1">{data.customerName || data.vendorName || 'Walk-in Client'}</p>
                   {data.phone && <p className="text-slate-500 font-medium">{data.phone}</p>}
                </div>
                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-3">Transaction Details</h3>
                   <p className="text-slate-500 font-medium mb-1 flex justify-between max-w-xs">
                     <span className="font-bold text-slate-900">Current Status:</span> 
                     <span className="uppercase text-[10px] tracking-widest font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{data.invoiceStatus || data.orderStatus || data.status || 'PROCESSED'}</span>
                   </p>
                   {data.paymentMode && (
                     <p className="text-slate-500 font-medium mb-1 flex justify-between max-w-xs mt-3">
                       <span className="font-bold text-slate-900">Payment Mode:</span> 
                       <span>{data.paymentMode}</span>
                     </p>
                   )}
                </div>
             </div>

             {/* Line Items Table */}
             <table className="w-full mb-16">
                <thead>
                   <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-y border-slate-100">
                      <th className="py-5 px-6 text-left">Description</th>
                      <th className="py-5 px-6 text-center">Qty</th>
                      <th className="py-5 px-6 text-right">Unit Price</th>
                      <th className="py-5 px-6 text-right">Total</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-slate-50">
                      <td className="py-8 px-6 font-bold text-slate-900 text-lg">{data.description || `Generic Entry for ${data.transactionId}`}</td>
                      <td className="py-8 px-6 text-center text-slate-500 font-black">1</td>
                      <td className="py-8 px-6 text-right text-slate-500 font-medium">₹{Number(data.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="py-8 px-6 text-right font-black text-slate-900 text-lg">₹{Number(data.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                   </tr>
                </tbody>
             </table>

             {/* Totals */}
             <div className="flex justify-end mb-20">
                <div className="w-80">
                   <div className="flex justify-between py-4 border-b border-slate-50">
                      <span className="text-slate-500 font-bold text-sm">Subtotal</span>
                      <span className="text-slate-900 font-black">₹{Number(data.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                   <div className="flex justify-between py-4 border-b border-slate-50">
                      <span className="text-slate-500 font-bold text-sm">Tax Amount (0%)</span>
                      <span className="text-slate-900 font-black">₹0.00</span>
                   </div>
                   <div className="flex justify-between py-6">
                      <span className="text-xl font-black text-slate-900">Grand Total</span>
                      <span className="text-2xl font-black text-indigo-600">₹{Number(data.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Thank you for your business</p>
                <p className="text-slate-400 text-[10px] font-bold">This is a system generated electronic document and requires no physical signature.</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}

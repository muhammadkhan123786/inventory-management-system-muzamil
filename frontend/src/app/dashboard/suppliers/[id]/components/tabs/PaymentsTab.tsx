// // components/tabs/PaymentsTab.tsx
// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   DollarSign, CreditCard, CheckCircle, Clock,
//   Plus, X, Banknote, FileText, ChevronDown, XCircle
// } from "lucide-react";
// import { useSupplierPayments, RecordPaymentPayload, CreditNote } from "../../hooks/Usesupplierpayments";
// import { Button } from "@/components/form/CustomButton";

// interface Props {
//   supplierId: string;
//   userId:     string;
// }

// const METHOD_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
//   bank_transfer: { label: "Bank Transfer", icon: Banknote,    color: "text-blue-600 bg-blue-50"    },
//   cheque:        { label: "Cheque",        icon: FileText,    color: "text-purple-600 bg-purple-50" },
//   cash:          { label: "Cash",          icon: DollarSign,  color: "text-green-600 bg-green-50"   },
//   credit_note:   { label: "Credit Note",   icon: CreditCard,  color: "text-orange-600 bg-orange-50" },
//   other:         { label: "Other",         icon: DollarSign,  color: "text-gray-600 bg-gray-50"     },
// };

// const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
//   completed:  { label: "Completed",  color: "bg-emerald-100 text-emerald-700" },
//   pending:    { label: "Pending",    color: "bg-amber-100 text-amber-700"     },
//   failed:     { label: "Failed",     color: "bg-red-100 text-red-700"         },
//   cancelled:  { label: "Cancelled",  color: "bg-gray-100 text-gray-500"       },
// };

// export function PaymentsTab({ supplierId, userId }: Props) {
//   const {
//     payments, creditNotes, summary, loading, submitting,
//     recordPayment, cancelPayment,
//   } = useSupplierPayments(supplierId);

//   const [showForm,       setShowForm]       = useState(false);
//   const [activeSection,  setActiveSection]  = useState<"payments" | "credits">("payments");
//   const [useCredit,      setUseCredit]      = useState(false);
//   const [selectedCredit, setSelectedCredit] = useState<CreditNote | null>(null);

//   // Form state
//   const [form, setForm] = useState({
//     amount:          "",
//     paymentMethod:   "bank_transfer",
//     paymentDate:     new Date().toISOString().split("T")[0],
//     referenceNumber: "",
//     notes:           "",
//     creditApplied:   "",
//   });

//   const openCredits = creditNotes.filter(cn =>
//     cn.status === "open" || cn.status === "partially_used"
//   );

//   const handleSubmit = async () => {
//     if (!form.amount || parseFloat(form.amount) <= 0) {
//       return;
//     }

//     const payload: RecordPaymentPayload = {
//       supplierId,
//       amount:          parseFloat(form.amount),
//       currency:        "GBP",
//       paymentMethod:   form.paymentMethod,
//       paymentDate:     form.paymentDate,
//       referenceNumber: form.referenceNumber || undefined,
//       notes:           form.notes           || undefined,
//     };

//     if (useCredit && selectedCredit && form.creditApplied) {
//       payload.creditNoteId  = selectedCredit._id;
//       payload.creditApplied = parseFloat(form.creditApplied);
//     }

//     await recordPayment(payload);
//     setShowForm(false);
//     setForm({
//       amount: "", paymentMethod: "bank_transfer",
//       paymentDate: new Date().toISOString().split("T")[0],
//       referenceNumber: "", notes: "", creditApplied: "",
//     });
//     setUseCredit(false);
//     setSelectedCredit(null);
//   };

//   const fmt = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

//   return (
//     <div className="space-y-6">

//       {/* ── Summary Cards ──────────────────────────────────────────────── */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {[
//           {
//             label: "Total Paid",
//             value: fmt(summary.totalPaid),
//             icon:  CheckCircle,
//             gradient: "from-emerald-500 to-green-600",
//             bg:       "from-emerald-50 to-green-50",
//             border:   "border-emerald-100",
//             sub:      `${summary.totalPayments} payments`,
//           },
//           {
//             label: "Available Credit",
//             value: fmt(summary.availableCredit),
//             icon:  CreditCard,
//             gradient: "from-blue-500 to-indigo-600",
//             bg:       "from-blue-50 to-indigo-50",
//             border:   "border-blue-100",
//             sub:      `${openCredits.length} open credit notes`,
//           },
//           {
//             label: "Pending Payments",
//             value: fmt(payments.filter(p => p.paymentStatus === "pending").reduce((s, p) => s + p.amount, 0)),
//             icon:  Clock,
//             gradient: "from-amber-500 to-orange-600",
//             bg:       "from-amber-50 to-orange-50",
//             border:   "border-amber-100",
//             sub:      `${payments.filter(p => p.paymentStatus === "pending").length} pending`,
//           },
//         ].map(({ label, value, icon: Icon, gradient, bg, border, sub }) => (
//           <div key={label} className={`bg-gradient-to-br ${bg} rounded-2xl border ${border} p-5 shadow-sm`}>
//             <div className="flex items-center gap-4">
//               <div className="relative shrink-0">
//                 <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-md opacity-30`} />
//                 <div className={`relative w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
//                   <Icon className="h-6 w-6 text-white" />
//                 </div>
//               </div>
//               <div>
//                 <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
//                 <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ── Action Bar ─────────────────────────────────────────────────── */}
//       <div className="flex items-center justify-between">
//         {/* Section toggle */}
//         <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
//           {(["payments", "credits"] as const).map(section => (
//             <button
//               key={section}
//               onClick={() => setActiveSection(section)}
//               className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
//                 activeSection === section
//                   ? "bg-white shadow text-gray-800"
//                   : "text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               {section === "payments" ? `Payments (${payments.length})` : `Credit Notes (${creditNotes.length})`}
//             </button>
//           ))}
//         </div>

//         <Button
//           onClick={() => setShowForm(true)}
//           className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md text-sm flex items-center gap-2"
//         >
//           <Plus className="h-4 w-4" /> Record Payment
//         </Button>
//       </div>

//       {/* ── Record Payment Form ─────────────────────────────────────────── */}
//       <AnimatePresence>
//         {showForm && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{   opacity: 0, height: 0 }}
//             className="overflow-hidden"
//           >
//             <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-200 p-6 shadow-sm">
//               <div className="flex items-center justify-between mb-5">
//                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
//                   <DollarSign className="h-5 w-5 text-emerald-500" />
//                   Record New Payment
//                 </h3>
//                 <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
//                   <X className="h-4 w-4 text-gray-500" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//                 {/* Amount */}
//                 <div>
//                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
//                     Amount (£) *
//                   </label>
//                   <input
//                     type="number" min="0" step="0.01"
//                     value={form.amount}
//                     onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
//                     placeholder="0.00"
//                     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>

//                 {/* Method */}
//                 <div>
//                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
//                     Payment Method *
//                   </label>
//                   <select
//                     value={form.paymentMethod}
//                     onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
//                     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   >
//                     <option value="bank_transfer">Bank Transfer</option>
//                     <option value="cheque">Cheque</option>
//                     <option value="cash">Cash</option>
//                     <option value="credit_note">Credit Note Only</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>

//                 {/* Date */}
//                 <div>
//                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
//                     Payment Date *
//                   </label>
//                   <input
//                     type="date"
//                     value={form.paymentDate}
//                     onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
//                     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>

//                 {/* Reference */}
//                 <div>
//                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
//                     Reference No. (Bank ref / Cheque no)
//                   </label>
//                   <input
//                     type="text"
//                     value={form.referenceNumber}
//                     onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))}
//                     placeholder="e.g. TXN-123456"
//                     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>

//                 {/* Notes */}
//                 <div className="md:col-span-2">
//                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">Notes</label>
//                   <textarea
//                     value={form.notes}
//                     onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
//                     rows={2}
//                     placeholder="Optional notes..."
//                     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                   />
//                 </div>

//                 {/* Credit Note Apply */}
//                 {openCredits.length > 0 && (
//                   <div className="md:col-span-2">
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={useCredit}
//                         onChange={e => { setUseCredit(e.target.checked); setSelectedCredit(null); }}
//                         className="w-4 h-4 accent-emerald-600"
//                       />
//                       <span className="text-sm font-semibold text-gray-700">
//                         Apply Credit Note ({openCredits.length} available — {fmt(summary.availableCredit)} total)
//                       </span>
//                     </label>

//                     {useCredit && (
//                       <motion.div
//                         initial={{ opacity: 0, height: 0 }}
//                         animate={{ opacity: 1, height: "auto" }}
//                         className="mt-3 grid grid-cols-2 gap-3"
//                       >
//                         <div>
//                           <label className="text-xs text-gray-500 mb-1 block">Select Credit Note</label>
//                           <select
//                             onChange={e => {
//                               const cn = openCredits.find(c => c._id === e.target.value) || null;
//                               setSelectedCredit(cn);
//                             }}
//                             className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                           >
//                             <option value="">-- Select --</option>
//                             {openCredits.map(cn => (
//                               <option key={cn._id} value={cn._id}>
//                                 {cn.creditNoteNumber} — {fmt(cn.remainingAmount)} available
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                         <div>
//                           <label className="text-xs text-gray-500 mb-1 block">
//                             Amount to Apply (max: {selectedCredit ? fmt(selectedCredit.remainingAmount) : "—"})
//                           </label>
//                           <input
//                             type="number" min="0" step="0.01"
//                             max={selectedCredit?.remainingAmount || 0}
//                             value={form.creditApplied}
//                             onChange={e => setForm(f => ({ ...f, creditApplied: e.target.value }))}
//                             placeholder="0.00"
//                             disabled={!selectedCredit}
//                             className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
//                           />
//                         </div>
//                       </motion.div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 mt-5">
//                 <Button variant="outline" onClick={() => setShowForm(false)} className="text-sm">
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSubmit}
//                   disabled={submitting || !form.amount}
//                   className="bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm disabled:opacity-50"
//                 >
//                   {submitting ? "Recording..." : "Record Payment"}
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ── Payments Table ──────────────────────────────────────────────── */}
//       {activeSection === "payments" && (
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//           {loading ? (
//             <div className="flex items-center justify-center py-16 text-sm text-gray-400">Loading...</div>
//           ) : payments.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <DollarSign className="h-12 w-12 text-gray-200 mb-3" />
//               <p className="text-sm font-medium text-gray-500">No payments recorded yet</p>
//               <p className="text-xs text-gray-400 mt-1">Click "Record Payment" to add one</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
//                     {["Payment #", "Date", "Amount", "Method", "Reference", "Status", "Actions"].map(h => (
//                       <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {payments.map((payment, i) => {
//                     const method = METHOD_CONFIG[payment.paymentMethod];
//                     const status = STATUS_CONFIG[payment.paymentStatus];
//                     const Icon   = method?.icon || DollarSign;

//                     return (
//                       <motion.tr
//                         key={payment._id}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: i * 0.03 }}
//                         className="hover:bg-gray-50/50 transition-colors"
//                       >
//                         <td className="px-5 py-4">
//                           <span className="font-mono text-xs font-bold text-gray-700">
//                             {payment.paymentNumber}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4 text-sm text-gray-600">
//                           {fmtDate(payment.paymentDate)}
//                         </td>
//                         <td className="px-5 py-4">
//                           <div>
//                             <span className="font-bold text-gray-900">
//                               £{payment.amount.toFixed(2)}
//                             </span>
//                             {payment.creditApplied && payment.creditApplied > 0 && (
//                               <span className="block text-xs text-orange-500 mt-0.5">
//                                 + £{payment.creditApplied.toFixed(2)} credit
//                               </span>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-5 py-4">
//                           <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${method?.color}`}>
//                             <Icon className="h-3 w-3" />
//                             {method?.label}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4 text-xs text-gray-500 font-mono">
//                           {payment.referenceNumber || "—"}
//                         </td>
//                         <td className="px-5 py-4">
//                           <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status?.color}`}>
//                             {status?.label}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4">
//                           {payment.paymentStatus === "completed" && (
//                             <button
//                               onClick={() => cancelPayment(payment._id)}
//                               className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
//                             >
//                               <XCircle className="h-3.5 w-3.5" /> Cancel
//                             </button>
//                           )}
//                         </td>
//                       </motion.tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Credit Notes Table ──────────────────────────────────────────── */}
//       {activeSection === "credits" && (
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//           {creditNotes.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <CreditCard className="h-12 w-12 text-gray-200 mb-3" />
//               <p className="text-sm font-medium text-gray-500">No credit notes yet</p>
//               <p className="text-xs text-gray-400 mt-1">Credit notes are auto-generated when a return is completed</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
//                     {["Credit Note #", "From Return", "Total", "Used", "Remaining", "Status"].map(h => (
//                       <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {creditNotes.map((cn, i) => {
//                     const statusColor = {
//                       open:           "bg-emerald-100 text-emerald-700",
//                       partially_used: "bg-amber-100 text-amber-700",
//                       fully_used:     "bg-gray-100 text-gray-500",
//                       cancelled:      "bg-red-100 text-red-500",
//                     }[cn.status];

//                     return (
//                       <motion.tr
//                         key={cn._id}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: i * 0.03 }}
//                         className="hover:bg-gray-50/50 transition-colors"
//                       >
//                         <td className="px-5 py-4">
//                           <span className="font-mono text-xs font-bold text-gray-700">
//                             {cn.creditNoteNumber}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4 text-xs text-gray-600">
//                           {(cn.goodsReturnId as any)?.grtnNumber || "—"}
//                         </td>
//                         <td className="px-5 py-4 font-bold text-gray-900">
//                           £{cn.totalAmount.toFixed(2)}
//                         </td>
//                         <td className="px-5 py-4 text-sm text-gray-500">
//                           £{cn.usedAmount.toFixed(2)}
//                         </td>
//                         <td className="px-5 py-4 font-bold text-emerald-700">
//                           £{cn.remainingAmount.toFixed(2)}
//                         </td>
//                         <td className="px-5 py-4">
//                           <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
//                             {cn.status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
//                           </span>
//                         </td>
//                       </motion.tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  SupplierLedgerView
//  Path: ../components/supplier-ledger/SupplierLedgerView.tsx
//
//  Usage:
//    import SupplierLedgerView from "@/components/supplier-ledger/SupplierLedgerView";
//    <SupplierLedgerView supplierId={id} supplierName="Ali Traders" />
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useSupplierLedger } from "../../hooks/useSupplierLedger";
import { LedgerEntry, LedgerSummary, SupplierPayment } from "../../../../../../../../common/ISupplierledger.interface";
import PaymentModal from "../../../components/suppliersAndPricing/PaymentModal";

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  supplierId:   string;
  supplierName: string;
  createdBy?:   string;
  currencySymbol: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtGBP = (n: number, currencySymbol: string) =>
  `${currencySymbol}${(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const TYPE_CONFIG: Record<string, { label: string; textColor: string; bgColor: string; icon: string }> = {
  purchase:   { label: "Purchase",   textColor: "text-red-700",    bgColor: "bg-red-50",    icon: "📦" },
  return:     { label: "Return",     textColor: "text-green-700",  bgColor: "bg-green-50",  icon: "↩️" },
  payment:    { label: "Payment",    textColor: "text-blue-700",   bgColor: "bg-blue-50",   icon: "💳" },
  adjustment: { label: "Adjustment", textColor: "text-purple-700", bgColor: "bg-purple-50", icon: "✏️" },
};

const METHOD_CONFIG: Record<string, { label: string; icon: string }> = {
  bank_transfer: { label: "Bank Transfer", icon: "🏦" },
  cheque:        { label: "Cheque",        icon: "📋" },
  cash:          { label: "Cash",          icon: "💵" },
  online:        { label: "Online",        icon: "💻" },
};

// ── Subcomponents ──────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, borderColor, bgColor,
}: {
  label: string; value: string; sub?: string; icon: string; borderColor: string; bgColor: string;
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} p-4 flex flex-col gap-1`}>
      <div className="flex justify-between items-start">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon, message, action }: { icon: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-5xl mb-4 opacity-60">{icon}</span>
      <p className="font-semibold text-gray-500 text-base">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type Tab = "ledger" | "payments";

export default function SupplierLedgerView({ supplierId, supplierName, createdBy, currencySymbol }: Props) {
  const [activeTab,         setActiveTab]         = useState<Tab>("ledger");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const {
    filteredEntries,
    payments,
    summary,
    isLoading,
    isPaymentLoading,
    page,       setPage,
    totalPages,
    typeFilter,      setTypeFilter,
    directionFilter, setDirectionFilter,
    startDate,       setStartDate,
    endDate,         setEndDate,
    handleRecordPayment,
    refresh,
    resetFilters,
  } = useSupplierLedger({ supplierId });

  const hasActiveFilters =
    typeFilter !== "all" || directionFilter !== "all" || startDate || endDate;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{supplierName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Supplier Ledger &amp; Payment History</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            className="border border-gray-200 text-gray-600 rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? "⏳" : "🔄"} Refresh
          </button>
          <button
            onClick={() => setPaymentModalOpen(true)}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Purchased"
          value={fmtGBP(summary.totalPurchases, currencySymbol)}
          sub={`${summary.entryCount} entries`}
          icon="📦"
          borderColor="border-red-200"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Total Returned"
          value={fmtGBP(summary.totalReturns, currencySymbol)}
          sub="Completed GRTNs"
          icon="↩️"
          borderColor="border-green-200"
          bgColor="bg-green-50"
        />
        <StatCard
          label="Total Paid"
          value={fmtGBP(summary.totalPayments, currencySymbol)}
          sub="Payments made"
          icon="💳"
          borderColor="border-blue-200"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Outstanding"
          value={fmtGBP(summary.outstanding, currencySymbol)}
          sub="Amount owed"
          icon={summary.outstanding <= 0 ? "✅" : "⚠️"}
          borderColor={summary.outstanding <= 0 ? "border-green-200" : "border-orange-200"}
          bgColor={summary.outstanding <= 0 ? "bg-green-50" : "bg-orange-50"}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 w-fit">
        {(["ledger", "payments"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab === "ledger" ? "📒 Ledger History" : "💳 Payments"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LEDGER TAB                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Filters bar */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="return">Return</option>
                <option value="payment">Payment</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Direction</label>
              <select
                value={directionFilter}
                onChange={(e) => { setDirectionFilter(e.target.value as any); setPage(1); }}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="all">Both</option>
                <option value="debit">Debit only</option>
                <option value="credit">Credit only</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</label>
              <input
                type="date" value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To</label>
              <input
                type="date" value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-500 border border-red-200 bg-red-50 rounded-xl px-3 py-1.5 hover:bg-red-100 transition-colors font-medium"
              >
                ✕ Reset
              </button>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <span className="animate-spin text-2xl">⏳</span>
              <span className="text-sm font-medium">Loading ledger...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <EmptyState icon="📒" message="No ledger entries found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Date", "Type", "Reference", "Notes", "Debit", "Credit", "Balance"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                          i >= 4 ? "text-right" : "text-left"
                        } ${
                          h === "Debit"   ? "text-red-500"
                          : h === "Credit" ? "text-green-600"
                          : h === "Balance" ? "text-orange-500"
                          : "text-gray-500"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEntries.map((entry: LedgerEntry, i) => {
                    const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.adjustment;
                    return (
                      <tr
                        key={entry._id}
                        className={`hover:bg-gray-50/80 transition-colors ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                      >
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {fmtDate(entry.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bgColor} ${cfg.textColor}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {entry.referenceNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate">
                          {entry.notes || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {entry.direction === "debit" ? fmtGBP(entry.amount, currencySymbol) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {entry.direction === "credit" ? fmtGBP(entry.amount, currencySymbol) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {fmtGBP(entry.balanceAfter, currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={4} className="px-4 py-3 font-bold text-gray-700 text-sm">
                      TOTALS ({filteredEntries.length} entries)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-700 text-sm">
                      {fmtGBP(summary.totalDebit, currencySymbol)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-700 text-sm">
                      {fmtGBP(summary.totalCredit, currencySymbol)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-orange-700 text-sm">
                      {fmtGBP(summary.outstanding, currencySymbol)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border border-gray-200 text-gray-600 rounded-xl px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border border-gray-200 text-gray-600 rounded-xl px-4 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAYMENTS TAB                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {payments.length === 0 ? (
            <EmptyState
              icon="💳"
              message="No payments recorded yet"
              action={
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  + Record First Payment
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Date", "Method", "Reference", "Notes", "Amount"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
                          i === 4 ? "text-right text-blue-600" : "text-left text-gray-500"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p: SupplierPayment, i) => {
                    const method = METHOD_CONFIG[p.paymentMethod] || { label: p.paymentMethod, icon: "💰" };
                    return (
                      <tr key={p._id} className={`hover:bg-gray-50/80 transition-colors ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {fmtDate(p.paymentDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                            {method.icon} {method.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {p.referenceNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">
                          {p.notes || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-blue-700">
                          {fmtGBP(p.amount, currencySymbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={4} className="px-4 py-3 font-bold text-blue-700 text-sm">
                      TOTAL PAID ({payments.length} payments)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700 text-sm">
                      {fmtGBP(payments.reduce((s, p) => s + p.amount, 0), currencySymbol)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        supplierId={supplierId}
        supplierName={supplierName}
        outstandingBalance={summary.outstanding}
        createdBy={createdBy}
        onSubmit={handleRecordPayment}

        currencySymbol = { currencySymbol}
      />
    </div>
  );
}
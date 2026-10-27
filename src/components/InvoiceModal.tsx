'use client';
import { useState } from 'react';
import {
  InvoiceData,
  InvoiceLineItem,
} from '@/utils/invoiceEngine';
import { Printer, Copy, Check, Plus, Trash2, X, Download } from 'lucide-react';

interface InvoiceModalProps {
  initialInvoice: InvoiceData;
  onClose: () => void;
}

export default function InvoiceModal({ initialInvoice, onClose }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceData>(initialInvoice);
  const [copied, setCopied] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(25);
  const [showAddForm, setShowAddForm] = useState(false);

  const recalculateTotals = (items: InvoiceLineItem[], vatRate: number): Partial<InvoiceData> => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = Math.round(((subtotal * vatRate) / 100) * 100) / 100;
    const totalDue = subtotal + vatAmount;
    return { subtotal, vatAmount, totalDue, items, vatRate };
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: newDesc.trim(),
      quantity: Number(newQty) || 1,
      unitPrice: Number(newPrice) || 0,
      total: (Number(newQty) || 1) * (Number(newPrice) || 0),
    };
    const updatedItems = [...invoice.items, newItem];
    const updatedTotals = recalculateTotals(updatedItems, invoice.vatRate);
    setInvoice((prev) => ({ ...prev, ...updatedTotals }));
    setNewDesc('');
    setNewQty(1);
    setNewPrice(25);
    setShowAddForm(false);
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = invoice.items.filter((item) => item.id !== id);
    const updatedTotals = recalculateTotals(updatedItems, invoice.vatRate);
    setInvoice((prev) => ({ ...prev, ...updatedTotals }));
  };

  const handleToggleVat = (rate: number) => {
    const updatedTotals = recalculateTotals(invoice.items, rate);
    setInvoice((prev) => ({ ...prev, ...updatedTotals }));
  };

  const handleToggleStatus = () => {
    setInvoice((prev) => ({
      ...prev,
      paymentStatus: prev.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID',
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const lines = [
      `🧾 SUREFIRE PLUMBING & HEATING — INVOICE`,
      `Invoice No: ${invoice.invoiceNumber}`,
      `Date: ${invoice.issueDate}`,
      `Customer: ${invoice.customer.name}`,
      `Property: ${invoice.customer.address}, ${invoice.customer.postcode}`,
      `---------------------------------`,
      ...invoice.items.map(
        (i) => `• ${i.description} (x${i.quantity}): £${i.total.toFixed(2)}`
      ),
      `---------------------------------`,
      `Subtotal: £${invoice.subtotal.toFixed(2)}`,
      `VAT (${invoice.vatRate}%): £${invoice.vatAmount.toFixed(2)}`,
      `TOTAL AMOUNT DUE: £${invoice.totalDue.toFixed(2)}`,
      `Payment Status: ${invoice.paymentStatus}`,
      `---------------------------------`,
      `Bank: ${invoice.company.bankName}`,
      `Sort Code: ${invoice.company.sortCode}`,
      `Account: ${invoice.company.accountNumber}`,
      `Ref: ${invoice.invoiceNumber}`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none">
        {/* Modal Top Bar - Hidden in Print */}
        <div className="bg-[#0F2B4A] text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base">客户账单明细 · Invoice Manager</h2>
            <span
              onClick={handleToggleStatus}
              className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-bold ${
                invoice.paymentStatus === 'PAID'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 text-slate-900'
              }`}
            >
              {invoice.paymentStatus === 'PAID' ? '✓ PAID' : 'UNPAID (点击切换)'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          {/* Company & Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#0F2B4A] tracking-tight">
                {invoice.company.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {invoice.company.trade}
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs font-bold">
                Gas Safe Register №: {invoice.company.gasSafeNumber}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                {invoice.company.address}
              </p>
              <p className="text-xs text-slate-500">
                Tel: {invoice.company.phone} &bull; Email: {invoice.company.email}
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Invoice
              </span>
              <p className="text-xl font-mono font-bold text-[#0F2B4A]">
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs text-slate-500">
                Issue Date: <strong>{invoice.issueDate}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Due Date: <strong>{invoice.dueDate}</strong>
              </p>
              <div className="pt-2">
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-md ${
                    invoice.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  Status: {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Service Info Box */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider">
                Invoiced To (Client):
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {invoice.customer.name}
              </p>
              <p className="text-slate-600">
                {invoice.customer.address}, <strong>{invoice.customer.postcode}</strong>
              </p>
              <p className="text-slate-600">Phone: {invoice.customer.phone}</p>
              {invoice.customer.email && (
                <p className="text-slate-600">Email: {invoice.customer.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider">
                Job Details:
              </span>
              <p className="font-bold text-slate-900 capitalize">
                {invoice.serviceDetails.serviceName}
              </p>
              <p className="text-slate-600">
                Appointment: {invoice.serviceDetails.date} ({invoice.serviceDetails.time})
              </p>
              <p className="text-slate-600 font-mono">
                Booking Ref: {invoice.referenceNumber}
              </p>
              {invoice.serviceDetails.notes && (
                <p className="text-slate-500 italic mt-1">
                  &ldquo;{invoice.serviceDetails.notes}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Itemized Breakdown / 费用明细
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 print:hidden"
              >
                <Plus size={13} /> {showAddForm ? '取消添加' : '添加配件 / 额外工时'}
              </button>
            </div>

            {/* Quick Add Form - Hidden in Print */}
            {showAddForm && (
              <form
                onSubmit={handleAddItem}
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs print:hidden"
              >
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="配件/项目描述 (例如: Replacement Mixer Cartridge)"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="数量"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="单价 £"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2 border border-blue-300 rounded-lg bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800"
                  >
                    添加
                  </button>
                </div>
              </form>
            )}

            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center w-20">Qty</th>
                  <th className="p-3 text-right w-24">Unit (£)</th>
                  <th className="p-3 text-right w-24">Amount (£)</th>
                  <th className="p-3 text-center w-12 print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="p-3 text-center text-slate-600">{item.quantity}</td>
                    <td className="p-3 text-right text-slate-600">
                      £{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900">
                      £{item.total.toFixed(2)}
                    </td>
                    <td className="p-3 text-center print:hidden">
                      {item.id.startsWith('item-') &&
                      item.id !== 'item-callout' ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & VAT Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-2 text-xs text-slate-500 max-w-sm">
              <span className="font-bold uppercase tracking-wider text-slate-600 block">
                Bank Transfer (BACS) Details:
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-slate-800 space-y-0.5">
                <p>Bank: {invoice.company.bankName}</p>
                <p>Sort Code: <strong>{invoice.company.sortCode}</strong></p>
                <p>Account No: <strong>{invoice.company.accountNumber}</strong></p>
                <p>Payment Ref: <strong>{invoice.invoiceNumber}</strong></p>
              </div>
              <p className="text-slate-400 text-[11px]">
                Please use the Invoice Number as your payment reference. Payment due within 7 days of job completion.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (净额):</span>
                <span>£{invoice.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>VAT ({invoice.vatRate}%):</span>
                  <div className="inline-flex gap-1 print:hidden text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleToggleVat(0)}
                      className={`px-1.5 py-0.5 rounded border ${
                        invoice.vatRate === 0
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVat(20)}
                      className={`px-1.5 py-0.5 rounded border ${
                        invoice.vatRate === 20
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      20%
                    </button>
                  </div>
                </div>
                <span>£{invoice.vatAmount.toFixed(2)}</span>
              </div>

              <div className="border-t-2 border-slate-800 pt-2 flex justify-between items-baseline font-bold text-base text-[#0F2B4A]">
                <span>Total Amount Due:</span>
                <span>£{invoice.totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-4 text-center text-slate-400 text-[11px] space-y-1">
            <p className="font-semibold text-slate-600">
              Thank you for choosing Surefire Plumbing &amp; Heating!
            </p>
            <p>
              All workmanship is backed by our 12-month satisfaction guarantee. Gas Safe Register № {invoice.company.gasSafeNumber}.
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions Bar - Hidden in Print */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? '✓ 明细已复制' : '复制账单明细文本'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              关闭
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0F2B4A] hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <Printer size={15} /> 🖨️ 打印 / 另存为 PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

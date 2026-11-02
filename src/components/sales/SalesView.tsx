/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  CreditCard,
  FileText,
  Printer,
  Trash2,
  X,
  Search,
  CheckCircle2,
  Clock,
  Building,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { formatUZS, formatNumber, formatDate, PAYMENT_METHOD_LABELS } from '../../utils/formatters';
import { SalesOrder, PaymentMethod, PaymentStatus } from '../../types';

export const SalesView: React.FC = () => {
  const {
    salesOrders,
    warehouse,
    addSalesOrder,
    recordSalePayment,
    deleteSalesOrder,
    kpis,
  } = useFactory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');

  // New Sale Modal
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [notes, setNotes] = useState('');

  // Payment Receipt Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<SalesOrder | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<number | ''>('');
  const [payMethodInput, setPayMethodInput] = useState<PaymentMethod>('bank');

  // Invoice Print View Modal
  const [selectedInvoice, setSelectedInvoice] = useState<SalesOrder | null>(null);

  const finishedProducts = warehouse.filter((i) => i.category === 'finished_product');

  const openNewSaleModal = () => {
    if (finishedProducts.length > 0) {
      setSelectedProductId(finishedProducts[0].id);
      setUnitPrice(finishedProducts[0].sellingPrice || 50000);
    }
    setQuantity(100);
    setPaidAmount('');
    setCustomerName('');
    setCustomerPhone('+998 ');
    setCustomerCompany('');
    setPaymentMethod('bank');
    setNotes('');
    setIsSaleModalOpen(true);
  };

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = warehouse.find((w) => w.id === prodId);
    if (prod && prod.sellingPrice) {
      setUnitPrice(prod.sellingPrice);
    }
  };

  const totalCalculated =
    (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = warehouse.find((w) => w.id === selectedProductId);
    if (!product || !quantity || Number(quantity) <= 0 || !customerName.trim()) return;

    const total = Number(quantity) * Number(unitPrice);
    const paid = Number(paidAmount) || 0;
    const debt = Math.max(0, total - paid);
    const paymentStatus: PaymentStatus = debt === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const orderNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    addSalesOrder({
      orderNumber,
      date: today,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerCompany: customerCompany.trim(),
      productId: product.id,
      productName: product.name,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalAmount: total,
      paidAmount: paid,
      debtAmount: debt,
      paymentStatus,
      paymentMethod,
      notes: notes.trim(),
    });

    setIsSaleModalOpen(false);
  };

  const openPayModal = (order: SalesOrder) => {
    setSelectedOrderForPay(order);
    setPayAmountInput(order.debtAmount);
    setPayMethodInput('bank');
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPay || !payAmountInput || Number(payAmountInput) <= 0) return;

    recordSalePayment(selectedOrderForPay.id, Number(payAmountInput), payMethodInput);
    setIsPayModalOpen(false);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return salesOrders.filter((s) => {
      if (statusFilter !== 'all' && s.paymentStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.orderNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q) ||
          (s.customerCompany && s.customerCompany.toLowerCase().includes(q)) ||
          s.productName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [salesOrders, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Jami Sotuvlar Summasi</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatUZS(salesOrders.reduce((sum, s) => sum + s.totalAmount, 0))}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">{salesOrders.length} ta yirik shartnoma</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Tushgan Pul (Kassada)</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatUZS(salesOrders.reduce((sum, s) => sum + s.paidAmount, 0))}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">To'liq yoki qisman to'langan</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Mijozlar Qarzdorligi (Nasiya)</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-rose-500">
            {formatUZS(kpis.unpaidDebtTotal)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Undirilishi kutilayotgan summa</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Sotilgan Mahsulot Hajmi</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-blue-500">
            {formatNumber(kpis.soldUnitsTotal)} birlik
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Ombordan jo'natilgan</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              To'liq To'langan
            </button>
            <button
              onClick={() => setStatusFilter('partial')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'partial'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              Qisman (Qarzdor)
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'unpaid'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-500'
              }`}
            >
              To'lanmagan
            </button>
          </div>

          <button
            onClick={openNewSaleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Yangi Sotuv Qayd Etish</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Shartnoma #, mijoz yoki korxona nomi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400">
                <th className="py-3 px-4 font-semibold">Faktura #</th>
                <th className="py-3 px-4 font-semibold">Sana</th>
                <th className="py-3 px-4 font-semibold">Xaridor (Mijoz / Korxona)</th>
                <th className="py-3 px-4 font-semibold">Mahsulot</th>
                <th className="py-3 px-4 font-semibold text-right">Miqdor</th>
                <th className="py-3 px-4 font-semibold text-right">Jami Summa</th>
                <th className="py-3 px-4 font-semibold text-right">To'langan</th>
                <th className="py-3 px-4 font-semibold text-right">Qarz (Nasiya)</th>
                <th className="py-3 px-4 font-semibold text-center">Holat</th>
                <th className="py-3 px-4 font-semibold text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400">
                    Sotuvlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'paid';
                  const isPartial = order.paymentStatus === 'partial';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-500 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {formatDate(order.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {order.customerCompany || order.customerName}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {order.customerName} · {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-800 dark:text-neutral-200">
                        {order.productName}
                      </td>
                      <td className="py-3 px-4 font-mono text-right whitespace-nowrap">
                        {formatNumber(order.quantity)} dona/m
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {formatUZS(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-emerald-500 whitespace-nowrap">
                        {formatUZS(order.paidAmount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            order.debtAmount > 0 ? 'text-rose-500' : 'text-neutral-400'
                          }`}
                        >
                          {order.debtAmount > 0 ? formatUZS(order.debtAmount) : '0'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : isPartial
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          {isPaid ? 'To\'liq' : isPartial ? 'Qisman' : 'Qarzdor'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {order.debtAmount > 0 && (
                            <button
                              onClick={() => openPayModal(order)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors cursor-pointer"
                              title="Qarzni to'lash"
                            >
                              + Pul qabul qilish
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(order)}
                            className="p-1.5 text-neutral-400 hover:text-amber-500 rounded-md hover:bg-neutral-800 cursor-pointer"
                            title="Faktura / Chekni ko'rish"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSalesOrder(order.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-800 cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Sale */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSaleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Yangi Mahsulot Sotuvini Qayd Etish
              </h2>
              <p className="text-xs text-neutral-500">
                Sotuv qayd etilganda mahsulot ombordan avtomatik yechiladi va kassa kirimi hisoblanadi.
              </p>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Sotiladigan Tayyor Mahsulot *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                >
                  {finishedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Omborda: {p.quantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Sotiladigan Miqdor *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Bir Dona Narxi (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Total Banner */}
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Jami Shartnoma Qiymati:</span>
                <span className="font-mono text-base font-bold text-amber-500">
                  {formatUZS(totalCalculated)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Hozir To'langan Summa (UZS)
                  </label>
                  <input
                    type="number"
                    placeholder="Masalan: 50000000"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                  <span className="text-[10px] text-neutral-400 block mt-1">
                    Qoldig'i qarzdorlik (nasiya) sifatida saqlanadi
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    To'lov Shakli
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="bank">Bank o'tkazmasi</option>
                    <option value="cash">Naqd pul</option>
                    <option value="card">Plastik karta</option>
                    <option value="currency">Valyuta ($)</option>
                  </select>
                </div>
              </div>

              {/* Customer info */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                  Xaridor Ma'lumotlari
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Xaridor Nomi / Mas'ul FIO *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Alisher Vohidov"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                      Telefon Raqami
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Kompaniya / Tashkilot Nomi (Yuridik shaxs bo'lsa)
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Samarqand Suv Ta'minoti MCHJ"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Izoh / Shartnoma Shartlari
                </label>
                <input
                  type="text"
                  placeholder="Yuk xati, to'lov muddati yoki kafolat shartlari..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Sotuvni Qayd Etish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Debt Repayment (Pul Qabul Qilish) */}
      {isPayModalOpen && selectedOrderForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Mijoz Qarzdorligidan Pul Qabul Qilish
              </h2>
              <p className="text-xs text-neutral-500">
                Faktura #{selectedOrderForPay.orderNumber} · {selectedOrderForPay.customerCompany || selectedOrderForPay.customerName}
              </p>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex justify-between">
              <span className="text-rose-400 font-medium">Hozirgi mavjud qarz:</span>
              <span className="font-mono font-bold text-rose-500">
                {formatUZS(selectedOrderForPay.debtAmount)}
              </span>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qabul Qilinayotgan Summa (UZS) *
                </label>
                <input
                  type="number"
                  required
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  To'lov Turi
                </label>
                <select
                  value={payMethodInput}
                  onChange={(e) => setPayMethodInput(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                >
                  <option value="bank">Bank o'tkazmasi</option>
                  <option value="cash">Naqd pul (Kassa)</option>
                  <option value="card">Korporativ plastik karta</option>
                  <option value="currency">Valyuta ($)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  To'lovni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto print:shadow-none print:border-none">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="no-print absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                  TEXNO-PLAST ZAVODI
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Polietilen quvurlar va sanoat idishlari ishlab chiqarish korxonasi
                </p>
                <p className="text-xs text-neutral-500">
                  Toshkent vil., Yuqori Chirchiq tumani, Sanoat hududi #4
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-500">
                  HISOB-FAKTURA #{selectedInvoice.orderNumber}
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  Sana: {formatDate(selectedInvoice.date)}
                </p>
              </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-2 gap-6 py-6 border-b border-neutral-200 dark:border-neutral-800 text-xs">
              <div>
                <span className="font-semibold text-neutral-500 block mb-1">Mijoz / Buyurtmachi:</span>
                <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {selectedInvoice.customerCompany || selectedInvoice.customerName}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Vakil: {selectedInvoice.customerName}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-mono">
                  Tel: {selectedInvoice.customerPhone}
                </p>
              </div>

              <div className="text-right">
                <span className="font-semibold text-neutral-500 block mb-1">To'lov Holati:</span>
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 font-mono">
                  {selectedInvoice.paymentStatus === 'paid'
                    ? 'To\'liq To\'langan'
                    : selectedInvoice.paymentStatus === 'partial'
                    ? 'Qisman To\'langan (Qarzdorlik bor)'
                    : 'To\'lanmagan (Nasiya)'}
                </span>
                <p className="text-neutral-500 mt-1">
                  To'lov usuli: {PAYMENT_METHOD_LABELS[selectedInvoice.paymentMethod]}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="py-6 border-b border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <th className="py-2">Mahsulot Nomi</th>
                    <th className="py-2 text-right">Miqdor</th>
                    <th className="py-2 text-right">Narxi</th>
                    <th className="py-2 text-right">Jami Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <tr>
                    <td className="py-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedInvoice.productName}
                    </td>
                    <td className="py-3 text-right font-mono">
                      {formatNumber(selectedInvoice.quantity)} dona/m
                    </td>
                    <td className="py-3 text-right font-mono">
                      {formatUZS(selectedInvoice.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {formatUZS(selectedInvoice.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="py-4 space-y-1 text-xs text-right font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">Jami hisoblangan:</span>
                <span className="font-bold">{formatUZS(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-500">
                <span>To'langan summa:</span>
                <span>{formatUZS(selectedInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-500 font-bold text-sm pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span>Qolgan qarzdorlik:</span>
                <span>{formatUZS(selectedInvoice.debtAmount)}</span>
              </div>
            </div>

            {/* Print button */}
            <div className="no-print pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
              >
                Yopish
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Chop Etish (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

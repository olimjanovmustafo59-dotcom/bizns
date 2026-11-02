/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
  Trash2,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import {
  formatUZS,
  formatDate,
  exportToCSV,
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from '../../utils/formatters';
import { ExpenseCategory, IncomeCategory, PaymentMethod, Transaction } from '../../types';

export const FinanceView: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, kpis } = useFactory();

  // Filters & Search
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');

  // Form State
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [counterparty, setCounterparty] = useState('');
  const [relatedItem, setRelatedItem] = useState('');
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('product_sale');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('raw_material');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [notes, setNotes] = useState('');

  const openAddModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setCounterparty('');
    setRelatedItem('');
    setNotes('');
    setPaymentMethod('bank');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !counterparty.trim()) return;

    addTransaction({
      type: modalType,
      date,
      amount: Number(amount),
      category: modalType === 'income' ? incomeCategory : expenseCategory,
      counterparty: counterparty.trim(),
      relatedItem: relatedItem.trim(),
      paymentMethod,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          t.counterparty.toLowerCase().includes(q) ||
          (t.relatedItem && t.relatedItem.toLowerCase().includes(q)) ||
          t.notes.toLowerCase().includes(q) ||
          String(t.amount).includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [transactions, filterType, categoryFilter, paymentFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Sana', 'Turi', 'Summa (so\'m)', 'Kontragent', 'Maqsad/Mahsulot', 'To\'lov turi', 'Izoh', 'Kirituvchi'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'Kirim' : 'Chiqim',
      t.amount,
      t.counterparty,
      t.relatedItem || '',
      PAYMENT_METHOD_LABELS[t.paymentMethod],
      t.notes || '',
      t.createdBy,
    ]);
    exportToCSV(`zavodpro_moliya_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kirimlar */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Jami Kirimlar (Tushum)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-emerald-600 dark:text-emerald-400">
            +{formatUZS(kpis.totalIncome)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Sotuv va xizmatlar tushumi
          </p>
        </div>

        {/* Chiqimlar */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Jami Chiqimlar (Xarajat)
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-rose-600 dark:text-rose-400">
            -{formatUZS(kpis.totalExpense)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Maosh, xomashyo va kommunal
          </p>
        </div>

        {/* Sof Balans / Foyda */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Kassa Sof Foydasi (Qoldiq)
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 font-mono tabular-nums text-xl font-bold ${
              kpis.netProfit >= 0
                ? 'text-neutral-900 dark:text-neutral-100'
                : 'text-rose-500'
            }`}
          >
            {formatUZS(kpis.netProfit)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            Sof moliyaviy natija
          </p>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Barcha Operatsiyalar
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Faqat Kirim
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Faqat Chiqim
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel (CSV)</span>
            </button>
            <button
              onClick={() => openAddModal('income')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Kirim Qo'shish</span>
            </button>
            <button
              onClick={() => openAddModal('expense')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>- Chiqim Qo'shish</span>
            </button>
          </div>
        </div>

        {/* Search & Sub-filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Kontragent, maqsad yoki summa bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
            >
              <option value="all">Barcha to'lov turlari</option>
              <option value="bank">Bank o'tkazmasi</option>
              <option value="cash">Naqd pul</option>
              <option value="card">Korporativ karta</option>
              <option value="currency">Valyuta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400">
                <th className="py-3 px-4 font-semibold">Sana</th>
                <th className="py-3 px-4 font-semibold">Turi</th>
                <th className="py-3 px-4 font-semibold">Toifa</th>
                <th className="py-3 px-4 font-semibold">Kontragent</th>
                <th className="py-3 px-4 font-semibold">Maqsad / Mahsulot</th>
                <th className="py-3 px-4 font-semibold">To'lov Turi</th>
                <th className="py-3 px-4 font-semibold text-right">Summa (UZS)</th>
                <th className="py-3 px-4 font-semibold text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Kriteriyalarga mos moliyaviy operatsiya topilmadi
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+ Kirim' : '- Chiqim'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {tx.type === 'income'
                        ? INCOME_CATEGORY_LABELS[tx.category as IncomeCategory] || tx.category
                        : EXPENSE_CATEGORY_LABELS[tx.category as ExpenseCategory] || tx.category}
                    </td>
                    <td className="py-3 px-4 text-neutral-900 dark:text-neutral-100 font-semibold max-w-[200px] truncate">
                      {tx.counterparty}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 max-w-[220px] truncate">
                      {tx.relatedItem || '-'}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{PAYMENT_METHOD_LABELS[tx.paymentMethod]}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right font-bold whitespace-nowrap text-sm">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatUZS(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Kirim / Chiqim Qo'shish */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                {modalType === 'income' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Yangi Kirim Qo'shish (Kassa)
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Yangi Chiqim Qo'shish (Xarajat)
                  </>
                )}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Zavod kassa jurnaliga yangi moliyaviy yozuv kiritish
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Operatsiya Sanasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Summa (UZS / so'm) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Masalan: 15000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {modalType === 'income' ? 'Kimdan kelgan (Mijoz / Korxona) *' : 'Kimga to\'langan (Xodim / Ta\'minotchi) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={modalType === 'income' ? 'Masalan: Samarqand Suv Qurilish MCHJ' : 'Masalan: Shurtan Gaz Kimyo Majmuasi'}
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Xarajat / Kirim Toifasi *
                  </label>
                  {modalType === 'income' ? (
                    <select
                      value={incomeCategory}
                      onChange={(e) => setIncomeCategory(e.target.value as IncomeCategory)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                    >
                      <option value="product_sale">Mahsulot sotuvi</option>
                      <option value="advance_payment">Bo'nak (Avans)</option>
                      <option value="service">Xizmat ko'rsatish</option>
                      <option value="scrap_sale">Brak/chiqindi sotuvi</option>
                      <option value="other">Boshqa kirim</option>
                    </select>
                  ) : (
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                    >
                      <option value="raw_material">Xomashyo xaridi</option>
                      <option value="salary">Ishchilar maoshi</option>
                      <option value="electricity">Elektr energiyasi</option>
                      <option value="gas_water">Gaz va suv</option>
                      <option value="transport">Transport</option>
                      <option value="equipment">Uskunalar</option>
                      <option value="repair">Ta'mirlash</option>
                      <option value="other">Boshqa xarajatlar</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    To'lov Turi *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="bank">Bank o'tkazmasi (Hisob raqam)</option>
                    <option value="cash">Naqd pul (Kassa)</option>
                    <option value="card">Korporativ plastik karta</option>
                    <option value="currency">Valyuta ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qaysi mahsulot yoki xizmat uchun
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Polietilen quvur d110mm yoki Oktyabr oyi elektr quvvati"
                  value={relatedItem}
                  onChange={(e) => setRelatedItem(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Izoh (Shartnoma raqami yoki tafsilot)
                </label>
                <textarea
                  rows={2}
                  placeholder="Qo'shimcha izoh yoki hujjat raqami..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                    modalType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {modalType === 'income' ? 'Kirimni Saqlash' : 'Chiqimni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

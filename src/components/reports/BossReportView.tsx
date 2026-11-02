/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Award,
  Sparkles,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import {
  formatUZS,
  formatNumber,
  formatDate,
  exportToCSV,
  EXPENSE_CATEGORY_LABELS,
} from '../../utils/formatters';

export const BossReportView: React.FC = () => {
  const {
    transactions,
    salesOrders,
    warehouse,
    productionBatches,
    kpis,
    timeFilter,
    setTimeFilter,
  } = useFactory();

  // Custom date range state for boss
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-02');

  // Filter transactions within range
  const scopedTransactions = useMemo(() => {
    return transactions.filter((t) => {
      return t.date >= startDate && t.date <= endDate;
    });
  }, [transactions, startDate, endDate]);

  // Financial summary
  const totalIncome = scopedTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = scopedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Department / Category expenses
  const departmentExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    scopedTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = EXPENSE_CATEGORY_LABELS[t.category as keyof typeof EXPENSE_CATEGORY_LABELS] || t.category;
        map[cat] = (map[cat] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [scopedTransactions, totalExpense]);

  // Product profitability ranking
  const productProfitability = useMemo(() => {
    const finished = warehouse.filter((w) => w.category === 'finished_product');

    return finished
      .map((p) => {
        // Find sales for this product
        const sales = salesOrders.filter((s) => s.productId === p.id);
        const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalUnitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
        const costOfGoodsSold = totalUnitsSold * p.unitCost;
        const grossProfit = totalSalesAmount - costOfGoodsSold;
        const margin = totalSalesAmount > 0 ? ((grossProfit / totalSalesAmount) * 100).toFixed(1) : '0';

        return {
          id: p.id,
          name: p.name,
          code: p.code,
          unitCost: p.unitCost,
          sellingPrice: p.sellingPrice,
          unitsSold: totalUnitsSold,
          totalRevenue: totalSalesAmount,
          costOfGoodsSold,
          grossProfit,
          margin,
        };
      })
      .sort((a, b) => b.grossProfit - a.grossProfit);
  }, [warehouse, salesOrders]);

  // Export Boss Summary CSV
  const handleExportCSV = () => {
    const headers = ['Mahsulot Nomi', 'SKU Kodi', 'Sotilgan Birlik', 'Tushum (so\'m)', 'Tannarx Sarfi (so\'m)', 'Sof Foyda (so\'m)', 'Rentabellik Marjasi %'];
    const rows = productProfitability.map((p) => [
      p.name,
      p.code,
      p.unitsSold,
      p.totalRevenue,
      p.costOfGoodsSold,
      p.grossProfit,
      `${p.margin}%`,
    ]);
    exportToCSV(`boss_hisobot_${startDate}_${endDate}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Boss Executive Filter & Action Bar */}
      <div className="no-print p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Boss Strategik Boshqaruv Hisoboti
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Faqat zavod ta'sischisi va bosh direktori uchun chuqur moliyaviy audit va rentabellik tahlili
            </p>
          </div>

          {/* Action buttons: Print PDF and CSV */}
          <div className="flex items-center gap-2.5 self-end lg:self-center">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Excel (CSV) Yuklab Olish</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PDF Formatida Chop Etish</span>
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Hisobot Davrini Tanlang:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono"
            />
            <span className="text-neutral-400">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg font-mono"
            />
          </div>

          <span className="text-neutral-400 hidden sm:inline">|</span>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => {
                setStartDate('2026-11-02');
                setEndDate('2026-11-02');
              }}
              className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white cursor-pointer"
            >
              Bugun
            </button>
            <button
              onClick={() => {
                setStartDate('2026-10-01');
                setEndDate('2026-10-31');
              }}
              className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white cursor-pointer"
            >
              O'tgan oy (Oktyabr)
            </button>
            <button
              onClick={() => {
                setStartDate('2026-01-01');
                setEndDate('2026-11-02');
              }}
              className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white cursor-pointer"
            >
              Yil boshidan (YTD)
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div className="p-6 md:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Report Official Letterhead */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-sm" />
              <h1 className="text-xl font-extrabold tracking-tight font-mono text-neutral-900 dark:text-neutral-100">
                TEXNO-PLAST INDUSTRIAL ZAVODI
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Boshqaruv va Rentabellik Tahlili Bo'yicha Bosh Direktorga Hisobot
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <p className="text-neutral-500">Hisobot oralig'i:</p>
            <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              {formatDate(startDate)} — {formatDate(endDate)}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Chiqarilgan vaqti: 2026-11-02 03:02
            </p>
          </div>
        </div>

        {/* 1. Core Financial Comparison Strip */}
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
            01. Moliyaviy Taqqoslama (Kirim vs Chiqim)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-xs font-medium text-neutral-500">Jami Tushum (Kirim)</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                +{formatUZS(totalIncome)}
              </div>
              <span className="text-[11px] text-neutral-400">Mahsulot sotuvlari</span>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-xs font-medium text-neutral-500">Jami Chiqim (Xarajatlar)</span>
              <div className="mt-1 font-mono text-lg font-bold text-rose-600 dark:text-rose-400">
                -{formatUZS(totalExpense)}
              </div>
              <span className="text-[11px] text-neutral-400">Ishlab chiqarish va boshqaruv</span>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-xs font-medium text-neutral-500">Sof Foyda (Balans)</span>
              <div
                className={`mt-1 font-mono text-lg font-bold ${
                  netProfit >= 0
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-rose-500'
                }`}
              >
                {formatUZS(netProfit)}
              </div>
              <span className="text-[11px] text-neutral-400">Soliq va xarajatlardan so'ng</span>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60">
              <span className="text-xs font-medium text-neutral-500">Sof Rentabellik (Marja)</span>
              <div className="mt-1 font-mono text-lg font-bold text-amber-500">
                {profitMargin}%
              </div>
              <span className="text-[11px] text-neutral-400">Yuqori rentabelli korxona</span>
            </div>
          </div>
        </div>

        {/* 2. Department Expenses Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
            02. Xarajatlarning Bo'limlar Bo'yicha Taqsimoti
          </h3>

          <div className="bg-neutral-50/70 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                  <th className="py-2.5 px-4 font-semibold">Xarajat Yo'nalishi</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Summa (UZS)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Umumiy Chiqimdagi Ulushi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/60 font-medium">
                {departmentExpenses.map((dept, i) => (
                  <tr key={i} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/60">
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-200">
                      {dept.name}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-neutral-900 dark:text-neutral-100">
                      {formatUZS(dept.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-mono font-semibold text-neutral-600 dark:text-neutral-300">
                          {dept.percentage}%
                        </span>
                        <div className="w-20 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${dept.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Product Profitability Ranking */}
        <div>
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
            03. Mahsulotlar Rentabelligi Reytingi (Eng Ko'p Foyda Keltirganlar)
          </h3>

          <div className="bg-neutral-50/70 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/60 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                  <th className="py-2.5 px-4 font-semibold">Reyting</th>
                  <th className="py-2.5 px-4 font-semibold">Mahsulot Nomi</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Sotilgan Miqdor</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Jami Tushum</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Ishlab Chiqarish Sarfi</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Sof Yalpi Foyda</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Marja (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700/60 font-medium">
                {productProfitability.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/60">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-400 whitespace-nowrap">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-neutral-900 dark:text-neutral-100">{p.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">SKU: {p.code}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-right whitespace-nowrap">
                      {formatNumber(p.unitsSold)}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {formatUZS(p.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-neutral-500 whitespace-nowrap">
                      {formatUZS(p.costOfGoodsSold)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-emerald-500 whitespace-nowrap text-sm">
                      +{formatUZS(p.grossProfit)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-amber-500 whitespace-nowrap">
                      {p.margin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Strategic Executive Summary for Boss */}
        <div className="p-5 bg-amber-500/5 dark:bg-neutral-800/80 rounded-xl border border-amber-500/20 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Zavod Asoschisi (BOSS) Uchun Avtomatik Xulosa va Tavsiyalar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Rentabellik va Savdo Dinamikasi:
              </p>
              <p>
                Eng ko'p yalpi foyda <b>{productProfitability[0]?.name || 'Quvur mahsulotlari'}</b> hisobiga to'g'ri kelmoqda ({productProfitability[0]?.margin || 32}% marja). Sanoat kanistrlari bo'yicha buyurtmalar oqimi barqaror o'smoqda.
              </p>
            </div>
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Xarajatlarni Optimallashtirish:
              </p>
              <p>
                Xarajatlarning asosiy qismi xomashyo (granula) xaridi hamda ishchilar oylik maosh fondiga to'g'ri keladi. Elektr energiyasini tejash uchun 2-ekstruder liniyasini tungi arzon tarif vaqtida ishlatish rentabellikni yana +3.2% ga oshiradi.
              </p>
            </div>
          </div>
        </div>

        {/* Signature Strip */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <div>
            <p>Bosh Direktor: Zafar Rahimov ____________ (Imzo)</p>
          </div>
          <div>
            <p>Bosh Buxgalter: Nilufar Karimova ____________ (Imzo)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

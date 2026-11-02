/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Trash2,
  X,
  History,
  PackageCheck,
  Edit2,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { formatUZS, formatNumber, formatDate } from '../../utils/formatters';
import { WarehouseItem, ItemUnit } from '../../types';

export const WarehouseView: React.FC = () => {
  const {
    warehouse,
    stockMovements,
    addWarehouseItem,
    updateWarehouseItem,
    deleteWarehouseItem,
    adjustStock,
    kpis,
    currentUser,
  } = useFactory();

  // Active Category tab
  const [activeTab, setActiveTab] = useState<'all' | 'finished_product' | 'raw_material' | 'low_stock' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'finished_product' | 'raw_material'>('finished_product');
  const [code, setCode] = useState('');
  const [unit, setUnit] = useState<ItemUnit>('dona');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minStockAlert, setMinStockAlert] = useState<number | ''>('');
  const [unitCost, setUnitCost] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');

  // Stock Adjustment (Kirim / Sarf) Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<WarehouseItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState<number | ''>('');
  const [adjustReason, setAdjustReason] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('finished_product');
    setCode(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setUnit('dona');
    setQuantity('');
    setMinStockAlert(100);
    setUnitCost('');
    setSellingPrice('');
    setLocation('Asosiy ombor');
    setIsItemModalOpen(true);
  };

  const openEditModal = (item: WarehouseItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setCode(item.code);
    setUnit(item.unit);
    setQuantity(item.quantity);
    setMinStockAlert(item.minStockAlert);
    setUnitCost(item.unitCost);
    setSellingPrice(item.sellingPrice || '');
    setLocation(item.location);
    setIsItemModalOpen(true);
  };

  const openAdjustStock = (item: WarehouseItem, type: 'in' | 'out') => {
    setSelectedItemForAdjust(item);
    setAdjustType(type);
    setAdjustQty('');
    setAdjustReason(type === 'in' ? 'Ta\'minotchidan partiya qabuli' : 'Sex ehtiyoji uchun sarf');
    setIsAdjustModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateWarehouseItem(editingItem.id, {
        name: name.trim(),
        category,
        code: code.trim(),
        unit,
        quantity: Number(quantity) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        unitCost: Number(unitCost) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        location: location.trim(),
      });
    } else {
      addWarehouseItem({
        name: name.trim(),
        category,
        code: code.trim(),
        unit,
        quantity: Number(quantity) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        unitCost: Number(unitCost) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        location: location.trim(),
      });
    }
    setIsItemModalOpen(false);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust || !adjustQty || Number(adjustQty) <= 0) return;

    adjustStock(
      selectedItemForAdjust.id,
      Number(adjustQty),
      adjustReason.trim() || (adjustType === 'in' ? 'Kirim' : 'Sarf'),
      adjustType
    );
    setIsAdjustModalOpen(false);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return warehouse.filter((item) => {
      if (activeTab === 'finished_product' && item.category !== 'finished_product') return false;
      if (activeTab === 'raw_material' && item.category !== 'raw_material') return false;
      if (activeTab === 'low_stock' && item.quantity > item.minStockAlert) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [warehouse, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Ombor Umumiy Qiymati</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatUZS(kpis.warehouseTotalValue)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {warehouse.length} xil tovar va xomashyo
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Tayyor Mahsulotlar</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {warehouse.filter((i) => i.category === 'finished_product').length} tur
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Sotuvga tayyor qoldiqlar</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Xomashyolar Zaxirasi</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-blue-600 dark:text-blue-400">
            {warehouse.filter((i) => i.category === 'raw_material').length} tur
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Ishlab chiqarish zaxiralari</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Kam Qolgan Tovarlar</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-amber-500">
            {kpis.lowStockItemsCount} ta ogohlantirish
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Zudlik bilan xarid kerak</p>
        </div>
      </div>

      {/* Control & Tab Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Segmented Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Barcha Tovarlar
            </button>
            <button
              onClick={() => setActiveTab('finished_product')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'finished_product'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Tayyor Mahsulotlar
            </button>
            <button
              onClick={() => setActiveTab('raw_material')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'raw_material'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Xomashyolar
            </button>
            <button
              onClick={() => setActiveTab('low_stock')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'low_stock'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-500 hover:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Kam Qolganlar ({kpis.lowStockItemsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Ombor Tarixi</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Yangi Tovar Qo'shish</span>
            </button>
          </div>
        </div>

        {/* Search */}
        {activeTab !== 'history' && (
          <div className="relative w-full pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tovar nomi, SKU kodi yoki ombordagi joylashuvi bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* Main View: Items Table OR History */}
      {activeTab === 'history' ? (
        /* Stock Movements Log Table */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Ombor Harakatlari Jurnali (Kirim va Chiqimlar Tarixi)
            </h3>
            <p className="text-xs text-neutral-500">
              Tovarlarning omborga kirishi, ishlab chiqarishga sarflanishi va sotuvga jo'natilishi
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500">
                  <th className="py-3 px-4 font-semibold">Sana</th>
                  <th className="py-3 px-4 font-semibold">Amal Turi</th>
                  <th className="py-3 px-4 font-semibold">Tovar / Xomashyo</th>
                  <th className="py-3 px-4 font-semibold">Miqdor</th>
                  <th className="py-3 px-4 font-semibold">Oldingi / Yangi Qoldiq</th>
                  <th className="py-3 px-4 font-semibold">Sabab / Hujjat</th>
                  <th className="py-3 px-4 font-semibold">Mas'ul Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      Hozircha ombor harakatlari qayd etilmagan.
                    </td>
                  </tr>
                ) : (
                  stockMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {formatDate(m.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {m.type === 'in' ? (
                          <span className="text-emerald-500 font-semibold">+ Kirim</span>
                        ) : (
                          <span className="text-rose-500 font-semibold">- Sarf / Chiqim</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        {m.itemName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {m.type === 'in' ? '+' : '-'}
                        {formatNumber(m.quantity)}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                        {m.previousQty} → <span className="font-bold text-neutral-200">{m.newQty}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {m.reason}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {m.operator}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Items Table */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400">
                  <th className="py-3 px-4 font-semibold">SKU Kodi</th>
                  <th className="py-3 px-4 font-semibold">Nomi</th>
                  <th className="py-3 px-4 font-semibold">Toifa</th>
                  <th className="py-3 px-4 font-semibold">Joylashuvi</th>
                  <th className="py-3 px-4 font-semibold text-right">Qoldiq</th>
                  <th className="py-3 px-4 font-semibold text-right">Tannarxi</th>
                  <th className="py-3 px-4 font-semibold text-right">Sotuv Narxi</th>
                  <th className="py-3 px-4 font-semibold text-right">Umumiy Qiymati</th>
                  <th className="py-3 px-4 font-semibold text-center">Tezkor Amal</th>
                  <th className="py-3 px-4 font-semibold text-center">Boshqaruv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-medium">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-neutral-400">
                      Tovarlar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.quantity <= item.minStockAlert;
                    const totalVal = item.quantity * (item.category === 'finished_product' ? (item.sellingPrice || item.unitCost) : item.unitCost);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${
                          isLow ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                          {item.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            {item.name}
                            {isLow && (
                              <span className="text-[10px] text-amber-500 font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
                                Kam qoldi!
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-neutral-500">
                          {item.category === 'finished_product' ? 'Tayyor Mahsulot' : 'Xomashyo'}
                        </td>
                        <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                          {item.location}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-right whitespace-nowrap">
                          <span className={`font-bold ${isLow ? 'text-amber-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {formatNumber(item.quantity)} {item.unit}
                          </span>
                          <span className="block text-[10px] text-neutral-400">
                            Min: {item.minStockAlert}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-right text-neutral-500 whitespace-nowrap">
                          {formatUZS(item.unitCost)}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-right text-neutral-900 dark:text-neutral-200 whitespace-nowrap font-semibold">
                          {item.category === 'finished_product' && item.sellingPrice
                            ? formatUZS(item.sellingPrice)
                            : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-right font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                          {formatUZS(totalVal)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openAdjustStock(item, 'in')}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md transition-colors cursor-pointer"
                              title="Kirim qilish"
                            >
                              + Kirim
                            </button>
                            <button
                              onClick={() => openAdjustStock(item, 'out')}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors cursor-pointer"
                              title="Sarf qilish"
                            >
                              - Sarf
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 text-neutral-400">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 hover:text-amber-500 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteWarehouseItem(item.id)}
                              className="p-1.5 hover:text-rose-500 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* Modal: Tovar Qo'shish / Tahrirlash */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsItemModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {editingItem ? 'Tovarni Tahrirlash' : 'Yangi Tovar / Xomashyo Qo\'shish'}
              </h2>
              <p className="text-xs text-neutral-500">
                Ombor bazasiga mahsulot yoki xomashyo kiritish
              </p>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tovar / Xomashyo Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Polietilen quvur d110mm yoki Polietilen granula PE-100"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Toifasi *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="finished_product">Tayyor Mahsulot</option>
                    <option value="raw_material">Xomashyo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    SKU / Identifikator Kodi *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    O'lchov Birligi *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ItemUnit)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="dona">dona</option>
                    <option value="kg">kg</option>
                    <option value="metr">metr</option>
                    <option value="litr">litr</option>
                    <option value="tonna">tonna</option>
                    <option value="quti">quti</option>
                    <option value="rulon">rulon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Hozirgi Qoldiq *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Minimal Xavfsiz Qoldiq
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="100"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tannarxi (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Masalan: 28500"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Sotuv Narxi (UZS) {category === 'finished_product' ? '*' : '(Ixtiyoriy)'}
                  </label>
                  <input
                    type="number"
                    placeholder="Masalan: 42000"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Ombordagi Joylashuvi (Sektor / Polka)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 1-Angar / A-14 polkasi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  {editingItem ? 'O\'zgarishlarni Saqlash' : 'Tovarni Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stock Kirim / Sarf Adjustment */}
      {isAdjustModalOpen && selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                {adjustType === 'in' ? (
                  <span className="text-emerald-500">+ Omborga Kirim Qilish</span>
                ) : (
                  <span className="text-rose-500">- Ombordan Sarf / Chiqim Qilish</span>
                )}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {selectedItemForAdjust.name} ({selectedItemForAdjust.code})
              </p>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs flex justify-between">
              <span className="text-neutral-500">Mavjud qoldiq:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                {selectedItemForAdjust.quantity} {selectedItemForAdjust.unit}
              </span>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {adjustType === 'in' ? 'Qabul qilinayotgan miqdor *' : 'Sarflanayotgan miqdor *'} ({selectedItemForAdjust.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Masalan: 500"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Sabab yoki Hujjat Raqami *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                    adjustType === 'in'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {adjustType === 'in' ? 'Kirimni Tasdiqlash' : 'Sarfni Tasdiqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

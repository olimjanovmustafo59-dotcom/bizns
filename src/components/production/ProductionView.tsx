/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Play,
  CheckCircle2,
  AlertOctagon,
  Percent,
  Clock,
  Trash2,
  X,
  Gauge,
  Layers,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { formatUZS, formatNumber, formatDate } from '../../utils/formatters';
import { ProductionBatch, ProductionMaterialRequirement, ProductionStatus } from '../../types';

export const ProductionView: React.FC = () => {
  const {
    productionBatches,
    warehouse,
    addProductionBatch,
    updateProductionBatchStatus,
    deleteProductionBatch,
  } = useFactory();

  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedBatchForComplete, setSelectedBatchForComplete] = useState<ProductionBatch | null>(null);

  // Form State for New Batch
  const [selectedProductId, setSelectedProductId] = useState('');
  const [targetQuantity, setTargetQuantity] = useState<number | ''>('');
  const [shift, setShift] = useState<'day' | 'night'>('day');
  const [supervisor, setSupervisor] = useState('Shavkat Po\'latov');
  const [notes, setNotes] = useState('');
  // Raw material selection
  const [selectedMaterials, setSelectedMaterials] = useState<
    { materialId: string; quantity: number }[]
  >([]);

  // Completion Form State
  const [actualQty, setActualQty] = useState<number | ''>('');
  const [defectiveQty, setDefectiveQty] = useState<number | ''>(0);

  const finishedProducts = warehouse.filter((i) => i.category === 'finished_product');
  const rawMaterials = warehouse.filter((i) => i.category === 'raw_material');

  const openNewBatchModal = () => {
    if (finishedProducts.length > 0) {
      setSelectedProductId(finishedProducts[0].id);
    }
    setTargetQuantity(1000);
    setShift('day');
    setSupervisor('Shavkat Po\'latov');
    setNotes('');
    // Auto populate 1st raw material if available
    if (rawMaterials.length > 0) {
      setSelectedMaterials([{ materialId: rawMaterials[0].id, quantity: 1.5 }]);
    } else {
      setSelectedMaterials([]);
    }
    setIsNewBatchModalOpen(true);
  };

  const handleAddMaterialRow = () => {
    if (rawMaterials.length > 0) {
      setSelectedMaterials((prev) => [
        ...prev,
        { materialId: rawMaterials[0].id, quantity: 1 },
      ]);
    }
  };

  const handleRemoveMaterialRow = (idx: number) => {
    setSelectedMaterials((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMaterialChange = (idx: number, field: 'materialId' | 'quantity', val: any) => {
    setSelectedMaterials((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const product = warehouse.find((i) => i.id === selectedProductId);
    if (!product || !targetQuantity || Number(targetQuantity) <= 0) return;

    // Calculate raw materials requirements with costs
    let totalMaterialCost = 0;
    const materialReqs: ProductionMaterialRequirement[] = selectedMaterials.map((m) => {
      const matItem = warehouse.find((w) => w.id === m.materialId);
      const cost = (matItem?.unitCost || 0) * (Number(m.quantity) || 0);
      totalMaterialCost += cost;
      return {
        materialId: m.materialId,
        materialName: matItem?.name || 'Noma\'lum xomashyo',
        quantity: Number(m.quantity) || 0,
        unit: matItem?.unit || 'kg',
        cost,
      };
    });

    const batchNum = `PART-2026-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    const initialUnitCost =
      Number(targetQuantity) > 0 ? Math.round(totalMaterialCost / Number(targetQuantity)) : 0;

    addProductionBatch({
      batchNumber: batchNum,
      productId: product.id,
      productName: product.name,
      targetQuantity: Number(targetQuantity),
      actualQuantity: 0,
      defectiveQuantity: 0,
      rawMaterialsUsed: materialReqs,
      totalCost: totalMaterialCost,
      unitCost: initialUnitCost,
      efficiencyRate: 0,
      status: 'in_progress',
      shift,
      supervisor,
      startDate: today,
      notes,
    });

    setIsNewBatchModalOpen(false);
  };

  const openCompleteModal = (batch: ProductionBatch) => {
    setSelectedBatchForComplete(batch);
    setActualQty(batch.actualQuantity > 0 ? batch.actualQuantity : batch.targetQuantity);
    setDefectiveQty(batch.defectiveQuantity || 0);
    setIsCompleteModalOpen(true);
  };

  const handleSaveComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForComplete || actualQty === '') return;

    updateProductionBatchStatus(
      selectedBatchForComplete.id,
      'completed',
      Number(actualQty),
      Number(defectiveQty) || 0
    );
    setIsCompleteModalOpen(false);
  };

  // Metrics
  const activeBatchesCount = productionBatches.filter((b) => b.status === 'in_progress').length;
  const completedBatches = productionBatches.filter((b) => b.status === 'completed');
  const avgEfficiency =
    completedBatches.length > 0
      ? (
          completedBatches.reduce((sum, b) => sum + b.efficiencyRate, 0) /
          completedBatches.length
        ).toFixed(1)
      : '98.0';

  const totalDefects = productionBatches.reduce((sum, b) => sum + b.defectiveQuantity, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Faol Ishlab Chiqarish</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {activeBatchesCount} ta liniya
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Hozirda sexda ishlamoqda</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">O'rtacha Samaradorlik (OEE)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {avgEfficiency}%
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Reja va sifat ko'rsatkichi</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Jami Brak Mahsulotlar</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatNumber(totalDefects)} birlik
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Qayta eritishga yuborilgan</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Bajarilgan Partiyalar</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {completedBatches.length} ta partiya
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Omborga qabul qilingan</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Ishlab Chiqarish Partiyalari Jurnali
          </h2>
          <p className="text-xs text-neutral-500">
            Rejalashtirilgan, jarayondagi va tayyor bo'lgan partiyalar nazorati
          </p>
        </div>

        <button
          onClick={openNewBatchModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Yangi Partiya Boshlash</span>
        </button>
      </div>

      {/* Production Batches List */}
      <div className="space-y-4">
        {productionBatches.map((batch) => {
          const isDone = batch.status === 'completed';
          const isProg = batch.status === 'in_progress';

          return (
            <div
              key={batch.id}
              className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : isProg
                        ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-500">
                        {batch.batchNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                          isDone
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : isProg
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {isDone ? 'Yakunlangan' : isProg ? 'Jarayonda' : 'Rejalashtirilgan'}
                      </span>
                      <span className="text-xs text-neutral-400">
                        · {batch.shift === 'day' ? 'Kunduzgi smena' : 'Tungi smena'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                      {batch.productName}
                    </h3>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isProg && (
                    <button
                      onClick={() => openCompleteModal(batch)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Partiyani Yakunlash</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteProductionBatch(batch.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Grid: Plan vs Actual, Scrap, Unit Cost, Efficiency */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 block">Rejalashtirilgan:</span>
                  <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {formatNumber(batch.targetQuantity)} birlik
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Haqiqiy Chiqish:</span>
                  <span className="font-mono text-sm font-bold text-emerald-500">
                    {formatNumber(batch.actualQuantity || 0)} birlik
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Brak / Nuqsonli:</span>
                  <span className="font-mono text-sm font-bold text-rose-500">
                    {batch.defectiveQuantity || 0} dona
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">1 dona Tannarxi:</span>
                  <span className="font-mono text-sm font-bold text-amber-500">
                    {formatUZS(batch.unitCost)}
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 block">Samaradorlik (OEE):</span>
                  <span className="font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {batch.efficiencyRate > 0 ? `${batch.efficiencyRate}%` : 'Hisoblanmoqda...'}
                  </span>
                </div>
              </div>

              {/* Bottom: Raw materials used & Supervisor */}
              <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Sarflangan Xomashyo:
                  </span>
                  {batch.rawMaterialsUsed.map((mat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]"
                    >
                      {mat.materialName}: <b>{mat.quantity} {mat.unit}</b> ({formatUZS(mat.cost)})
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-neutral-400">
                  Usta: <span className="text-neutral-200">{batch.supervisor}</span> · Sana: {formatDate(batch.startDate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Start New Batch */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewBatchModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-500" />
                Yangi Ishlab Chiqarish Partiyasini Boshlash
              </h2>
              <p className="text-xs text-neutral-500">
                Reja belgilash va sarflanadigan xomashyolarni ombordan yechish
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Ishlab Chiqariladigan Mahsulot *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                >
                  {finishedProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rejalashtirilgan Miqdor *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Masalan: 3000"
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ish Smenasi *
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="day">Kunduzgi smena (08:00 - 20:00)</option>
                    <option value="night">Tungi smena (20:00 - 08:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Mas'ul Usta / Muhandis *
                  </label>
                  <input
                    type="text"
                    required
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Raw Materials Required */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-900 dark:text-neutral-200">
                    Ishlatiladigan Xomashyolar (Ombordan sarflanadi)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 cursor-pointer"
                  >
                    + Xomashyo qatori qo'shish
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedMaterials.map((row, idx) => {
                    const mat = warehouse.find((w) => w.id === row.materialId);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={row.materialId}
                          onChange={(e) => handleMaterialChange(idx, 'materialId', e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                        >
                          {rawMaterials.map((rm) => (
                            <option key={rm.id} value={rm.id}>
                              {rm.name} (Qoldiq: {rm.quantity} {rm.unit})
                            </option>
                          ))}
                        </select>

                        <div className="w-28 relative">
                          <input
                            type="number"
                            step="any"
                            placeholder="Miqdor"
                            value={row.quantity}
                            onChange={(e) =>
                              handleMaterialChange(idx, 'quantity', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-neutral-400">
                            {mat?.unit}
                          </span>
                        </div>

                        {selectedMaterials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(idx)}
                            className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Sexga Ko'rsatma / Izoh
                </label>
                <textarea
                  rows={2}
                  placeholder="Texnologik rejim talablari, harorat yoki buyurtmachi shartlari..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewBatchModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Partiyani Boshlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Batch */}
      {isCompleteModalOpen && selectedBatchForComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsCompleteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Partiyani Yakunlash va Qabul Qilish
              </h2>
              <p className="text-xs text-neutral-500">
                {selectedBatchForComplete.batchNumber} · {selectedBatchForComplete.productName}
              </p>
            </div>

            <form onSubmit={handleSaveComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Haqiqiy Tayyor Bo'lgan Miqdor (Sifatli Mahsulot) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={actualQty}
                  onChange={(e) => setActualQty(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Reja: {selectedBatchForComplete.targetQuantity} birlik edi. Ushbu miqdor avtomatik omborga kirim qilinadi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Brak / Yaroqsiz Mahsulotlar Soni (Nuqsonli)
                </label>
                <input
                  type="number"
                  step="any"
                  value={defectiveQty}
                  onChange={(e) => setDefectiveQty(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Tasdiqlash va Omborga Kirim Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

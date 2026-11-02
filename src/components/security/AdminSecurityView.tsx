/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Lock,
  KeyRound,
  FileText,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { UserRole } from '../../types';
import { ROLE_LABELS } from '../../utils/formatters';
import { INITIAL_USERS } from '../../data/initialData';

export const AdminSecurityView: React.FC = () => {
  const {
    currentUser,
    switchUser,
    auditLogs,
    resetToDemoData,
    clearAllData,
    exportBackupJSON,
    importBackupJSON,
  } = useFactory();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('Zaxira nusxasi muvaffaqiyatli tiklandi!');
        } else {
          setImportStatus('Fayl formati noto\'g\'ri yoki shikastlangan!');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // RBAC Matrix
  const permissionsMatrix = [
    {
      feature: 'Boshqaruv Paneli (Dashboard)',
      boss: true,
      accountant: true,
      production_mgr: true,
      warehouse_mgr: true,
    },
    {
      feature: 'Kassa va Moliya (Kirim/Chiqim)',
      boss: true,
      accountant: true,
      production_mgr: false,
      warehouse_mgr: false,
    },
    {
      feature: 'Ombor Boshqaruvi (Sklad)',
      boss: true,
      accountant: true,
      production_mgr: true,
      warehouse_mgr: true,
    },
    {
      feature: 'Ishlab Chiqarish Sehi',
      boss: true,
      accountant: false,
      production_mgr: true,
      warehouse_mgr: false,
    },
    {
      feature: 'Sotuv Bo\'limi (CRM va Faktura)',
      boss: true,
      accountant: true,
      production_mgr: false,
      warehouse_mgr: false,
    },
    {
      feature: 'Xodimlar va Oylik Maoshlar',
      boss: true,
      accountant: true,
      production_mgr: false,
      warehouse_mgr: false,
    },
    {
      feature: 'Boss Maxsus Hisoboti (Eksklyuziv)',
      boss: true,
      accountant: false,
      production_mgr: false,
      warehouse_mgr: false,
    },
    {
      feature: 'Tizimni Tozalash va Zaxira Qilish',
      boss: true,
      accountant: false,
      production_mgr: false,
      warehouse_mgr: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Active Account Card */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${currentUser.avatarColor} text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md`}
            >
              {currentUser.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {currentUser.title}
              </p>
            </div>
          </div>

          {/* Quick Role Tester */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium">
              Rolni sinab ko'rish:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {INITIAL_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => switchUser(u.role)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentUser.role === u.role
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white'
                  }`}
                >
                  {u.role === 'boss'
                    ? 'Boss'
                    : u.role === 'accountant'
                    ? 'Buxgalter'
                    : u.role === 'production_mgr'
                    ? 'Sex Boshlig\'i'
                    : 'Omborchi'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Rollar va Ruxsatlar Huquqi Matritsasi (RBAC)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Har bir lavozim faqat o'ziga ruxsat etilgan bo'limlar bilan ishlaydi. Faqat Boss to'liq boshqaruvga ega.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500">
                <th className="py-3 px-4 font-semibold">Tizim Funksiyasi / Bo'lim</th>
                <th className="py-3 px-4 font-semibold text-center">Boss (Super Admin)</th>
                <th className="py-3 px-4 font-semibold text-center">Bosh Buxgalter</th>
                <th className="py-3 px-4 font-semibold text-center">Sex Boshlig'i</th>
                <th className="py-3 px-4 font-semibold text-center">Omborchi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center text-emerald-500 font-bold">
                      ✓ Ruxsat
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.accountant ? (
                      <span className="inline-flex items-center text-emerald-500 font-bold">
                        ✓ Ruxsat
                      </span>
                    ) : (
                      <span className="text-neutral-400">✗ Cheklangan</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.production_mgr ? (
                      <span className="inline-flex items-center text-emerald-500 font-bold">
                        ✓ Ruxsat
                      </span>
                    ) : (
                      <span className="text-neutral-400">✗ Cheklangan</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.warehouse_mgr ? (
                      <span className="inline-flex items-center text-emerald-500 font-bold">
                        ✓ Ruxsat
                      </span>
                    ) : (
                      <span className="text-neutral-400">✗ Cheklangan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Backup & Data Management (Demo vs Real) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Restore */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Zaxira Nusxa (Backup & Restore)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Zavodning barcha kassa, ombor, ishlab chiqarish va xodimlar ma'lumotlarini to'liq JSON faylga yuklab oling yoki saqlangan nusxadan qayta tiklang.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={exportBackupJSON}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Zaxira Faylini Yuklab Olish (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Nusxadan Tiklash</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
              {importStatus}
            </div>
          )}
        </div>

        {/* Demo vs Real Mode Controls */}
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Demo va Haqiqiy Ish Rejimi
            </h3>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Ilovani real ishlab chiqarishda ishlatish uchun barcha demo ma'lumotlarni tozalab, haqiqiy bo'sh zavod rejimiga o'tishingiz yoki kerak bo'lsa demo ma'lumotlarni qayta tiklashingiz mumkin.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={resetToDemoData}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Demo Ma'lumotlarni Qayta Tiklash</span>
            </button>

            {currentUser.role === 'boss' && (
              <button
                onClick={clearAllData}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Barchasini Tozalash (Haqiqiy Rejim)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security Audit Trail Log */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Tizim Xavfsizlik Audit Jurnali (Audit Log)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Kim, qachon va qaysi modulda ma'lumot kiritgani yoki o'zgartirgani qat'iy nazoratda
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500">
                <th className="py-3 px-4 font-semibold">Vaqt</th>
                <th className="py-3 px-4 font-semibold">Foydalanuvchi</th>
                <th className="py-3 px-4 font-semibold">Rol</th>
                <th className="py-3 px-4 font-semibold">Modul</th>
                <th className="py-3 px-4 font-semibold">Amal Tafsiloti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    Audit yozuvlari mavjud emas
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 px-4 font-mono text-neutral-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-amber-500 whitespace-nowrap">
                      {log.userRole.toUpperCase()}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500 uppercase font-mono text-[11px] whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-700 dark:text-neutral-300">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

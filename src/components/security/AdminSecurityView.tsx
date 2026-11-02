/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Plus,
  Edit2,
  Lock,
  KeyRound,
  FileText,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Sparkles,
  X,
  BadgeCheck,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { UserRole, UserProfile } from '../../types';
import { ROLE_LABELS } from '../../utils/formatters';

const AVATAR_COLORS = [
  { label: 'Oltinrang (Amber)', class: 'bg-amber-600' },
  { label: 'Ko\'k (Blue)', class: 'bg-blue-600' },
  { label: 'Binafsharang (Violet)', class: 'bg-violet-600' },
  { label: 'Yashil (Emerald)', class: 'bg-emerald-600' },
  { label: 'Qizil (Rose)', class: 'bg-rose-600' },
  { label: 'Moviy (Cyan)', class: 'bg-cyan-600' },
];

export const AdminSecurityView: React.FC = () => {
  const {
    users,
    currentUser,
    switchUserById,
    addUser,
    updateUser,
    deleteUser,
    auditLogs,
    resetToDemoData,
    clearAllData,
    exportBackupJSON,
    importBackupJSON,
  } = useFactory();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Add/Edit Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('production_mgr');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [pinCode, setPinCode] = useState('');
  const [avatarColor, setAvatarColor] = useState('bg-blue-600');

  const openAddUserModal = (defaultRole: UserRole = 'production_mgr') => {
    setEditingUser(null);
    setName('');
    setRole(defaultRole);
    setTitle(
      defaultRole === 'boss'
        ? 'Bosh Direktor (Zavod Asoschisi)'
        : defaultRole === 'production_mgr'
        ? 'Ish Boshqaruvchi (Sex Boshlig\'i)'
        : defaultRole === 'warehouse_mgr'
        ? 'Bosh Omborchi (Sklad)'
        : 'Bosh Buxgalter'
    );
    setPhone('+998 ');
    setPinCode(String(Math.floor(1000 + Math.random() * 9000)));
    setAvatarColor(
      defaultRole === 'boss'
        ? 'bg-amber-600'
        : defaultRole === 'production_mgr'
        ? 'bg-blue-600'
        : defaultRole === 'warehouse_mgr'
        ? 'bg-violet-600'
        : 'bg-emerald-600'
    );
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: UserProfile) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setTitle(user.title);
    setPhone(user.phone || '+998 ');
    setPinCode(user.pinCode || '');
    setAvatarColor(user.avatarColor || 'bg-amber-600');
    setIsUserModalOpen(true);
  };

  const handleRoleChangeInForm = (newRole: UserRole) => {
    setRole(newRole);
    if (!editingUser) {
      setTitle(
        newRole === 'boss'
          ? 'Bosh Direktor (Zavod Asoschisi)'
          : newRole === 'production_mgr'
          ? 'Ish Boshqaruvchi (Sex Boshlig\'i)'
          : newRole === 'warehouse_mgr'
          ? 'Bosh Omborchi (Sklad)'
          : 'Bosh Buxgalter'
      );
      setAvatarColor(
        newRole === 'boss'
          ? 'bg-amber-600'
          : newRole === 'production_mgr'
          ? 'bg-blue-600'
          : newRole === 'warehouse_mgr'
          ? 'bg-violet-600'
          : 'bg-emerald-600'
      );
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        role,
        title: title.trim() || ROLE_LABELS[role].title,
        phone: phone.trim(),
        pinCode: pinCode.trim(),
        avatarColor,
      });
    } else {
      addUser({
        name: name.trim(),
        role,
        title: title.trim() || ROLE_LABELS[role].title,
        phone: phone.trim(),
        pinCode: pinCode.trim() || '1234',
        avatarColor,
      });
    }
    setIsUserModalOpen(false);
  };

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
      {/* 1. Zavod Mas'ullari va Akkauntlar Boshqaruvi (Boss, Ish Boshqaruvchi, Omborchi, Buxgalter) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Zavod Mas'ullari va Akkauntlar Boshqaruvi
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Boss (Direktor), Ish boshqaruvchi (Manager), Bosh omborchi va Buxgalterni o'zingiz kiritishingiz, ism-familiyalarini tahrirlashingiz va yangi mas'ullar qo'shishingiz mumkin.
            </p>
          </div>

          <button
            onClick={() => openAddUserModal('production_mgr')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap self-end sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Mas'ul Qo'shish</span>
          </button>
        </div>

        {/* Users Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => {
            const isActive = currentUser.id === u.id;
            return (
              <div
                key={u.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-amber-500/60 bg-amber-500/5 dark:bg-amber-500/10 ring-1 ring-amber-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${u.avatarColor} text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {u.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                          {u.name}
                        </h4>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20">
                            <BadgeCheck className="w-3 h-3" />
                            Faol Tizimda
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                        {u.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mt-1">
                        <span>Rol: <b>{u.role.toUpperCase()}</b></span>
                        {u.phone && <span>· Tel: {u.phone}</span>}
                        {u.pinCode && <span>· PIN: {u.pinCode}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditUserModal(u)}
                      className="p-1.5 text-neutral-400 hover:text-amber-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                      title="Ism va lavozimni tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {users.length > 1 && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Switch to this user button */}
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    {u.role === 'boss'
                      ? 'Barcha hisobot va kassa ruxsati'
                      : u.role === 'production_mgr'
                      ? 'Ishlab chiqarish va sex liniyasi'
                      : u.role === 'warehouse_mgr'
                      ? 'Ombor qoldiqlari va kirim/sarf'
                      : 'Moliya, kassa va oyliklar'}
                  </span>

                  {!isActive ? (
                    <button
                      onClick={() => switchUserById(u.id)}
                      className="px-3 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-md transition-colors cursor-pointer"
                    >
                      Shu akkauntga o'tish →
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-amber-500">
                      Hozir siz shu profildasiz
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
                <th className="py-3 px-4 font-semibold text-center">Ish Boshqaruvchi</th>
                <th className="py-3 px-4 font-semibold text-center">Omborchi</th>
                <th className="py-3 px-4 font-semibold text-center">Bosh Buxgalter</th>
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
                  <td className="py-3 px-4 text-center">
                    {row.accountant ? (
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
            Zavodning barcha kassa, ombor, ishlab chiqarish, mas'ullar va xodimlar ma'lumotlarini to'liq JSON faylga yuklab oling yoki saqlangan nusxadan qayta tiklang.
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

      {/* Modal: Add / Edit User (Boss, Ish boshqaruvchi, Omborchi, Buxgalter) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                {editingUser ? 'Mas\'ul Ma\'lumotlarini Tahrirlash' : 'Yangi Mas\'ul Akkaunt Qo\'shish'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Boss, Ish boshqaruvchi, Omborchi yoki Buxgalter ma'lumotlarini o'zingiz belgilang
              </p>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mas'ul F.I.O (Ism va Familiya) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Mustafo Olimjanov yoki Akmal Valiyev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tizimdagi Roli (Huquqi) *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChangeInForm(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="boss">Boss (Super Admin — To'liq huquq)</option>
                    <option value="production_mgr">Ish Boshqaruvchi (Sex va Liniya)</option>
                    <option value="warehouse_mgr">Omborchi (Sklad va Qoldiqlar)</option>
                    <option value="accountant">Bosh Buxgalter (Kassa va Moliya)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rasmiy Lavozimi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Zavod Boshqaruvchisi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kirish PIN Kodi / Parol
                  </label>
                  <input
                    type="text"
                    placeholder="4 xonali PIN yoki parol..."
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Profil Rangi (Avatar)
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.class}
                      onClick={() => setAvatarColor(c.class)}
                      className={`w-7 h-7 rounded-lg ${c.class} transition-transform cursor-pointer ${
                        avatarColor === c.class ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
                >
                  {editingUser ? 'O\'zgarishlarni Saqlash' : 'Akkauntni Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

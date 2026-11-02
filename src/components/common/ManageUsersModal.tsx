/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  X,
  Check,
  Building,
  UserCheck,
  Shield,
  Phone,
  Briefcase,
  Plus,
  Trash2,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { UserProfile, UserRole } from '../../types';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoleToEdit?: UserRole;
}

export const ManageUsersModal: React.FC<ManageUsersModalProps> = ({
  isOpen,
  onClose,
  initialRoleToEdit,
}) => {
  const {
    users,
    updateUserProfile,
    addUserProfile,
    deleteUserProfile,
    factoryName,
    setFactoryName,
    factoryLocation,
    setFactoryLocation,
  } = useFactory();

  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (initialRoleToEdit) {
      const match = users.find((u) => u.role === initialRoleToEdit);
      if (match) return match.id;
    }
    return users[0]?.id || '';
  });

  // Editing state for the selected user
  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const [name, setName] = useState(selectedUser?.name || '');
  const [title, setTitle] = useState(selectedUser?.title || '');
  const [phone, setPhone] = useState(selectedUser?.phone || '');
  const [avatarColor, setAvatarColor] = useState(selectedUser?.avatarColor || 'bg-amber-600');

  // Factory settings state
  const [tempFactoryName, setTempFactoryName] = useState(factoryName);
  const [tempFactoryLocation, setTempFactoryLocation] = useState(factoryLocation);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('production_mgr');

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUserId(user.id);
    setName(user.name);
    setTitle(user.title);
    setPhone(user.phone || '');
    setAvatarColor(user.avatarColor);
    setIsAddingNew(false);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isAddingNew) {
      addUserProfile({
        role: newRole,
        name: name.trim(),
        title: title.trim() || 'Mas\'ul xodim',
        avatarColor,
        phone: phone.trim(),
      });
      setIsAddingNew(false);
    } else if (selectedUser) {
      updateUserProfile(selectedUser.id, {
        name: name.trim(),
        title: title.trim(),
        phone: phone.trim(),
        avatarColor,
      });
    }

    // Also update factory info if changed
    if (tempFactoryName.trim()) {
      setFactoryName(tempFactoryName.trim());
    }
    if (tempFactoryLocation.trim()) {
      setFactoryLocation(tempFactoryLocation.trim());
    }
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setName('');
    setTitle('');
    setPhone('+998 ');
    setNewRole('production_mgr');
    setAvatarColor('bg-blue-600');
  };

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Sariq/Qahrabo', val: 'bg-amber-600' },
    { label: 'Zumrad Yashil', val: 'bg-emerald-600' },
    { label: 'Moviy Ko\'k', val: 'bg-blue-600' },
    { label: 'Binafsharang', val: 'bg-violet-600' },
    { label: 'Qizil/Qirmizi', val: 'bg-rose-600' },
    { label: 'Qora/Kulrang', val: 'bg-neutral-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Mas'ul Shaxslar va Foydalanuvchilarni Belgilash
              </h2>
              <p className="text-xs text-neutral-500">
                Boss, Ish boshqaruvchi (menejer), Omborchi va Buxgalter ismlarini o'zingiz xohlagancha o'zgartiring
              </p>
            </div>
          </div>
        </div>

        {/* Zavod Nomi va Joylashuvi (Tezkor o'zgartirish) */}
        <div className="p-4 mb-6 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
            <Building className="w-4 h-4 text-amber-500" />
            <span>Zavod / Korxona Bosh Ma'lumotlari</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Zavod / Kompaniya Nomi:
              </label>
              <input
                type="text"
                value={tempFactoryName}
                onChange={(e) => setTempFactoryName(e.target.value)}
                placeholder="Masalan: MEGA-PLAST ZAVODI"
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg font-bold text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Zavod Joylashgan Hudud:
              </label>
              <input
                type="text"
                value={tempFactoryLocation}
                onChange={(e) => setTempFactoryLocation(e.target.value)}
                placeholder="Masalan: Samarqand viloyati, Jomboy tumani"
                className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Foydalanuvchilar Ro'yxati (Tanlash uchun) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              O'zgartirish uchun mas'ul shaxsni tanlang:
            </span>
            <button
              onClick={startAddNew}
              className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi mas'ul qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {users.map((u) => {
              const isSelected = !isAddingNew && selectedUser?.id === u.id;
              const roleUz =
                u.role === 'boss'
                  ? 'BOSS (Asoschi)'
                  : u.role === 'production_mgr'
                  ? 'Ish Boshqaruvchi'
                  : u.role === 'warehouse_mgr'
                  ? 'Omborchi'
                  : 'Bosh Buxgalter';

              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-500'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-md ${u.avatarColor} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}
                    >
                      {u.name.slice(0, 1)}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-500 uppercase truncate">
                      {roleUz}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {u.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {u.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tahrirlash Formasi */}
        <form onSubmit={handleSaveUser} className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {isAddingNew
                ? 'Yangi Mas\'ul Xodim Qo\'shish'
                : `"${selectedUser?.name}" ma'lumotlarini tahrirlash`}
            </h3>

            {!isAddingNew && selectedUser?.role !== 'boss' && users.length > 2 && (
              <button
                type="button"
                onClick={() => deleteUserProfile(selectedUser.id)}
                className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ushbu akkauntni o'chirish</span>
              </button>
            )}
          </div>

          {isAddingNew && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Tizimdagi Roli / Huquqi *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
              >
                <option value="production_mgr">Ish Boshqaruvchi / Sex Mudiri</option>
                <option value="warehouse_mgr">Omborchi / Sklad Mudiri</option>
                <option value="accountant">Buxgalter / Moliyachi</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Ism va Familiyasi (F.I.O) *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Sardor Aliyev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Lavozimi (Rasmiy Nomi) *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Zavod Asoschisi yoki Bosh Omborchi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
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
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Avatar Rangi
              </label>
              <div className="flex items-center gap-2 pt-1">
                {colorOptions.map((c) => (
                  <button
                    type="button"
                    key={c.val}
                    onClick={() => setAvatarColor(c.val)}
                    className={`w-7 h-7 rounded-lg ${c.val} transition-transform ${
                      avatarColor === c.val ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              Yopish
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Saqlash va Tasdiqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

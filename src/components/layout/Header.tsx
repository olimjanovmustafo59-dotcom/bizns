/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Calendar,
  Building2,
  Lock,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { NavTab } from './Sidebar';
import { TimeFilter } from '../../types';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobile: () => void;
  onOpenQuickAdd: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Boshqaruv Paneli',
    subtitle: 'Zavodning asosiy operatsion va moliyaviy ko\'rsatkichlari',
  },
  finance: {
    title: 'Kirim va Chiqim (Kassa)',
    subtitle: 'Barcha kassa operatsiyalari, xarajatlar va tushumlar hisobi',
  },
  warehouse: {
    title: 'Ombor Boshqaruvi',
    subtitle: 'Xomashyo va tayyor mahsulotlar qoldiqlari, kirim-chiqim',
  },
  production: {
    title: 'Ishlab Chiqarish Sehi',
    subtitle: 'Ishlab chiqarish partiyalari, tannarx va OEE samaradorlik',
  },
  sales: {
    title: 'Sotuv Bo\'limi va Mijozlar',
    subtitle: 'Mahsulot sotuvi, to\'lovlar va mijozlar qarzdorligi (Nasiyalar)',
  },
  employees: {
    title: 'Xodimlar va Oylik Maosh',
    subtitle: 'Xodimlar davomati, oylik maoshlar, bonus va jarimalar',
  },
  boss_report: {
    title: 'Boss Eksklyuziv Hisoboti',
    subtitle: 'Zavod egasi (BOSS) uchun chuqur moliyaviy va strategik tahlillar',
  },
  security: {
    title: 'Admin va Xavfsizlik',
    subtitle: 'Rollar huquqlari (RBAC), tizim audit jurnali va zaxira nusxa',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  onOpenQuickAdd,
}) => {
  const {
    isDarkMode,
    toggleDarkMode,
    timeFilter,
    setTimeFilter,
    currentUser,
    users,
    switchUserById,
  } = useFactory();

  const tabInfo = TAB_TITLES[currentTab] || {
    title: 'ZavodPro',
    subtitle: 'Sanoat Boshqaruvi',
  };

  const timeFilterLabels: { id: TimeFilter; label: string }[] = [
    { id: 'today', label: 'Bugun' },
    { id: 'week', label: 'Hafta' },
    { id: 'month', label: 'Oy' },
    { id: 'year', label: 'Yil' },
    { id: 'all', label: 'Barchasi' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Left: Mobile menu button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white md:hidden rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Menyu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {tabInfo.title}
            </h1>
            {currentTab === 'boss_report' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Lock className="w-3 h-3" />
                Faqat Boss
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block truncate max-w-md">
            {tabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Factory name badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
          <Building2 className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            "TEXNO-PLAST"
          </span>
          <span className="text-neutral-400">· Toshkent</span>
        </div>

        {/* Time Filter Segmented Buttons */}
        <div className="hidden lg:flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Calendar className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-1" />
          {timeFilterLabels.map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeFilter(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                timeFilter === item.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Quick Add Button */}
        {currentUser.role !== 'warehouse_mgr' && (
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yangi Amal</span>
          </button>
        )}

        {/* Quick User Switcher in Header */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-neutral-200 dark:border-neutral-800">
          <div
            className={`w-7 h-7 rounded-lg ${currentUser.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}
            title={`${currentUser.name} (${currentUser.title})`}
          >
            {currentUser.name.slice(0, 1).toUpperCase()}
          </div>
          <select
            value={currentUser.id}
            onChange={(e) => switchUserById(e.target.value)}
            className="hidden sm:block max-w-[150px] text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer truncate"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'boss' ? 'Boss' : u.role === 'production_mgr' ? 'Ish boshqaruvchi' : u.role === 'warehouse_mgr' ? 'Omborchi' : 'Buxgalter'})
              </option>
            ))}
          </select>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          title={isDarkMode ? 'Yorug\' rejimga o\'tish' : 'Tungi rejimga o\'tish'}
          aria-label="Mavzu almashtirish"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

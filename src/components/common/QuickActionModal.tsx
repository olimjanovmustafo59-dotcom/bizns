/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Boxes,
  Factory,
  ShoppingBag,
  Users,
  X,
  ChevronRight,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: NavTab) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions: {
    id: NavTab;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      id: 'finance',
      title: 'Kirim / Tushum Qo\'shish',
      description: 'Mijozlardan to\'lov, mahsulot sotuvi yoki kassa daromadi',
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      id: 'finance',
      title: 'Chiqim / Xarajat Qo\'shish',
      description: 'Xomashyo xaridi, elektr quvvati, ta\'mirlash yoki maosh',
      icon: TrendingDown,
      color: 'bg-rose-500/10 text-rose-500',
    },
    {
      id: 'production',
      title: 'Yangi Ishlab Chiqarish Partiyasi',
      description: 'Sexda yangi mahsulot liniyasini ishga tushirish va reja',
      icon: Factory,
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      id: 'sales',
      title: 'Yangi Mahsulot Sotuvini Qayd Etish',
      description: 'Xaridorga tovar jo\'natish, hisob-faktura rasmiylashtirish',
      icon: ShoppingBag,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: 'warehouse',
      title: 'Omborga Tovar Kirim / Chiqim Qilish',
      description: 'Xomashyo qabul qilish yoki qoldiqlarni qayta hisoblash',
      icon: Boxes,
      color: 'bg-violet-500/10 text-violet-500',
    },
    {
      id: 'employees',
      title: 'Davomat Belgilash & Maosh',
      description: 'Ishchilarning bugungi keldi-ketdisi va bonus/jarimalar',
      icon: Users,
      color: 'bg-cyan-500/10 text-cyan-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Tezkor Zavod Amaliyotlari
          </h2>
          <p className="text-xs text-neutral-500">
            Kerakli amaliyotni tanlang va tegishli bo'limga to'g'ridan-to'g'ri o'ting
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-all text-left cursor-pointer group"
              >
                <div className={`p-2 rounded-lg shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-500 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2 mt-0.5">
                    {act.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  ArrowUpDown,
  Boxes,
  Factory,
  ShoppingBag,
  Users,
  FileSpreadsheet,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { UserRole } from '../../types';

export type NavTab =
  | 'dashboard'
  | 'finance'
  | 'warehouse'
  | 'production'
  | 'sales'
  | 'employees'
  | 'boss_report'
  | 'security';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, switchUser, kpis } = useFactory();

  // Role-based permissions
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    roles: UserRole[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Boshqaruv Paneli',
      icon: LayoutDashboard,
      roles: ['boss', 'accountant', 'production_mgr', 'warehouse_mgr'],
    },
    {
      id: 'finance',
      label: 'Kirim va Chiqim',
      icon: ArrowUpDown,
      roles: ['boss', 'accountant'],
    },
    {
      id: 'warehouse',
      label: 'Ombor Boshqaruvi',
      icon: Boxes,
      badge: kpis.lowStockItemsCount > 0 ? kpis.lowStockItemsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
      roles: ['boss', 'accountant', 'production_mgr', 'warehouse_mgr'],
    },
    {
      id: 'production',
      label: 'Ishlab Chiqarish',
      icon: Factory,
      roles: ['boss', 'production_mgr'],
    },
    {
      id: 'sales',
      label: 'Sotuv Bo\'limi',
      icon: ShoppingBag,
      badge: kpis.unpaidDebtTotal > 0 ? 1 : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      roles: ['boss', 'accountant'],
    },
    {
      id: 'employees',
      label: 'Xodimlar & Maosh',
      icon: Users,
      roles: ['boss', 'accountant', 'production_mgr'],
    },
    {
      id: 'boss_report',
      label: 'Boss Hisoboti',
      icon: FileSpreadsheet,
      roles: ['boss'],
    },
    {
      id: 'security',
      label: 'Admin & Xavfsizlik',
      icon: ShieldAlert,
      roles: ['boss', 'accountant', 'production_mgr', 'warehouse_mgr'],
    },
  ];

  const handleNavClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between
          bg-neutral-900 border-r border-neutral-800 text-neutral-200
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Brand Section */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-950/40">
                <Factory className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-base tracking-tight text-white uppercase font-mono">
                    Zavod<span className="text-amber-500">Pro</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium truncate">
                    Sanoat Boshqaruv OS
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? "Kengaytirish" : "Yig'ish"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const hasAccess = item.roles.includes(currentUser.role);
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  disabled={!hasAccess}
                  title={!hasAccess ? `Faqat ${item.roles.join(', ')} uchun ruxsat` : item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : hasAccess
                      ? 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/80'
                      : 'text-neutral-600 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                        item.badgeColor || 'bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Current Role Card */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}
            >
              {currentUser.name.slice(0, 1)}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-amber-400 font-mono font-medium truncate">
                    {currentUser.role === 'boss' ? 'SUPER ADMIN (BOSS)' : currentUser.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 text-amber-500/90 font-medium">
                <Sparkles className="w-3 h-3" />
                Rolni almashtirish:
              </span>
              <select
                value={currentUser.role}
                onChange={(e) => switchUser(e.target.value as UserRole)}
                className="bg-neutral-800 text-neutral-200 border border-neutral-700 text-[11px] rounded-md px-1.5 py-0.5 focus:outline-hidden cursor-pointer"
              >
                <option value="boss">Boss (Super Admin)</option>
                <option value="accountant">Bosh Buxgalter</option>
                <option value="production_mgr">Sex Boshlig'i</option>
                <option value="warehouse_mgr">Ombor Mudiri</option>
              </select>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

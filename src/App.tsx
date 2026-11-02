/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FactoryProvider, useFactory } from './context/FactoryContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { FinanceView } from './components/finance/FinanceView';
import { WarehouseView } from './components/warehouse/WarehouseView';
import { ProductionView } from './components/production/ProductionView';
import { SalesView } from './components/sales/SalesView';
import { EmployeesView } from './components/employees/EmployeesView';
import { BossReportView } from './components/reports/BossReportView';
import { AdminSecurityView } from './components/security/AdminSecurityView';
import { ConfirmModal } from './components/common/ConfirmModal';
import { QuickActionModal } from './components/common/QuickActionModal';
import { ManageUsersModal } from './components/common/ManageUsersModal';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useFactory();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false);

  // Check tab access based on active role
  const checkAccess = (tab: NavTab): boolean => {
    switch (tab) {
      case 'boss_report':
        return currentUser.role === 'boss';
      case 'finance':
      case 'sales':
        return currentUser.role === 'boss' || currentUser.role === 'accountant';
      case 'production':
        return currentUser.role === 'boss' || currentUser.role === 'production_mgr';
      case 'employees':
        return (
          currentUser.role === 'boss' ||
          currentUser.role === 'accountant' ||
          currentUser.role === 'production_mgr'
        );
      case 'warehouse':
      case 'dashboard':
      case 'security':
      default:
        return true;
    }
  };

  const hasAccess = checkAccess(currentTab);

  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenManageUsers={() => setIsManageUsersOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setIsMobileOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenManageUsers={() => setIsManageUsersOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!hasAccess ? (
            <div className="py-16 text-center space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Ushbu Bo'limga Kirish Cheklangan
              </h2>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                Siz hozirda <b>{currentUser.title}</b> sifatida tizimdasiz. Ushbu modul faqat zavod ta'sischisi (BOSS) yoki mas'ul shaxslar uchun mo'ljallangan.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer"
              >
                Boshqaruv Paneliga Qaytish
              </button>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                />
              )}
              {currentTab === 'finance' && <FinanceView />}
              {currentTab === 'warehouse' && <WarehouseView />}
              {currentTab === 'production' && <ProductionView />}
              {currentTab === 'sales' && <SalesView />}
              {currentTab === 'employees' && <EmployeesView />}
              {currentTab === 'boss_report' && <BossReportView />}
              {currentTab === 'security' && (
                <AdminSecurityView onOpenManageUsers={() => setIsManageUsersOpen(true)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ConfirmModal />
      <ManageUsersModal
        isOpen={isManageUsersOpen}
        onClose={() => setIsManageUsersOpen(false)}
      />
      <QuickActionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectAction={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FactoryProvider>
      <AppContent />
    </FactoryProvider>
  );
}

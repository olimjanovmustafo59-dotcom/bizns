/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserRole,
  UserProfile,
  Transaction,
  WarehouseItem,
  StockMovement,
  ProductionBatch,
  SalesOrder,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  AuditLog,
  TimeFilter,
  ProductionStatus,
  PaymentMethod,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WAREHOUSE,
  INITIAL_TRANSACTIONS,
  INITIAL_PRODUCTION,
  INITIAL_SALES,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_PAYROLL,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface FactoryContextType {
  currentUser: UserProfile;
  switchUser: (role: UserRole) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  timeFilter: TimeFilter;
  setTimeFilter: (f: TimeFilter) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (range: { start: string; end: string }) => void;

  // Data
  transactions: Transaction[];
  warehouse: WarehouseItem[];
  stockMovements: StockMovement[];
  productionBatches: ProductionBatch[];
  salesOrders: SalesOrder[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  auditLogs: AuditLog[];

  // Confirm Modal
  confirmModal: ConfirmModalState;
  requestConfirm: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
  closeConfirm: () => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteTransaction: (id: string) => void;

  addWarehouseItem: (item: Omit<WarehouseItem, 'id' | 'lastUpdated'>) => void;
  updateWarehouseItem: (id: string, updates: Partial<WarehouseItem>) => void;
  deleteWarehouseItem: (id: string) => void;
  adjustStock: (itemId: string, qtyDelta: number, reason: string, type: 'in' | 'out') => void;

  addProductionBatch: (batch: Omit<ProductionBatch, 'id'>) => void;
  updateProductionBatchStatus: (
    id: string,
    status: ProductionStatus,
    actualQty?: number,
    defectiveQty?: number
  ) => void;
  deleteProductionBatch: (id: string) => void;

  addSalesOrder: (order: Omit<SalesOrder, 'id' | 'createdBy'>) => void;
  recordSalePayment: (orderId: string, amount: number, method: PaymentMethod) => void;
  deleteSalesOrder: (id: string) => void;

  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  setAttendanceStatus: (employeeId: string, status: AttendanceStatus, note?: string) => void;

  addPayrollRecord: (rec: Omit<PayrollRecord, 'id'>) => void;
  markPayrollPaid: (id: string) => void;

  resetToDemoData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;

  // Aggregated KPI numbers
  kpis: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    todayRevenue: number;
    monthlyRevenue: number;
    warehouseTotalValue: number;
    producedUnitsTotal: number;
    soldUnitsTotal: number;
    lowStockItemsCount: number;
    unpaidDebtTotal: number;
  };
}

const STORAGE_KEY = 'zavod_pro_app_state_v1';
const THEME_KEY = 'zavod_pro_theme';

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export const FactoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return true; // Default dark industrial look
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // User state
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  const switchUser = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(user);
    addAuditLog('status_change', 'system', `Foydalanuvchi tizimga kirdi: ${user.name} (${user.title})`);
  };

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '2026-10-01',
    end: '2026-11-02',
  });

  // Data states with localStorage load
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tx`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [warehouse, setWarehouse] = useState<WarehouseItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wh`);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_mv`);
    return saved ? JSON.parse(saved) : [];
  });

  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prod`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION;
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_emp`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_att`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pay`);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tx`, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_wh`, JSON.stringify(warehouse));
  }, [warehouse]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_mv`, JSON.stringify(stockMovements));
  }, [stockMovements]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prod`, JSON.stringify(productionBatches));
  }, [productionBatches]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(salesOrders));
  }, [salesOrders]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_emp`, JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_att`, JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pay`, JSON.stringify(payroll));
  }, [payroll]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    onConfirm: () => {},
  });

  const requestConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDestructive = false
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      isDestructive,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper for audit
  const addAuditLog = (
    action: AuditLog['action'],
    module: AuditLog['module'],
    details: string
  ) => {
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp,
      userRole: currentUser.role,
      userName: currentUser.name,
      action,
      module,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 200)]);
  };

  // 1. Transactions Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => {
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now(),
      createdBy: currentUser.name,
      createdAt,
    };
    setTransactions((prev) => [newTx, ...prev]);
    addAuditLog(
      'create',
      'finance',
      `Yangi ${tx.type === 'income' ? 'Kirim' : 'Chiqim'} qo'shildi: ${tx.amount} so'm (${tx.counterparty})`
    );
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    requestConfirm(
      'Operatsiyani o\'chirish',
      `Ushbu moliyaviy yozuvni (${target.amount} so'm - ${target.counterparty}) o'chirmoqchimisiz? Ushbu amal hisobotlarga ta'sir qiladi.`,
      () => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        addAuditLog(
          'delete',
          'finance',
          `Moliyaviy yozuv o'chirildi: ${target.amount} so'm (${target.counterparty})`
        );
      },
      true
    );
  };

  // 2. Warehouse Actions
  const addWarehouseItem = (item: Omit<WarehouseItem, 'id' | 'lastUpdated'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newItem: WarehouseItem = {
      ...item,
      id: 'item-' + Date.now(),
      lastUpdated: today,
    };
    setWarehouse((prev) => [newItem, ...prev]);
    addAuditLog('create', 'warehouse', `Yangi ombor tovari qo'shildi: ${newItem.name} (${newItem.code})`);
  };

  const updateWarehouseItem = (id: string, updates: Partial<WarehouseItem>) => {
    const today = new Date().toISOString().split('T')[0];
    setWarehouse((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, lastUpdated: today } : item))
    );
    addAuditLog('update', 'warehouse', `Ombor tovari ma'lumotlari yangilandi: ID ${id}`);
  };

  const deleteWarehouseItem = (id: string) => {
    const target = warehouse.find((w) => w.id === id);
    if (!target) return;
    requestConfirm(
      'Tovarni ombordan o\'chirish',
      `"${target.name}" tovarini o'chirmoqchimisiz? Bu tovarning barcha harakatlari va qoldiqlariga ta'sir qiladi.`,
      () => {
        setWarehouse((prev) => prev.filter((w) => w.id !== id));
        addAuditLog('delete', 'warehouse', `Ombor tovari o'chirildi: ${target.name}`);
      },
      true
    );
  };

  const adjustStock = (
    itemId: string,
    qtyDelta: number,
    reason: string,
    type: 'in' | 'out'
  ) => {
    const target = warehouse.find((w) => w.id === itemId);
    if (!target) return;

    const previousQty = target.quantity;
    const finalDelta = type === 'out' ? -Math.abs(qtyDelta) : Math.abs(qtyDelta);
    const newQty = Math.max(0, previousQty + finalDelta);

    const today = new Date().toISOString().split('T')[0];

    setWarehouse((prev) =>
      prev.map((w) => (w.id === itemId ? { ...w, quantity: newQty, lastUpdated: today } : w))
    );

    const movement: StockMovement = {
      id: 'mv-' + Date.now(),
      itemId: target.id,
      itemName: target.name,
      type: type === 'in' ? 'in' : 'out',
      quantity: Math.abs(qtyDelta),
      previousQty,
      newQty,
      reason,
      date: today,
      operator: currentUser.name,
    };

    setStockMovements((prev) => [movement, ...prev]);
    addAuditLog(
      'update',
      'warehouse',
      `Ombor qoldig'i o'zgartirildi: ${target.name} (${type === 'in' ? '+' : '-'}${Math.abs(
        qtyDelta
      )} ${target.unit}). Sabab: ${reason}`
    );
  };

  // 3. Production Actions
  const addProductionBatch = (batch: Omit<ProductionBatch, 'id'>) => {
    const newBatch: ProductionBatch = {
      ...batch,
      id: 'batch-' + Date.now(),
    };
    setProductionBatches((prev) => [newBatch, ...prev]);

    // Deduct raw materials from warehouse automatically
    batch.rawMaterialsUsed.forEach((mat) => {
      adjustStock(mat.materialId, mat.quantity, `Ishlab chiqarishga sarf (${batch.batchNumber})`, 'out');
    });

    addAuditLog('create', 'production', `Yangi ishlab chiqarish partiyasi boshlandi: ${batch.batchNumber} (${batch.productName})`);
  };

  const updateProductionBatchStatus = (
    id: string,
    status: ProductionStatus,
    actualQty?: number,
    defectiveQty?: number
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const target = productionBatches.find((b) => b.id === id);
    if (!target) return;

    setProductionBatches((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newActual = actualQty !== undefined ? actualQty : b.actualQuantity;
        const newDefective = defectiveQty !== undefined ? defectiveQty : b.defectiveQuantity;
        const eff =
          b.targetQuantity > 0
            ? Math.min(100, Math.round(((newActual) / b.targetQuantity) * 1000) / 10)
            : 100;
        const unitCost = newActual > 0 ? Math.round(b.totalCost / newActual) : b.unitCost;

        return {
          ...b,
          status,
          actualQuantity: newActual,
          defectiveQuantity: newDefective,
          efficiencyRate: eff,
          unitCost,
          completedDate: status === 'completed' ? today : b.completedDate,
        };
      })
    );

    // If completed, add finished products to warehouse!
    if (status === 'completed' && actualQty && actualQty > 0) {
      adjustStock(
        target.productId,
        actualQty,
        `Ishlab chiqarishdan tayyor mahsulot qabuli (${target.batchNumber})`,
        'in'
      );
    }

    addAuditLog(
      'status_change',
      'production',
      `Ishlab chiqarish holati o'zgardi: ${target.batchNumber} -> ${status}`
    );
  };

  const deleteProductionBatch = (id: string) => {
    const target = productionBatches.find((b) => b.id === id);
    if (!target) return;
    requestConfirm(
      'Partiyani o\'chirish',
      `"${target.batchNumber}" partiyasini o'chirmoqchimisiz?`,
      () => {
        setProductionBatches((prev) => prev.filter((b) => b.id !== id));
        addAuditLog('delete', 'production', `Ishlab chiqarish partiyasi o'chirildi: ${target.batchNumber}`);
      },
      true
    );
  };

  // 4. Sales Orders Actions
  const addSalesOrder = (order: Omit<SalesOrder, 'id' | 'createdBy'>) => {
    const newOrder: SalesOrder = {
      ...order,
      id: 'sale-' + Date.now(),
      createdBy: currentUser.name,
    };
    setSalesOrders((prev) => [newOrder, ...prev]);

    // Automatically dispatch from warehouse!
    adjustStock(
      order.productId,
      order.quantity,
      `Sotuv jo'natmasi (#${order.orderNumber} - ${order.customerCompany || order.customerName})`,
      'out'
    );

    // If paid amount > 0, record financial income in transactions!
    if (order.paidAmount > 0) {
      addTransaction({
        type: 'income',
        date: order.date,
        amount: order.paidAmount,
        category: 'product_sale',
        counterparty: order.customerCompany || order.customerName,
        relatedItem: `${order.productName} (${order.quantity} dona/metr)`,
        paymentMethod: order.paymentMethod,
        notes: `Buyurtma #${order.orderNumber} uchun to'lov`,
      });
    }

    addAuditLog('create', 'sales', `Yangi sotuv qayd etildi: #${order.orderNumber} (${order.customerName}, ${order.totalAmount} so'm)`);
  };

  const recordSalePayment = (orderId: string, amount: number, method: PaymentMethod) => {
    const today = new Date().toISOString().split('T')[0];
    const target = salesOrders.find((s) => s.id === orderId);
    if (!target) return;

    const newPaid = target.paidAmount + amount;
    const newDebt = Math.max(0, target.totalAmount - newPaid);
    const newStatus: SalesOrder['paymentStatus'] =
      newDebt === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

    setSalesOrders((prev) =>
      prev.map((s) =>
        s.id === orderId
          ? {
              ...s,
              paidAmount: newPaid,
              debtAmount: newDebt,
              paymentStatus: newStatus,
            }
          : s
      )
    );

    // Register income in transactions
    addTransaction({
      type: 'income',
      date: today,
      amount,
      category: 'product_sale',
      counterparty: target.customerCompany || target.customerName,
      relatedItem: `Qarzdorlik so'ndirish (#${target.orderNumber})`,
      paymentMethod: method,
      notes: `Mijoz qarzdorligidan to'lov qabul qilindi`,
    });

    addAuditLog(
      'update',
      'sales',
      `Sotuv to'lovi qabul qilindi: #${target.orderNumber} ga ${amount} so'm to'landi`
    );
  };

  const deleteSalesOrder = (id: string) => {
    const target = salesOrders.find((s) => s.id === id);
    if (!target) return;
    requestConfirm(
      'Sotuv buyurtmasini o\'chirish',
      `"${target.orderNumber}" buyurtmasini o'chirmoqchimisiz?`,
      () => {
        setSalesOrders((prev) => prev.filter((s) => s.id !== id));
        addAuditLog('delete', 'sales', `Sotuv yozuvi o'chirildi: #${target.orderNumber}`);
      },
      true
    );
  };

  // 5. HR & Attendance & Payroll Actions
  const addEmployee = (emp: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...emp,
      id: 'emp-' + Date.now(),
    };
    setEmployees((prev) => [...prev, newEmp]);
    addAuditLog('create', 'hr', `Yangi xodim qo'shildi: ${emp.fullName} (${emp.role})`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    addAuditLog('update', 'hr', `Xodim ma'lumotlari tahrirlandi: ID ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    if (!target) return;
    requestConfirm(
      'Xodimni tizimdan o\'chirish',
      `"${target.fullName}" xodimini o'chirishni tasdiqlaysizmi?`,
      () => {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        addAuditLog('delete', 'hr', `Xodim o'chirildi: ${target.fullName}`);
      },
      true
    );
  };

  const setAttendanceStatus = (
    employeeId: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    setAttendance((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.employeeId === employeeId && a.date === today
      );
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          status,
          note: note !== undefined ? note : copy[existingIndex].note,
        };
        return copy;
      } else {
        const nowTime = new Date().toTimeString().slice(0, 5);
        const newRecord: AttendanceRecord = {
          id: 'att-' + Date.now(),
          employeeId,
          employeeName: emp.fullName,
          date: today,
          status,
          checkIn: status === 'present' ? nowTime : undefined,
          note,
        };
        return [newRecord, ...prev];
      }
    });

    addAuditLog('update', 'hr', `Davomat belgilandi: ${emp.fullName} -> ${status}`);
  };

  const addPayrollRecord = (rec: Omit<PayrollRecord, 'id'>) => {
    const newRec: PayrollRecord = {
      ...rec,
      id: 'pay-' + Date.now(),
    };
    setPayroll((prev) => [newRec, ...prev]);
    addAuditLog('create', 'hr', `Maosh hisoblandi: ${rec.employeeName} (${rec.month})`);
  };

  const markPayrollPaid = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = payroll.find((p) => p.id === id);
    if (!target) return;

    setPayroll((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'paid', paidDate: today } : p))
    );

    // Record expense in transactions
    addTransaction({
      type: 'expense',
      date: today,
      amount: target.netSalary,
      category: 'salary',
      counterparty: target.employeeName,
      relatedItem: `${target.month} oyi oylik maoshi`,
      paymentMethod: 'card',
      notes: `Xodimga maosh to'landi (Asosiy: ${target.baseSalary}, Bonus: ${target.bonus}, Jarima: ${target.fine})`,
    });

    addAuditLog('update', 'hr', `Oylik to'landi: ${target.employeeName} ga ${target.netSalary} so'm`);
  };

  // Reset & Clear data
  const resetToDemoData = () => {
    requestConfirm(
      'Demo ma\'lumotlarni tiklash',
      'Barcha kiritilgan ma\'lumotlar zavodning to\'liq boshlang\'ich demo holatiga qaytariladi. Davom etasizmi?',
      () => {
        setWarehouse(INITIAL_WAREHOUSE);
        setTransactions(INITIAL_TRANSACTIONS);
        setProductionBatches(INITIAL_PRODUCTION);
        setSalesOrders(INITIAL_SALES);
        setEmployees(INITIAL_EMPLOYEES);
        setAttendance(INITIAL_ATTENDANCE);
        setPayroll(INITIAL_PAYROLL);
        setStockMovements([]);
        setAuditLogs(INITIAL_AUDIT_LOGS);
        addAuditLog('system_reset', 'system', 'Demo ma\'lumotlar qayta tiklandi');
      },
      false
    );
  };

  const clearAllData = () => {
    requestConfirm(
      'Haqiqiy bo\'sh rejimga o\'tish',
      'DIQQAT! Barcha demo ma\'lumotlar butunlay tozalanadi va zavod tizimi bo\'sh holatda yangidan ish boshlaydi. Ishonchingiz komilmi?',
      () => {
        setWarehouse([]);
        setTransactions([]);
        setProductionBatches([]);
        setSalesOrders([]);
        setEmployees([INITIAL_EMPLOYEES[0]]); // Keep Boss
        setAttendance([]);
        setPayroll([]);
        setStockMovements([]);
        setAuditLogs([]);
        addAuditLog('system_reset', 'system', 'Tizim tozalandi va haqiqiy rejimga o\'tkazildi');
      },
      true
    );
  };

  const exportBackupJSON = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      warehouse,
      transactions,
      productionBatches,
      salesOrders,
      employees,
      attendance,
      payroll,
      stockMovements,
      auditLogs,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zavodpro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog('update', 'system', 'Tizim zaxira nusxasi (JSON) yuklab olindi');
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.warehouse && data.transactions) {
        setWarehouse(data.warehouse || []);
        setTransactions(data.transactions || []);
        setProductionBatches(data.productionBatches || []);
        setSalesOrders(data.salesOrders || []);
        setEmployees(data.employees || []);
        setAttendance(data.attendance || []);
        setPayroll(data.payroll || []);
        setStockMovements(data.stockMovements || []);
        setAuditLogs(data.auditLogs || []);
        addAuditLog('system_reset', 'system', 'Tizim zaxira nusxasidan tiklandi');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Aggregated KPI calculations
  const kpis = useMemo(() => {
    const todayStr = '2026-11-02'; // anchored to current time
    const currentMonthPrefix = '2026-11';

    let totalIncome = 0;
    let totalExpense = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        if (tx.date === todayStr) {
          todayRevenue += tx.amount;
        }
        if (tx.date.startsWith(currentMonthPrefix)) {
          monthlyRevenue += tx.amount;
        }
      } else {
        totalExpense += tx.amount;
      }
    });

    const netProfit = totalIncome - totalExpense;

    let warehouseTotalValue = 0;
    let lowStockItemsCount = 0;
    warehouse.forEach((item) => {
      const val = item.category === 'finished_product' ? item.sellingPrice : item.unitCost;
      warehouseTotalValue += item.quantity * (val || item.unitCost);
      if (item.quantity <= item.minStockAlert) {
        lowStockItemsCount++;
      }
    });

    let producedUnitsTotal = 0;
    productionBatches.forEach((batch) => {
      producedUnitsTotal += batch.actualQuantity;
    });

    let soldUnitsTotal = 0;
    let unpaidDebtTotal = 0;
    salesOrders.forEach((sale) => {
      soldUnitsTotal += sale.quantity;
      unpaidDebtTotal += sale.debtAmount;
    });

    return {
      totalIncome,
      totalExpense,
      netProfit,
      todayRevenue,
      monthlyRevenue,
      warehouseTotalValue,
      producedUnitsTotal,
      soldUnitsTotal,
      lowStockItemsCount,
      unpaidDebtTotal,
    };
  }, [transactions, warehouse, productionBatches, salesOrders]);

  return (
    <FactoryContext.Provider
      value={{
        currentUser,
        switchUser,
        isDarkMode,
        toggleDarkMode,
        timeFilter,
        setTimeFilter,
        customDateRange,
        setCustomDateRange,

        transactions,
        warehouse,
        stockMovements,
        productionBatches,
        salesOrders,
        employees,
        attendance,
        payroll,
        auditLogs,

        confirmModal,
        requestConfirm,
        closeConfirm,

        addTransaction,
        deleteTransaction,
        addWarehouseItem,
        updateWarehouseItem,
        deleteWarehouseItem,
        adjustStock,
        addProductionBatch,
        updateProductionBatchStatus,
        deleteProductionBatch,
        addSalesOrder,
        recordSalePayment,
        deleteSalesOrder,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        setAttendanceStatus,
        addPayrollRecord,
        markPayrollPaid,

        resetToDemoData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,

        kpis,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
};

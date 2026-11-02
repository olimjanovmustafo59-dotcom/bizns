/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'boss' | 'accountant' | 'production_mgr' | 'warehouse_mgr';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  title: string;
  avatarColor: string;
}

export type PaymentMethod = 'cash' | 'bank' | 'card' | 'currency';

export type ExpenseCategory =
  | 'salary'
  | 'raw_material'
  | 'electricity'
  | 'gas_water'
  | 'transport'
  | 'equipment'
  | 'repair'
  | 'other';

export type IncomeCategory =
  | 'product_sale'
  | 'advance_payment'
  | 'service'
  | 'scrap_sale'
  | 'other';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string; // YYYY-MM-DD
  amount: number; // in UZS
  category: ExpenseCategory | IncomeCategory;
  counterparty: string; // Kimdan kelgan yoki Kimga to'langan
  relatedItem?: string; // Qaysi mahsulot yoki xizmat uchun
  paymentMethod: PaymentMethod;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export type ItemUnit = 'dona' | 'kg' | 'metr' | 'litr' | 'tonna' | 'quti' | 'rulon';

export interface WarehouseItem {
  id: string;
  name: string;
  category: 'finished_product' | 'raw_material';
  code: string; // SKU / Kod
  unit: ItemUnit;
  quantity: number;
  minStockAlert: number;
  unitCost: number; // Tannarxi (UZS)
  sellingPrice: number; // Sotuv narxi (UZS) - tayyor mahsulotlar uchun
  location: string; // e.g. "A-12 qator", "Asosiy angar"
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out' | 'production_use' | 'sale_dispatch' | 'adjustment';
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string;
  date: string;
  operator: string;
}

export type ProductionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface ProductionMaterialRequirement {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: ItemUnit;
  cost: number;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string; // e.g. "PART-2026-089"
  productId: string;
  productName: string;
  targetQuantity: number;
  actualQuantity: number;
  defectiveQuantity: number; // Brak soni
  rawMaterialsUsed: ProductionMaterialRequirement[];
  totalCost: number; // Jami sarf
  unitCost: number; // Bir dona tannarxi
  efficiencyRate: number; // Samaradorlik foizi
  status: ProductionStatus;
  shift: 'day' | 'night';
  supervisor: string;
  startDate: string;
  completedDate?: string;
  notes: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface SalesOrder {
  id: string;
  orderNumber: string; // e.g. "INV-1042"
  date: string;
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes: string;
  createdBy: string;
}

export type Department =
  | 'management'
  | 'production'
  | 'warehouse'
  | 'accounting'
  | 'logistics'
  | 'technical';

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: Department;
  phone: string;
  monthlySalary: number;
  hireDate: string;
  status: 'active' | 'vacation' | 'terminated';
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'sick';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  note?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  bonus: number;
  fine: number;
  bonusReason?: string;
  fineReason?: string;
  netSalary: number;
  status: 'pending' | 'paid';
  paidDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'system_reset';
  module: 'finance' | 'warehouse' | 'production' | 'sales' | 'hr' | 'system';
  details: string;
}

export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

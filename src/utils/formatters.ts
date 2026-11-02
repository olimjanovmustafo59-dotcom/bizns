/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExpenseCategory, IncomeCategory, PaymentMethod, UserRole, Department, AttendanceStatus } from '../types';

export function formatUZS(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 so\'m';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('uz-UZ').format(rounded).replace(/,/g, ' ');
  return `${formatted} so'm`;
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return new Intl.NumberFormat('uz-UZ').format(num).replace(/,/g, ' ');
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '-';
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeString;
  }
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salary: "Ishchilar maoshi",
  raw_material: "Xomashyo xaridi",
  electricity: "Elektr energiyasi",
  gas_water: "Gaz va suv",
  transport: "Transport va logistika",
  equipment: "Uskunalar xaridi",
  repair: "Ta'mirlash va servis",
  other: "Boshqa xarajatlar",
};

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  product_sale: "Mahsulot sotuvi",
  advance_payment: "Bo'nak (Avans)",
  service: "Xizmat ko'rsatish",
  scrap_sale: "Chiqindi / Ikkilamchi sotuv",
  other: "Boshqa kirim",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Naqd pul",
  bank: "Bank o'tkazmasi",
  card: "Korporativ karta",
  currency: "Valyuta (USD)",
};

export const ROLE_LABELS: Record<UserRole, { title: string; subtitle: string }> = {
  boss: {
    title: "Bosh Direktor (BOSS)",
    subtitle: "Super Admin — To'liq ruxsat",
  },
  accountant: {
    title: "Bosh Buxgalter",
    subtitle: "Moliya, Kassa va Maoshlar",
  },
  production_mgr: {
    title: "Ishlab Chiqarish Boshlig'i",
    subtitle: "Sex va texnologiya liniyalari",
  },
  warehouse_mgr: {
    title: "Ombor Mudiri",
    subtitle: "Xomashyo va tayyor mahsulotlar",
  },
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  management: "Boshqaruv",
  production: "Ishlab chiqarish sexi",
  warehouse: "Omborxona",
  accounting: "Buxgalteriya",
  logistics: "Transport va logistika",
  technical: "Muhandislik va ta'mirlash",
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, { label: string; color: string }> = {
  present: { label: "Keldi", color: "text-emerald-400 dark:text-emerald-400" },
  absent: { label: "Kelmadi", color: "text-rose-400 dark:text-rose-400" },
  excused: { label: "Sababli", color: "text-amber-400 dark:text-amber-400" },
  sick: { label: "Betob", color: "text-blue-400 dark:text-blue-400" },
};

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) =>
    row
      .map((val) => {
        const text = String(val ?? '').replace(/"/g, '""');
        return `"${text}"`;
      })
      .join(',');

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

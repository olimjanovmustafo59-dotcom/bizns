/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  CalendarCheck,
  Award,
  AlertCircle,
  CreditCard,
  Trash2,
  X,
  CheckCircle2,
  Phone,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import {
  formatUZS,
  formatDate,
  DEPARTMENT_LABELS,
  ATTENDANCE_LABELS,
} from '../../utils/formatters';
import { Employee, Department, AttendanceStatus, PayrollRecord } from '../../types';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    attendance,
    payroll,
    addEmployee,
    deleteEmployee,
    setAttendanceStatus,
    addPayrollRecord,
    markPayrollPaid,
    currentUser,
  } = useFactory();

  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'payroll'>('roster');

  // New Employee Modal
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('production');
  const [phone, setPhone] = useState('+998 ');
  const [monthlySalary, setMonthlySalary] = useState<number | ''>('');

  // Bonus & Fine Modal
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [selectedEmpForBonus, setSelectedEmpForBonus] = useState<Employee | null>(null);
  const [bonusAmount, setBonusAmount] = useState<number | ''>('');
  const [fineAmount, setFineAmount] = useState<number | ''>('');
  const [bonusReason, setBonusReason] = useState('');
  const [fineReason, setFineReason] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('2026-11');

  const openAddEmployeeModal = () => {
    setFullName('');
    setRole('');
    setDepartment('production');
    setPhone('+998 ');
    setMonthlySalary('');
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !role.trim() || !monthlySalary) return;

    const today = new Date().toISOString().split('T')[0];
    addEmployee({
      fullName: fullName.trim(),
      role: role.trim(),
      department,
      phone: phone.trim(),
      monthlySalary: Number(monthlySalary),
      hireDate: today,
      status: 'active',
    });

    setIsEmpModalOpen(false);
  };

  const openBonusModal = (emp: Employee) => {
    setSelectedEmpForBonus(emp);
    setBonusAmount('');
    setFineAmount('');
    setBonusReason('Rejani a\'lo darajada bajargani uchun');
    setFineReason('');
    setPayrollMonth('2026-11');
    setIsBonusModalOpen(true);
  };

  const handleSaveBonusPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForBonus) return;

    const bonus = Number(bonusAmount) || 0;
    const fine = Number(fineAmount) || 0;
    const net = selectedEmpForBonus.monthlySalary + bonus - fine;

    addPayrollRecord({
      employeeId: selectedEmpForBonus.id,
      employeeName: selectedEmpForBonus.fullName,
      month: payrollMonth,
      baseSalary: selectedEmpForBonus.monthlySalary,
      bonus,
      fine,
      bonusReason: bonus > 0 ? bonusReason : undefined,
      fineReason: fine > 0 ? fineReason : undefined,
      netSalary: Math.max(0, net),
      status: 'pending',
    });

    setIsBonusModalOpen(false);
  };

  // Metrics
  const totalSalaryFund = employees.reduce((sum, e) => sum + e.monthlySalary, 0);
  const today = '2026-11-02';
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentCount = todayRecords.filter((a) => a.status === 'present').length;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Jami Xodimlar Soni</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {employees.length} kishi
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Faol shtatdagi xodimlar</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Oylik Maosh Fondi</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-amber-500">
            {formatUZS(totalSalaryFund)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Asosiy okladlar yig'indisi</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">Bugungi Davomat</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-emerald-500">
            {presentCount} / {employees.length} kelgan
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Sex va boshqaruv xodimlari</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <span className="text-xs font-medium text-neutral-500">To'langan Maoshlar</span>
          <div className="mt-2 font-mono tabular-nums text-xl font-bold text-blue-500">
            {payroll.filter((p) => p.status === 'paid').length} ta to'lov
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">Kassa orqali yopilgan</p>
        </div>
      </div>

      {/* Tab Switcher & Actions */}
      <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            Xodimlar Shtati
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            Bugungi Davomat
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            Maosh, Bonus va Jarimalar
          </button>
        </div>

        <button
          onClick={openAddEmployeeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Yangi Xodim Qo'shish</span>
        </button>
      </div>

      {/* Content by Active Tab */}
      {activeTab === 'roster' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500">
                  <th className="py-3 px-4 font-semibold">Xodim F.I.O</th>
                  <th className="py-3 px-4 font-semibold">Lavozimi</th>
                  <th className="py-3 px-4 font-semibold">Bo'limi</th>
                  <th className="py-3 px-4 font-semibold">Telefon Raqami</th>
                  <th className="py-3 px-4 font-semibold text-right">Oylik Oklad (Maosh)</th>
                  <th className="py-3 px-4 font-semibold">Ishga Kirgan</th>
                  <th className="py-3 px-4 font-semibold text-center">Bonus / Jarima</th>
                  <th className="py-3 px-4 font-semibold text-center">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {emp.fullName}
                    </td>
                    <td className="py-3 px-4 text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                      {emp.role}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                      {DEPARTMENT_LABELS[emp.department]}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                      {emp.phone}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold tabular-nums text-right text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {formatUZS(emp.monthlySalary)}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500 whitespace-nowrap">
                      {formatDate(emp.hireDate)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => openBonusModal(emp)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 rounded-md transition-colors cursor-pointer"
                      >
                        + Bonus / Jarima
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {emp.role !== 'Bosh Direktor (Asoschi)' && (
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-md hover:bg-neutral-800 cursor-pointer"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Bugungi Ish Davomati ({formatDate(today)})
              </h3>
              <p className="text-xs text-neutral-500">
                Barcha smena va bo'lim xodimlari davomati bir bosishda qayd qilinadi
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {employees.map((emp) => {
              const record = attendance.find(
                (a) => a.employeeId === emp.id && a.date === today
              );
              const currentStatus = record?.status || 'absent';

              return (
                <div
                  key={emp.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center shrink-0">
                      {emp.fullName.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                        {emp.fullName}
                      </p>
                      <p className="text-neutral-500 text-[11px]">
                        {emp.role} · {DEPARTMENT_LABELS[emp.department]}
                      </p>
                    </div>
                  </div>

                  {/* Attendance status toggle buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {(['present', 'absent', 'excused', 'sick'] as AttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => setAttendanceStatus(emp.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          currentStatus === st
                            ? st === 'present'
                              ? 'bg-emerald-600 text-white'
                              : st === 'absent'
                              ? 'bg-rose-600 text-white'
                              : st === 'excused'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {ATTENDANCE_LABELS[st].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Maosh To'lovlari Tarixi (Hisoblangan va To'langan Oyliklar)
            </h3>
            <p className="text-xs text-neutral-500">
              Oklad, bonus va jarimalar hisob-kitobi. "Oylikni To'lash" bosilganda kassa chiqimiga avtomatik yoziladi.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-500">
                  <th className="py-3 px-4 font-semibold">Oy</th>
                  <th className="py-3 px-4 font-semibold">Xodim FIO</th>
                  <th className="py-3 px-4 font-semibold text-right">Oklad</th>
                  <th className="py-3 px-4 font-semibold text-right">Bonus (+)</th>
                  <th className="py-3 px-4 font-semibold text-right">Jarima (-)</th>
                  <th className="py-3 px-4 font-semibold text-right">Qo'lga Tegadigan Summa</th>
                  <th className="py-3 px-4 font-semibold text-center">Holat</th>
                  <th className="py-3 px-4 font-semibold text-center">To'lov Amali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                {payroll.map((rec) => {
                  const isPaid = rec.status === 'paid';

                  return (
                    <tr key={rec.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-500 whitespace-nowrap">
                        {rec.month}
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        {rec.employeeName}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-neutral-500 whitespace-nowrap">
                        {formatUZS(rec.baseSalary)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-emerald-500 whitespace-nowrap">
                        +{formatUZS(rec.bonus)}
                        {rec.bonusReason && (
                          <span className="block text-[10px] text-neutral-400">
                            {rec.bonusReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-rose-500 whitespace-nowrap">
                        -{formatUZS(rec.fine)}
                        {rec.fineReason && (
                          <span className="block text-[10px] text-neutral-400">
                            {rec.fineReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-neutral-900 dark:text-neutral-100 whitespace-nowrap text-sm">
                        {formatUZS(rec.netSalary)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {isPaid ? 'To\'langan' : 'Kutilmoqda'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {!isPaid ? (
                          <button
                            onClick={() => markPayrollPaid(rec.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                          >
                            To'lovni Tasdiqlash
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-neutral-400">
                            To'landi ({formatDate(rec.paidDate || '')})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Employee */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsEmpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Yangi Xodim Qo'shish
              </h2>
              <p className="text-xs text-neutral-500">
                Shtatga yangi mutaxassis yoki ishchi kiritish
              </p>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Xodim F.I.O (To'liq ism-familiyasi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Rustamov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Lavozimi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Ekstruder operatori"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Bo'limi *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  >
                    <option value="production">Ishlab chiqarish sexi</option>
                    <option value="warehouse">Omborxona</option>
                    <option value="accounting">Buxgalteriya</option>
                    <option value="technical">Muhandislik va texnik</option>
                    <option value="logistics">Transport va logistika</option>
                    <option value="management">Boshqaruv</option>
                  </select>
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
                    Oylik Oklad (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Masalan: 8000000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Xodimni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bonus & Fine / Calculate Payroll */}
      {isBonusModalOpen && selectedEmpForBonus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
            <button
              onClick={() => setIsBonusModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Bonus va Jarima Kiritish
              </h2>
              <p className="text-xs text-neutral-500">
                {selectedEmpForBonus.fullName} ({selectedEmpForBonus.role})
              </p>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-neutral-800 text-xs flex justify-between font-mono">
              <span className="text-neutral-400">Asosiy oylik oklad:</span>
              <span className="font-bold text-white">
                {formatUZS(selectedEmpForBonus.monthlySalary)}
              </span>
            </div>

            <form onSubmit={handleSaveBonusPayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qaysi Oy Uchun *
                </label>
                <input
                  type="month"
                  required
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-500 mb-1">
                  Bonus Summasi (+)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Bonus sababi..."
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-500 mb-1">
                  Jarima Summasi (-)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={fineAmount}
                  onChange={(e) => setFineAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Jarima sababi (masalan: kechikish)..."
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-hidden text-neutral-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsBonusModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 bg-neutral-800 rounded-lg"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  Maosh Jadvaliga Kiritish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

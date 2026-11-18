import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Filter,
  Lock,
  Printer,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { Transaction, PaymentMethod } from '../../types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  exportToCSV,
} from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const FinancesView: React.FC = () => {
  const { transactions, addTransaction, currentRole, setCurrentRole } = useGym();

  const [filterType, setFilterType] = useState<'all' | 'ingreso' | 'gasto'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // New Expense form state
  const [expenseAmount, setExpenseAmount] = useState<number>(50000);
  const [expenseCategory, setExpenseCategory] = useState<Transaction['category']>('Mantenimiento');
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>('Transferencia / Nequi / Daviplata');
  const [expenseDesc, setExpenseDesc] = useState<string>('');

  // Role Gate: if staff, protect financial metrics
  if (currentRole === 'staff') {
    return (
      <div className="bg-dark-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-neon-amber">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white">Módulo Financiero Protegido</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Has iniciado sesión con el rol de <strong>Recepción / Entrenador</strong>. Por políticas de seguridad del gimnasio, las métricas globales de flujo de caja, estado de resultados y balance contable solo son accesibles para el <strong>Super Administrador</strong>.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setCurrentRole('admin')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold text-xs shadow-neon-green hover:brightness-110 transition-all"
          >
            Cambiar a Modo Administrador para Ver
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Today's breakdown
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrx = transactions.filter(t => t.date.startsWith(todayStr));
  const todayCash = todayTrx
    .filter(t => t.type === 'ingreso' && t.paymentMethod === 'Efectivo')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayTransf = todayTrx
    .filter(t => t.type === 'ingreso' && t.paymentMethod === 'Transferencia / Nequi / Daviplata')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayCard = todayTrx
    .filter(t => t.type === 'ingreso' && t.paymentMethod === 'Tarjeta')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.receiptNumber.toLowerCase().includes(q) ||
        (t.memberName && t.memberName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const exportData = filteredTransactions.map(t => ({
      ID: t.id,
      Comprobante: t.receiptNumber,
      Fecha: t.date,
      Tipo: t.type.toUpperCase(),
      Categoria: t.category,
      Monto: t.amount,
      MetodoPago: t.paymentMethod,
      Descripcion: t.description,
      Socio: t.memberName || 'N/A',
    }));
    exportToCSV(`Reporte_Financiero_Titan_Gym_${todayStr}`, exportData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc.trim()) return;

    addTransaction({
      date: new Date().toISOString(),
      type: 'gasto',
      category: expenseCategory,
      amount: expenseAmount,
      paymentMethod: expenseMethod,
      description: expenseDesc.trim(),
    });

    setExpenseDesc('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-neon-green">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Control Financiero & Caja
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                AUDITORÍA ACTIVA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Flujo de caja en tiempo real, ingresos por membresías, ventas de mostrador y control de gastos operativos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            title="Exportar a archivo Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            title="Imprimir resumen o ticket de caja"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Cierre</span>
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-extrabold shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-dark-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Ingresos Totales (Histórico)
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Membresías, tiqueteras, diarios y suplementos</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-dark-900 border border-rose-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Gastos Operativos Totales
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Nómina, servicios públicos y mantenimiento</p>
        </div>

        {/* Net Balance */}
        <div className="bg-dark-900 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Flujo Neto de Caja
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
            {formatCurrency(netBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Margen operativo positivo del periodo</p>
        </div>
      </div>

      {/* Today's Cash Register Close Breakdown */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Cierre de Caja de Hoy (17 Nov 2026)
            </h3>
            <p className="text-xs text-slate-400">Desglose de recaudación por canal de pago</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Total Hoy: {formatCurrency(todayCash + todayTransf + todayCard)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">💵 Efectivo en Gaveta</span>
            <span className="text-lg font-black text-white font-mono mt-1 block">
              {formatCurrency(todayCash)}
            </span>
            <span className="text-[10px] text-slate-500">Disponible para consignar</span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">📱 Transferencias / Nequi</span>
            <span className="text-lg font-black text-cyan-400 font-mono mt-1 block">
              {formatCurrency(todayTransf)}
            </span>
            <span className="text-[10px] text-slate-500">Comprobantes bancarios</span>
          </div>

          <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">💳 Tarjetas de Crédito / Débito</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">
              {formatCurrency(todayCard)}
            </span>
            <span className="text-[10px] text-slate-500">Datafono POS</span>
          </div>
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por descripción, número de comprobante o socio..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as typeof filterType)}
              className="bg-dark-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Ingresos y Gastos</option>
              <option value="ingreso">Solo Ingresos</option>
              <option value="gasto">Solo Gastos</option>
            </select>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-dark-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Membresía">Membresía</option>
              <option value="Tiquetera">Tiquetera</option>
              <option value="Pase Diario">Pase Diario</option>
              <option value="Tienda">Tienda POS</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Servicios">Servicios</option>
              <option value="Nómina">Nómina</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Comprobante</th>
                <th className="py-3 px-3">Fecha & Hora</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Descripción</th>
                <th className="py-3 px-3">Método</th>
                <th className="py-3 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTransactions.map(trx => {
                const isIncome = trx.type === 'ingreso';
                return (
                  <tr key={trx.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-white text-[11px]">
                      {trx.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {formatDateTime(trx.date)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-950 border border-slate-800 text-slate-300">
                        {trx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-200">
                      {trx.description}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                      {trx.paymentMethod}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-black ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(trx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title="Registrar Gasto Operativo"
        subtitle="Mantenimiento de máquinas, servicios públicos, nómina o inventario"
        maxWidth="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Concepto / Descripción *</label>
            <input
              type="text"
              required
              placeholder="Ej. Lubricación y calibración técnica caminadoras"
              value={expenseDesc}
              onChange={e => setExpenseDesc(e.target.value)}
              className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monto (COP) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={expenseAmount}
                onChange={e => setExpenseAmount(Number(e.target.value))}
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
              <select
                value={expenseCategory}
                onChange={e => setExpenseCategory(e.target.value as Transaction['category'])}
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Servicios">Servicios Públicos</option>
                <option value="Nómina">Nómina Entrenadores</option>
                <option value="Equipos">Compra de Equipos</option>
                <option value="Otros">Otros Gastos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Medio de Pago</label>
            <select
              value={expenseMethod}
              onChange={e => setExpenseMethod(e.target.value as PaymentMethod)}
              className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Transferencia / Nequi / Daviplata">Transferencia / Nequi / Daviplata</option>
              <option value="Efectivo">Efectivo de Caja</option>
              <option value="Tarjeta">Tarjeta Débito/Crédito</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

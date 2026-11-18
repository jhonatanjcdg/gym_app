import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Zap,
  TrendingUp,
  Activity,
  PieChart,
  BarChart3,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { Member } from '../../types';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppRenewalLink,
  getDaysRemaining,
} from '../../utils/formatters';
import { MetricCard } from '../common/MetricCard';
import { RenewModal } from '../members/RenewModal';

interface DashboardViewProps {
  onNavigateToCheckin: () => void;
  onNavigateToMembers: () => void;
  onNavigateToPos: () => void;
  onOpenDailyPass: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToCheckin,
  onNavigateToMembers,
  onOpenDailyPass,
}) => {
  const { members, transactions, checkIns, currentRole } = useGym();
  const [renewMember, setRenewMember] = useState<Member | null>(null);

  // 1. Calculate Real-time KPIs
  // Today's Revenue
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.startsWith(todayStr));
  const todayIncome = todayTransactions
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  // Active Members
  const activeMembersCount = members.filter(m => m.status === 'activo').length;

  // Today's Checkins
  const todayCheckInsCount = checkIns.filter(c => c.timestamp.startsWith(todayStr)).length;

  // Expiring this week or expired (Alerts)
  const expiringMembers = members.filter(m => {
    if (m.status === 'por_vencer' || m.status === 'vencido') return true;
    const days = getDaysRemaining(m.endDate);
    return days <= 7;
  });

  // 2. Plan Distribution Data for Donut Chart
  const mensualidadesCount = members.filter(m => m.planType === 'mensualidad').length;
  const tiqueterasCount = members.filter(m => m.planType === 'tiquetera').length;
  const diariosCount = members.filter(m => m.planType === 'diario').length;
  const totalPlans = members.length || 1;

  const pctMensualidad = Math.round((mensualidadesCount / totalPlans) * 100);
  const pctTiquetera = Math.round((tiqueterasCount / totalPlans) * 100);
  const pctDiario = 100 - pctMensualidad - pctTiquetera;

  // 3. Monthly Financial comparison (Nov, Oct, Sep)
  const monthlyData = [
    {
      month: 'Sep 2026',
      income: 1850000,
      expense: 2400000,
    },
    {
      month: 'Oct 2026',
      income: 2750000,
      expense: 2650000,
    },
    {
      month: 'Nov 2026 (Mes Actual)',
      income: 2625000,
      expense: 630000,
    },
  ];

  // 4. Peak Hours Data (6 AM to 9 PM)
  const peakHours = [
    { hour: '06:00', count: 28, isPeak: true },
    { hour: '07:00', count: 42, isPeak: true },
    { hour: '08:00', count: 35, isPeak: true },
    { hour: '09:00', count: 18, isPeak: false },
    { hour: '10:00', count: 12, isPeak: false },
    { hour: '11:00', count: 9, isPeak: false },
    { hour: '12:00', count: 15, isPeak: false },
    { hour: '14:00', count: 14, isPeak: false },
    { hour: '16:00', count: 20, isPeak: false },
    { hour: '17:00', count: 32, isPeak: false },
    { hour: '18:00', count: 48, isPeak: true },
    { hour: '19:00', count: 52, isPeak: true },
    { hour: '20:00', count: 30, isPeak: false },
    { hour: '21:00', count: 14, isPeak: false },
  ];
  const maxPeakCount = Math.max(...peakHours.map(p => p.count));

  return (
    <div className="space-y-6">
      {/* SaaS Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dashboard Gerencial
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              EN VIVO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas operativas, flujo de caja y control proactivo de renovaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToCheckin}
            className="px-4 py-2 rounded-xl bg-dark-950 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Terminal de Acceso</span>
          </button>
          <button
            onClick={onOpenDailyPass}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 text-xs font-extrabold shadow-neon-green hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Pase Diario</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ingresos de Hoy"
          value={formatCurrency(todayIncome)}
          subtitle={`${todayTransactions.length} transacciones registradas`}
          trend={{ value: '18% vs ayer', isPositive: true }}
          icon={<DollarSign className="w-6 h-6" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Socios Activos"
          value={activeMembersCount}
          subtitle={`De ${members.length} socios registrados en total`}
          trend={{ value: '+3 este mes', isPositive: true }}
          icon={<Users className="w-6 h-6" />}
          accentColor="cyan"
          onClick={onNavigateToMembers}
        />
        <MetricCard
          title="Asistencias de Hoy"
          value={todayCheckInsCount}
          subtitle="Entradas validadas en torniquete"
          icon={<Activity className="w-6 h-6" />}
          accentColor="orange"
          onClick={onNavigateToCheckin}
        />
        <MetricCard
          title="Alertas de Renovación"
          value={expiringMembers.length}
          subtitle="Por vencer (<=7d) o ya vencidas"
          trend={{ value: 'Acción requerida', isPositive: false }}
          icon={<AlertTriangle className="w-6 h-6" />}
          accentColor="rose"
        />
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Income vs Expenses (7 cols) */}
        <div className="lg:col-span-7 bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Flujo Financiero Trimestral
                </h3>
                <p className="text-[11px] text-slate-400">Comparativa Ingresos vs Gastos Operativos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span>Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span>Gastos</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4 pt-2">
            {monthlyData.map(item => {
              const maxVal = 3000000;
              const incomePct = Math.round((item.income / maxVal) * 100);
              const expensePct = Math.round((item.expense / maxVal) * 100);

              return (
                <div key={item.month} className="space-y-1.5 bg-dark-950/60 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{item.month}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      Neto: {formatCurrency(item.income - item.expense)}
                    </span>
                  </div>

                  {/* Income bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Ingresos: {formatCurrency(item.income)}</span>
                      <span>{incomePct}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-dark-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-neon-green transition-all duration-500"
                        style={{ width: `${incomePct}%` }}
                      />
                    </div>
                  </div>

                  {/* Expense bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Gastos: {formatCurrency(item.expense)}</span>
                      <span>{expensePct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-dark-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${expensePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Distribution Donut / Radial (5 cols) */}
        <div className="lg:col-span-5 bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Distribución de Modelos
              </h3>
              <p className="text-[11px] text-slate-400">Porcentaje de socios según su plan</p>
            </div>
          </div>

          {/* Graphical Representation */}
          <div className="py-4 flex flex-col items-center justify-center">
            {/* Multi-segment Progress Bar */}
            <div className="w-full h-5 rounded-full bg-dark-950 overflow-hidden flex border border-slate-800 shadow-inner">
              <div
                style={{ width: `${pctMensualidad}%` }}
                className="h-full bg-emerald-500 shadow-neon-green transition-all"
                title={`Mensualidad: ${pctMensualidad}%`}
              />
              <div
                style={{ width: `${pctTiquetera}%` }}
                className="h-full bg-cyan-400 shadow-neon-cyan transition-all"
                title={`Tiquetera: ${pctTiquetera}%`}
              />
              <div
                style={{ width: `${pctDiario}%` }}
                className="h-full bg-orange-500 shadow-neon-orange transition-all"
                title={`Pase Diario: ${pctDiario}%`}
              />
            </div>

            {/* Plan breakdown cards */}
            <div className="w-full grid grid-cols-3 gap-2 mt-5">
              <div className="p-3 rounded-xl bg-dark-950 border border-emerald-500/30 text-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mb-1" />
                <div className="text-xs font-bold text-slate-200">Mensualidad</div>
                <div className="text-lg font-black text-emerald-400">{pctMensualidad}%</div>
                <div className="text-[10px] text-slate-500">{mensualidadesCount} socios</div>
              </div>

              <div className="p-3 rounded-xl bg-dark-950 border border-cyan-500/30 text-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mb-1" />
                <div className="text-xs font-bold text-slate-200">Tiquetera</div>
                <div className="text-lg font-black text-cyan-400">{pctTiquetera}%</div>
                <div className="text-[10px] text-slate-500">{tiqueterasCount} socios</div>
              </div>

              <div className="p-3 rounded-xl bg-dark-950 border border-orange-500/30 text-center">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block mb-1" />
                <div className="text-xs font-bold text-slate-200">Drop-in</div>
                <div className="text-lg font-black text-orange-400">{pctDiario}%</div>
                <div className="text-[10px] text-slate-500">{diariosCount} diarios</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[11px] text-emerald-300 font-semibold">
              💡 La retención de suscripciones mensuales creció un +12% este trimestre.
            </span>
          </div>
        </div>
      </div>

      {/* Peak Gym Attendance Hours Bar Chart */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Horas Pico de Asistencia al Gimnasio
              </h3>
              <p className="text-[11px] text-slate-400">
                Afluencia media por franja horaria (Torniquete y check-ins)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Horas Rush (Pico)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
              Horas Normales
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 pt-4 flex items-end justify-between gap-1 sm:gap-2">
          {peakHours.map(item => {
            const heightPct = Math.round((item.count / maxPeakCount) * 100);
            return (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 group">
                {/* Tooltip value */}
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  {item.count}
                </span>

                {/* Bar */}
                <div className="w-full bg-dark-950 rounded-t-lg h-28 flex items-end p-0.5">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      item.isPeak
                        ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-neon-orange'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                </div>

                {/* Hour label */}
                <span className="text-[10px] text-slate-500 font-mono rotate-[-45deg] sm:rotate-0 mt-1">
                  {item.hour.slice(0, 2)}h
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Renewal Alerts Table with One-Click WhatsApp CTA */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Alertas de Renovación & Recordatorios WhatsApp
              </h3>
              <p className="text-[11px] text-slate-400">
                Socios vencidos o próximos a vencer en los siguientes 7 días
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
            {expiringMembers.length} socios en alerta
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Socio</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Estado / Saldo</th>
                <th className="py-3 px-3">Fecha Corte</th>
                <th className="py-3 px-3 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expiringMembers.slice(0, 6).map(member => {
                const days = getDaysRemaining(member.endDate);
                const isExpired = member.status === 'vencido' || days < 0;
                const isTiquetera = member.planType === 'tiquetera';
                const waLink = generateWhatsAppRenewalLink(member, 'TITAN GYM');

                return (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block">{member.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{member.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 capitalize text-slate-300 font-medium">
                      {member.planType}
                    </td>

                    <td className="py-3 px-3">
                      {isTiquetera ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            (member.remainingCredits ?? 0) <= 0
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {(member.remainingCredits ?? 0) <= 0
                            ? 'Agotada (0 entradas)'
                            : `${member.remainingCredits} entradas restantes`}
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isExpired
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isExpired
                            ? `Vencido hace ${Math.abs(days)}d`
                            : days === 0
                            ? 'Vence hoy'
                            : `Vence en ${days}d`}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      {formatDate(member.endDate)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* WhatsApp CTA Link */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all text-xs font-bold shadow-sm"
                          title="Enviar mensaje personalizado por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>

                        {/* Renew Modal CTA */}
                        <button
                          onClick={() => setRenewMember(member)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-700 text-slate-200 hover:border-emerald-500/50 hover:text-white transition-all text-xs font-bold"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Renovar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renewal Modal */}
      <RenewModal
        isOpen={!!renewMember}
        onClose={() => setRenewMember(null)}
        member={renewMember}
      />
    </div>
  );
};

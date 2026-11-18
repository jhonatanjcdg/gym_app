import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MessageCircle,
  Zap,
  Eye,
  Trash2,
  Calendar,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { Member, PlanType, MemberStatus } from '../../types';
import {
  formatDate,
  getDaysRemaining,
  generateWhatsAppRenewalLink,
} from '../../utils/formatters';
import { MemberDetailModal } from './MemberDetailModal';
import { RenewModal } from './RenewModal';
import { AddMemberModal } from './AddMemberModal';

export const MembersView: React.FC = () => {
  const { members, deleteMember } = useGym();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanTab, setSelectedPlanTab] = useState<'all' | PlanType | 'alertas'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');

  // Modals
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<Member | null>(null);
  const [selectedMemberRenew, setSelectedMemberRenew] = useState<Member | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Filter logic
  const filteredMembers = members.filter(member => {
    // Search
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Plan tab
    if (selectedPlanTab === 'alertas') {
      const days = getDaysRemaining(member.endDate);
      const isExpiring = member.status === 'por_vencer' || member.status === 'vencido' || days <= 3;
      if (!isExpiring) return false;
    } else if (selectedPlanTab !== 'all') {
      if (member.planType !== selectedPlanTab) return false;
    }

    // Status dropdown
    if (statusFilter !== 'all') {
      if (member.status !== statusFilter) return false;
    }

    return true;
  });

  // KPI counters
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === 'activo').length;
  const expiringCount = members.filter(m => m.status === 'por_vencer').length;
  const expiredCount = members.filter(m => m.status === 'vencido').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-neon-green">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Gestión de Socios & Membresías
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {members.length} registrados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control integral de mensualidades, tiqueteras de entradas y drop-in diario.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold text-xs shadow-neon-green hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Inscribir Nuevo Socio</span>
        </button>
      </div>

      {/* KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Socios</span>
            <span className="text-xl font-black text-white">{totalCount}</span>
          </div>
          <Users className="w-5 h-5 text-slate-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-dark-900 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">Activos</span>
            <span className="text-xl font-black text-emerald-400">{activeCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-dark-900 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400 block">Por Vencer (&le;3d)</span>
            <span className="text-xl font-black text-amber-400">{expiringCount}</span>
          </div>
          <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        <div className="p-3.5 rounded-xl bg-dark-900 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-400 block">Vencidos / Sin Saldo</span>
            <span className="text-xl font-black text-rose-400">{expiredCount}</span>
          </div>
          <XCircle className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        {/* Top: Plan filter tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'all', label: 'Todos los Planes' },
            { id: 'mensualidad', label: '📅 Mensualidades' },
            { id: 'tiquetera', label: '🎟️ Tiqueteras' },
            { id: 'diario', label: '⚡ Pases Diarios' },
            { id: 'alertas', label: '⚠️ Alertas de Renovación' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedPlanTab(tab.id as typeof selectedPlanTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPlanTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-dark-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bottom: Search input and Status filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, teléfono o correo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="bg-dark-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
            >
              <option value="all">Todos los Estados</option>
              <option value="activo">Solo Activos</option>
              <option value="por_vencer">Solo Por Vencer</option>
              <option value="vencido">Solo Vencidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Socio</th>
                <th className="py-3 px-4">Cédula / ID</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Vigencia / Créditos</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => {
                  const days = getDaysRemaining(member.endDate);
                  const isTiquetera = member.planType === 'tiquetera';
                  const isExpired = member.status === 'vencido' || days < 0;
                  const isExpiring = member.status === 'por_vencer';

                  return (
                    <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={member.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{member.name}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Document ID */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {member.documentId}
                      </td>

                      {/* Plan Type */}
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-slate-800 text-slate-300 font-semibold text-[11px]">
                          {member.planType}
                        </span>
                      </td>

                      {/* Validity / Credits */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {isTiquetera ? (
                          <div>
                            <span className="font-bold text-cyan-400">
                              {member.remainingCredits ?? 0}
                            </span>
                            <span className="text-slate-500"> / {member.totalCredits ?? 0} entradas</span>
                          </div>
                        ) : member.planType === 'diario' ? (
                          <span className="text-emerald-400 font-bold">Válido Hoy</span>
                        ) : (
                          <div>
                            <span className="text-white font-bold">{formatDate(member.endDate)}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {days < 0 ? `Venció hace ${Math.abs(days)}d` : `Quedan ${days} días`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            member.status === 'activo'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : member.status === 'por_vencer'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {member.status === 'activo' && <CheckCircle2 className="w-3 h-3" />}
                          {member.status === 'por_vencer' && <Clock className="w-3 h-3" />}
                          {member.status === 'vencido' && <AlertTriangle className="w-3 h-3" />}
                          {member.status === 'activo'
                            ? 'Activo'
                            : member.status === 'por_vencer'
                            ? 'Por Vencer'
                            : 'Vencido'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Modal */}
                          <button
                            onClick={() => setSelectedMemberDetail(member)}
                            className="p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                            title="Ver expediente físico, antropometría y rutina"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Renew */}
                          <button
                            onClick={() => setSelectedMemberRenew(member)}
                            className="p-1.5 rounded-lg bg-dark-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            title="Renovar membresía"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Reminder */}
                          <a
                            href={generateWhatsAppRenewalLink(member, 'TITAN GYM')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-dark-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar a ${member.name}?`)) {
                                deleteMember(member.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-dark-950 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-500/30"
                            title="Eliminar socio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron socios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <MemberDetailModal
        isOpen={!!selectedMemberDetail}
        onClose={() => setSelectedMemberDetail(null)}
        member={selectedMemberDetail}
        onOpenRenew={m => {
          setSelectedMemberDetail(null);
          setSelectedMemberRenew(m);
        }}
      />

      <RenewModal
        isOpen={!!selectedMemberRenew}
        onClose={() => setSelectedMemberRenew(null)}
        member={selectedMemberRenew}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </div>
  );
};

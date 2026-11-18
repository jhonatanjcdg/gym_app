import React, { useState } from 'react';
import {
  Calendar,
  Ticket,
  Scale,
  Dumbbell,
  Clock,
  Plus,
  TrendingDown,
  TrendingUp,
  Activity,
  FileText,
  User,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useGym } from '../../context/GymContext';
import { Member, AnthropometryRecord } from '../../types';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  calculateBMI,
  generateWhatsAppRenewalLink,
} from '../../utils/formatters';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onOpenRenew: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onOpenRenew,
}) => {
  const { anthropometry, addAnthropometry, routines, checkIns, transactions } = useGym();
  const [activeTab, setActiveTab] = useState<'antropometria' | 'rutina' | 'historial'>('antropometria');
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);

  // Form states for new measurement
  const [newWeight, setNewWeight] = useState<number>(75);
  const [newHeight, setNewHeight] = useState<number>(175);
  const [newBodyFat, setNewBodyFat] = useState<number>(18);
  const [newMuscle, setNewMuscle] = useState<number>(36);
  const [newWaist, setNewWaist] = useState<number>(82);
  const [newChest, setNewChest] = useState<number>(100);
  const [newHips, setNewHips] = useState<number>(98);
  const [newArm, setNewArm] = useState<number>(35);
  const [newThigh, setNewThigh] = useState<number>(56);
  const [newNotes, setNewNotes] = useState<string>('');

  if (!member) return null;

  // Member-specific data
  const memberAntro = anthropometry
    .filter(a => a.memberId === member.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestAntro = memberAntro[memberAntro.length - 1];
  const memberRoutine = routines.find(r => r.memberId === member.id);
  const memberCheckIns = checkIns.filter(c => c.memberId === member.id || c.documentId === member.documentId);
  const memberTrx = transactions.filter(t => t.memberId === member.id || t.memberName === member.name);

  // Live BMI calculation for the new measurement form
  const liveBmi = calculateBMI(newWeight, newHeight);

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    addAnthropometry({
      memberId: member.id,
      date: new Date().toISOString().split('T')[0],
      weightKg: newWeight,
      heightCm: newHeight,
      bodyFatPct: newBodyFat,
      muscleMassKg: newMuscle,
      waistCm: newWaist,
      chestCm: newChest,
      hipsCm: newHips,
      armCm: newArm,
      thighCm: newThigh,
      notes: newNotes,
    });
    setShowAddMeasurement(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Técnica & Expediente del Socio"
      subtitle={`${member.name} • C.C. ${member.documentId}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-dark-950 via-dark-900 to-dark-850 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={member.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-neon-green shrink-0"
          />

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-black text-white">{member.name}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                  member.status === 'activo'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : member.status === 'por_vencer'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {member.status.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
              <span>ID: {member.id}</span>
              <span>•</span>
              <span>Cédula: {member.documentId}</span>
              <span>•</span>
              <span>Tel: {member.phone}</span>
            </div>

            {/* Quick stats tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Plan: <strong className="text-white capitalize">{member.planType}</strong>
              </span>

              {member.planType === 'tiquetera' ? (
                <span className="px-2.5 py-1 rounded-lg bg-dark-950 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-1.5 font-medium">
                  <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                  Saldo: <strong className="text-white">{member.remainingCredits ?? 0} de {member.totalCredits ?? 0}</strong>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Vence: <strong className="text-white">{formatDate(member.endDate)}</strong>
                </span>
              )}

              {member.emergencyContact && (
                <span className="px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Contacto: {member.emergencyContact.name} ({member.emergencyContact.phone})
                </span>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => onOpenRenew(member)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold text-xs shadow-neon-green hover:brightness-110 active:scale-95 transition-all"
            >
              ⚡ Renovar Plan
            </button>
            <a
              href={generateWhatsAppRenewalLink(member, 'TITAN GYM')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-dark-950 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-2">
          {[
            { id: 'antropometria', label: 'Antropometría & Progreso', icon: <Scale className="w-4 h-4" /> },
            { id: 'rutina', label: 'Rutina Asignada', icon: <Dumbbell className="w-4 h-4" /> },
            { id: 'historial', label: 'Historial Check-in & Pagos', icon: <Activity className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Antropometría & Progreso */}
        {activeTab === 'antropometria' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Evolución Física & Composición Corporal
                </h4>
                <p className="text-xs text-slate-400">
                  Histórico de peso, grasa corporal, masa muscular y medidas corporales
                </p>
              </div>

              <button
                onClick={() => setShowAddMeasurement(!showAddMeasurement)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddMeasurement ? 'Cancelar' : '+ Nueva Medición'}</span>
              </button>
            </div>

            {/* Modal / Form to add measurement */}
            {showAddMeasurement && (
              <form
                onSubmit={handleSaveMeasurement}
                className="p-5 rounded-2xl bg-dark-950 border border-emerald-500/40 space-y-4 animate-in fade-in duration-200 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Registrar Control Antropométrico
                  </span>
                  <div className="text-xs font-mono text-slate-300">
                    IMC Calculado: <span className="font-bold text-white">{liveBmi.bmi}</span> ({liveBmi.category})
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Peso (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newWeight}
                      onChange={e => setNewWeight(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estatura (cm) *</label>
                    <input
                      type="number"
                      required
                      value={newHeight}
                      onChange={e => setNewHeight(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">% Grasa</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBodyFat}
                      onChange={e => setNewBodyFat(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Masa Muscular (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMuscle}
                      onChange={e => setNewMuscle(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Cintura (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newWaist}
                      onChange={e => setNewWaist(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Pecho (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newChest}
                      onChange={e => setNewChest(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Cadera (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newHips}
                      onChange={e => setNewHips(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Brazo (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newArm}
                      onChange={e => setNewArm(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Muslo (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newThigh}
                      onChange={e => setNewThigh(Number(e.target.value))}
                      className="w-full bg-dark-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Notas / Observaciones del Evaluador</label>
                  <input
                    type="text"
                    placeholder="Ej. Reducción notable en porcentaje graso."
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddMeasurement(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 text-dark-950 font-bold text-xs shadow-neon-green"
                  >
                    Guardar Ficha
                  </button>
                </div>
              </form>
            )}

            {/* Latest KPI Highlights */}
            {latestAntro ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Peso Actual</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-white">{latestAntro.weightKg}</span>
                    <span className="text-xs text-slate-400 font-bold">kg</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <TrendingDown className="w-3 h-3" /> Progreso positivo
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">% Grasa Corporal</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-cyan-400">{latestAntro.bodyFatPct}%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Bajo control</span>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Masa Muscular</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-emerald-400">{latestAntro.muscleMassKg}</span>
                    <span className="text-xs text-slate-400 font-bold">kg</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> Hipertrofia
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Índice IMC</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-white">{latestAntro.bmi}</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-semibold">{latestAntro.bmiCategory}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-center text-xs text-slate-400">
                No hay mediciones antropométricas previas registradas para este socio.
              </div>
            )}

            {/* Measurements Table History */}
            {memberAntro.length > 0 && (
              <div className="bg-dark-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 text-xs font-bold text-white">
                  Histórico de Mediciones Antropométricas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-dark-900/60 text-slate-400 text-[10px] uppercase font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Peso</th>
                        <th className="py-2.5 px-3">% Grasa</th>
                        <th className="py-2.5 px-3">Músculo</th>
                        <th className="py-2.5 px-3">Cintura</th>
                        <th className="py-2.5 px-3">Pecho</th>
                        <th className="py-2.5 px-3">Brazo</th>
                        <th className="py-2.5 px-3">IMC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {memberAntro.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-sans text-white font-medium">{formatDate(rec.date)}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{rec.weightKg} kg</td>
                          <td className="py-2.5 px-3 text-cyan-400">{rec.bodyFatPct}%</td>
                          <td className="py-2.5 px-3 text-emerald-400">{rec.muscleMassKg} kg</td>
                          <td className="py-2.5 px-3 text-slate-300">{rec.waistCm} cm</td>
                          <td className="py-2.5 px-3 text-slate-300">{rec.chestCm} cm</td>
                          <td className="py-2.5 px-3 text-slate-300">{rec.armCm} cm</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white">{rec.bmi}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Rutina Asignada */}
        {activeTab === 'rutina' && (
          <div className="space-y-4">
            {memberRoutine ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-dark-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Objetivo: {memberRoutine.goal}
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-0.5">{memberRoutine.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Asignada por: <strong className="text-slate-200">{memberRoutine.assignedBy}</strong> ({formatDate(memberRoutine.assignedAt)})
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {memberRoutine.days.length} Días de Entrenamiento
                  </span>
                </div>

                {/* Days Breakdown */}
                <div className="space-y-4">
                  {memberRoutine.days.map((day, idx) => (
                    <div key={idx} className="bg-dark-950 rounded-2xl border border-slate-800 overflow-hidden">
                      <div className="px-4 py-3 bg-dark-900 border-b border-slate-800 font-bold text-xs text-emerald-300 flex items-center justify-between">
                        <span>{day.dayName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {day.exercises.length} Ejercicios
                        </span>
                      </div>

                      <div className="divide-y divide-slate-800/60">
                        {day.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="p-3.5 hover:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{ex.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                                  {ex.muscleGroup}
                                </span>
                              </div>
                              {ex.notes && <p className="text-[11px] text-slate-400 mt-0.5">{ex.notes}</p>}
                            </div>

                            <div className="flex items-center gap-4 font-mono text-slate-300">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Series x Reps</span>
                                <span className="font-bold text-emerald-400">{ex.sets} x {ex.reps}</span>
                              </div>
                              {ex.suggestedWeightKg && (
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Peso Sugerido</span>
                                  <span className="font-bold text-white">{ex.suggestedWeightKg} kg</span>
                                </div>
                              )}
                              {ex.restSeconds && (
                                <div>
                                  <span className="text-[10px] text-slate-500 block">Descanso</span>
                                  <span className="text-slate-400">{ex.restSeconds}s</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-dark-950 border border-slate-800 text-center space-y-3">
                <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">Sin rutina personalizada asignada</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Este socio aún no tiene una rutina activa. Puedes asignarle un plan desde el módulo de "Gestor de Rutinas".
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Historial Check-in & Pagos */}
        {activeTab === 'historial' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-ins */}
            <div className="bg-dark-950 rounded-2xl border border-slate-800 p-4">
              <h5 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Asistencias Registradas ({memberCheckIns.length})
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memberCheckIns.length > 0 ? (
                  memberCheckIns.map(chk => (
                    <div key={chk.id} className="p-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-mono text-slate-300 block">{formatDateTime(chk.timestamp)}</span>
                        <span className="text-[10px] text-slate-500">{chk.reason || 'Acceso concedido'}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        chk.status === 'permitido' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {chk.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No hay registros de asistencia para este socio.</p>
                )}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-dark-950 rounded-2xl border border-slate-800 p-4">
              <h5 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Pagos & Recibos ({memberTrx.length})
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {memberTrx.length > 0 ? (
                  memberTrx.map(trx => (
                    <div key={trx.id} className="p-2.5 rounded-xl bg-dark-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{trx.description}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(trx.date)} • {trx.receiptNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 font-mono block">{formatCurrency(trx.amount)}</span>
                        <span className="text-[10px] text-slate-400">{trx.paymentMethod}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No hay transacciones asociadas directamente.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

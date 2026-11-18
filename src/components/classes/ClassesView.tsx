import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  UserCheck,
  UserPlus,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { GroupClass, Member } from '../../types';
import { Modal } from '../common/Modal';

export const ClassesView: React.FC = () => {
  const { classes, members, toggleEnrollClass } = useGym();
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Lunes
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
  const [memberToEnrollId, setMemberToEnrollId] = useState<string>('');

  const daysOfWeek = [
    { day: 1, label: 'Lunes' },
    { day: 2, label: 'Martes' },
    { day: 3, label: 'Miércoles' },
    { day: 4, label: 'Jueves' },
    { day: 5, label: 'Viernes' },
    { day: 6, label: 'Sábado' },
  ];

  const filteredClasses = classes.filter(cls => cls.dayOfWeek === selectedDay);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !memberToEnrollId) return;

    toggleEnrollClass(selectedClass.id, memberToEnrollId);

    // Refresh selected class from state
    const updated = classes.find(c => c.id === selectedClass.id);
    if (updated) setSelectedClass(updated);
    setMemberToEnrollId('');
  };

  const handleRemoveEnrollment = (memberId: string) => {
    if (!selectedClass) return;
    toggleEnrollClass(selectedClass.id, memberId);

    // Refresh selected class from state
    const updated = classes.find(c => c.id === selectedClass.id);
    if (updated) setSelectedClass(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Agenda de Clases Grupales
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {classes.length} clases programadas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control de cupos en tiempo real, asignación de instructores y reserva de asistentes.
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-dark-950 p-1.5 rounded-xl border border-slate-800">
          {daysOfWeek.map(d => (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDay === d.day
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 shadow-neon-green'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(cls => {
            const enrolledCount = cls.enrolledMemberIds.length;
            const occupancyPct = Math.round((enrolledCount / cls.capacity) * 100);
            const isFull = enrolledCount >= cls.capacity;

            return (
              <div
                key={cls.id}
                className="bg-dark-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-cyan-500/40 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${cls.color}20`,
                        borderColor: `${cls.color}50`,
                        color: cls.color,
                      }}
                    >
                      {cls.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isFull
                          ? 'bg-rose-500/20 text-rose-400'
                          : occupancyPct >= 75
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isFull ? 'Cupo Lleno' : `${cls.capacity - enrolledCount} cupos libres`}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">
                    {cls.name}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Coach: <strong className="text-white">{cls.trainer}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>{cls.room}</span>
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Ocupación ({occupancyPct}%)</span>
                      <span className="font-bold text-white">
                        {enrolledCount} / {cls.capacity} socios
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-dark-950 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${occupancyPct}%`,
                          backgroundColor: cls.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="w-full py-2 px-3 rounded-xl bg-dark-950 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Ver Asistentes & Inscribir</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs bg-dark-900 border border-slate-800 rounded-2xl">
            No hay clases programadas para este día de la semana.
          </div>
        )}
      </div>

      {/* Class Attendees & Reservation Modal */}
      {selectedClass && (
        <Modal
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          title={`Lista de Asistentes: ${selectedClass.name}`}
          subtitle={`${selectedClass.dayName} • ${selectedClass.startTime} - ${selectedClass.endTime} • Coach ${selectedClass.trainer}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Quick Enroll form */}
            <form onSubmit={handleEnroll} className="p-3.5 rounded-xl bg-dark-950 border border-slate-800 flex gap-2">
              <select
                value={memberToEnrollId}
                onChange={e => setMemberToEnrollId(e.target.value)}
                className="flex-1 bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">Seleccionar socio a inscribir...</option>
                {members.map(m => {
                  const alreadyEnrolled = selectedClass.enrolledMemberIds.includes(m.id);
                  return (
                    <option key={m.id} value={m.id} disabled={alreadyEnrolled}>
                      {m.name} ({m.documentId}) {alreadyEnrolled ? '- Ya inscrito' : ''}
                    </option>
                  );
                })}
              </select>

              <button
                type="submit"
                disabled={!memberToEnrollId || selectedClass.enrolledMemberIds.length >= selectedClass.capacity}
                className="px-4 py-2 rounded-xl bg-emerald-500 disabled:bg-slate-800 text-dark-950 font-bold text-xs shadow-neon-green flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Inscribir</span>
              </button>
            </form>

            {/* Attendees list */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Socios Inscritos ({selectedClass.enrolledMemberIds.length} / {selectedClass.capacity})</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {selectedClass.enrolledMemberIds.map(memId => {
                  const member = members.find(m => m.id === memId);
                  if (!member) return null;

                  return (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{member.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Cédula: {member.documentId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-900 border border-slate-700 text-slate-300 capitalize">
                          {member.planType}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveEnrollment(member.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Cancelar inscripción y liberar cupo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

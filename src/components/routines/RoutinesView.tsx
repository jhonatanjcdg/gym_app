import React, { useState } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  User,
  Calendar,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { WorkoutRoutine, RoutineDay, ExerciseItem } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const RoutinesView: React.FC = () => {
  const { routines, members, saveRoutine } = useGym();
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(routines[0] || null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Routine Builder State
  const [targetMemberId, setTargetMemberId] = useState(members[0]?.id || '');
  const [routineName, setRoutineName] = useState('');
  const [goal, setGoal] = useState<WorkoutRoutine['goal']>('Hipertrofia');
  const [coachName, setCoachName] = useState('Coach Alexander Pérez');

  const [days, setDays] = useState<RoutineDay[]>([
    {
      dayName: 'Día 1: Pecho & Tríceps',
      exercises: [
        { name: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', sets: 4, reps: '8-10', suggestedWeightKg: '70', restSeconds: 90 },
        { name: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', sets: 3, reps: '10-12', suggestedWeightKg: '22', restSeconds: 60 },
        { name: 'Fondos en Paralelas / Máquina', muscleGroup: 'Brazos', sets: 3, reps: '12', restSeconds: 60 },
      ],
    },
    {
      dayName: 'Día 2: Espalda & Bíceps',
      exercises: [
        { name: 'Jalón al Pecho en Polea', muscleGroup: 'Espalda', sets: 4, reps: '10-12', suggestedWeightKg: '55', restSeconds: 75 },
        { name: 'Remo con Mancuerna Unilateral', muscleGroup: 'Espalda', sets: 3, reps: '10', suggestedWeightKg: '26', restSeconds: 60 },
        { name: 'Curl de Bíceps con Barra Z', muscleGroup: 'Brazos', sets: 4, reps: '12', suggestedWeightKg: '25', restSeconds: 60 },
      ],
    },
  ]);

  const addDay = () => {
    setDays(prev => [
      ...prev,
      {
        dayName: `Día ${prev.length + 1}: Piernas & Abdomen`,
        exercises: [
          { name: 'Sentadilla Libre con Barra', muscleGroup: 'Piernas', sets: 4, reps: '8-10', suggestedWeightKg: '80', restSeconds: 120 },
        ],
      },
    ]);
  };

  const removeDay = (dayIndex: number) => {
    setDays(prev => prev.filter((_, idx) => idx !== dayIndex));
  };

  const addExercise = (dayIndex: number) => {
    setDays(prev =>
      prev.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            exercises: [
              ...day.exercises,
              { name: 'Nuevo Ejercicio', muscleGroup: 'Pecho', sets: 3, reps: '10-12', suggestedWeightKg: '20', restSeconds: 60 },
            ],
          };
        }
        return day;
      })
    );
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    setDays(prev =>
      prev.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            exercises: day.exercises.filter((_, eIdx) => eIdx !== exIndex),
          };
        }
        return day;
      })
    );
  };

  const updateExercise = (dayIndex: number, exIndex: number, field: keyof ExerciseItem, value: any) => {
    setDays(prev =>
      prev.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            exercises: day.exercises.map((ex, eIdx) => {
              if (eIdx === exIndex) {
                return { ...ex, [field]: value };
              }
              return ex;
            }),
          };
        }
        return day;
      })
    );
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find(m => m.id === targetMemberId);
    if (!targetMember) return;

    const newRoutine: WorkoutRoutine = {
      id: `ROU-${Date.now()}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      name: routineName.trim() || `Plan Personalizado - ${goal}`,
      goal,
      assignedBy: coachName.trim(),
      assignedAt: new Date().toISOString().split('T')[0],
      days,
    };

    saveRoutine(newRoutine);
    setSelectedRoutine(newRoutine);
    setIsBuilderOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-neon-green">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Gestor de Rutinas & Entrenamientos
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {routines.length} asignadas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prescripción deportiva personalizada: series, repeticiones, cargas y tiempos de descanso.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold text-xs shadow-neon-green hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Crear & Asignar Rutina</span>
        </button>
      </div>

      {/* Main Grid: Routines Sidebar + Active Routine View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Routines List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Planes de Entrenamiento
          </h3>

          <div className="space-y-2">
            {routines.map(routine => {
              const isSelected = selectedRoutine?.id === routine.id;
              return (
                <div
                  key={routine.id}
                  onClick={() => setSelectedRoutine(routine)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-neon-green'
                      : 'bg-dark-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {routine.goal}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {routine.days.length} días
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white">{routine.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Socio: <strong className="text-slate-200">{routine.memberName || 'Asignado'}</strong></span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Routine Details & Exercises (8 cols) */}
        <div className="lg:col-span-8">
          {selectedRoutine ? (
            <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {selectedRoutine.goal}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Asignado: {formatDate(selectedRoutine.assignedAt)}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{selectedRoutine.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Entrenador: <strong className="text-slate-200">{selectedRoutine.assignedBy}</strong> • Socio:{' '}
                    <strong className="text-emerald-400">{selectedRoutine.memberName}</strong>
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Rutina</span>
                </button>
              </div>

              {/* Days List */}
              <div className="space-y-5">
                {selectedRoutine.days.map((day, dIdx) => (
                  <div key={dIdx} className="bg-dark-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-dark-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-400 tracking-wide uppercase">
                        {day.dayName}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {day.exercises.length} Ejercicios
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/60">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="p-4 hover:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{ex.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                                {ex.muscleGroup}
                              </span>
                            </div>
                            {ex.notes && <p className="text-xs text-slate-400 mt-1 italic">{ex.notes}</p>}
                          </div>

                          <div className="flex items-center gap-5 text-xs font-mono">
                            <div className="text-center">
                              <span className="text-[10px] text-slate-500 block uppercase">Series x Reps</span>
                              <span className="font-extrabold text-emerald-400 text-sm">{ex.sets} x {ex.reps}</span>
                            </div>
                            {ex.suggestedWeightKg && (
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 block uppercase">Peso</span>
                                <span className="font-bold text-white">{ex.suggestedWeightKg} kg</span>
                              </div>
                            )}
                            {ex.restSeconds && (
                              <div className="text-center">
                                <span className="text-[10px] text-slate-500 block uppercase">Pausa</span>
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
            <div className="p-12 text-center text-slate-500 text-xs bg-dark-900 border border-slate-800 rounded-2xl">
              Selecciona una rutina para visualizar sus detalles.
            </div>
          )}
        </div>
      </div>

      {/* Routine Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Creador & Asignador de Rutinas"
        subtitle="Construye un plan por días con series, repeticiones y cargas prescritas"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveRoutine} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asignar al Socio *</label>
              <select
                value={targetMemberId}
                onChange={e => setTargetMemberId(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.documentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Rutina *</label>
              <input
                type="text"
                required
                placeholder="Ej. Hipertrofia Push/Pull/Legs"
                value={routineName}
                onChange={e => setRoutineName(e.target.value)}
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Objetivo Deportivo</label>
              <select
                value={goal}
                onChange={e => setGoal(e.target.value as WorkoutRoutine['goal'])}
                className="w-full bg-dark-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Hipertrofia">Hipertrofia Muscular</option>
                <option value="Pérdida de Grasa">Pérdida de Grasa & Quema</option>
                <option value="Fuerza">Fuerza Máxima</option>
                <option value="Resistencia">Resistencia & Acondicionamiento</option>
                <option value="Salud y Postura">Salud & Postura</option>
              </select>
            </div>
          </div>

          {/* Days Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Estructura de Días y Ejercicios
              </span>
              <button
                type="button"
                onClick={addDay}
                className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Día</span>
              </button>
            </div>

            {days.map((day, dIdx) => (
              <div key={dIdx} className="p-4 bg-dark-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={day.dayName}
                    onChange={e => {
                      const newName = e.target.value;
                      setDays(prev =>
                        prev.map((d, idx) => (idx === dIdx ? { ...d, dayName: newName } : d))
                      );
                    }}
                    className="bg-dark-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white flex-1 max-w-sm"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addExercise(dIdx)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ejercicio</span>
                    </button>
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(dIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Exercises Table in Day */}
                <div className="space-y-2">
                  {day.exercises.map((ex, eIdx) => (
                    <div key={eIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-dark-900/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Nombre del ejercicio"
                          value={ex.name}
                          onChange={e => updateExercise(dIdx, eIdx, 'name', e.target.value)}
                          className="w-full bg-dark-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <select
                          value={ex.muscleGroup}
                          onChange={e => updateExercise(dIdx, eIdx, 'muscleGroup', e.target.value)}
                          className="w-full bg-dark-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px]"
                        >
                          <option value="Pecho">Pecho</option>
                          <option value="Espalda">Espalda</option>
                          <option value="Piernas">Piernas</option>
                          <option value="Hombros">Hombros</option>
                          <option value="Brazos">Brazos</option>
                          <option value="Core">Core</option>
                          <option value="Cardio">Cardio</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Sets x Reps (4x10)"
                          value={ex.reps}
                          onChange={e => updateExercise(dIdx, eIdx, 'reps', e.target.value)}
                          className="w-full bg-dark-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Peso (kg)"
                          value={ex.suggestedWeightKg || ''}
                          onChange={e => updateExercise(dIdx, eIdx, 'suggestedWeightKg', e.target.value)}
                          className="w-full bg-dark-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeExercise(dIdx, eIdx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsBuilderOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold text-xs shadow-neon-green"
            >
              Guardar y Asignar Rutina
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

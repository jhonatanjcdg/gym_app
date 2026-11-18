import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Plus,
  Clock,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { GymEquipment } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';

export const EquipmentView: React.FC = () => {
  const { equipment, updateEquipment } = useGym();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<GymEquipment | null>(null);

  // Status counters
  const totalCount = equipment.length;
  const operationalCount = equipment.filter(e => e.status === 'Operativo').length;
  const inMaintenanceCount = equipment.filter(e => e.status === 'En mantenimiento').length;
  const outOfServiceCount = equipment.filter(e => e.status === 'Fuera de servicio').length;

  const filteredEquipment = equipment.filter(e => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    return true;
  });

  const handleStatusChange = (id: string, newStatus: GymEquipment['status']) => {
    updateEquipment(id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-neon-orange">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Mantenimiento de Máquinas & Equipos
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {equipment.length} equipos inventariados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control del estado operativo, fechas de inspección técnica preventiva y reporte de fallas.
            </p>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-xl border border-slate-800">
          {['all', 'Cardio', 'Fuerza', 'Peso Libre'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Status Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-dark-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Flota</span>
            <span className="text-xl font-black text-white">{totalCount}</span>
          </div>
          <Settings className="w-5 h-5 text-slate-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-dark-900 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">🟢 Operativos (100%)</span>
            <span className="text-xl font-black text-emerald-400">{operationalCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-dark-900 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-400 block">🟡 En Mantenimiento</span>
            <span className="text-xl font-black text-amber-400">{inMaintenanceCount}</span>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 rounded-xl bg-dark-900 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-rose-400 block">🔴 Fuera de Servicio</span>
            <span className="text-xl font-black text-rose-400">{outOfServiceCount}</span>
          </div>
          <XCircle className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map(item => {
          let statusBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
          let statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;

          if (item.status === 'En mantenimiento') {
            statusBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            statusIcon = <Clock className="w-3.5 h-3.5" />;
          } else if (item.status === 'Fuera de servicio') {
            statusBadgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            statusIcon = <XCircle className="w-3.5 h-3.5" />;
          }

          return (
            <div
              key={item.id}
              className="bg-dark-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{item.serialNumber}</span>
                </div>

                <h3 className="text-sm font-black text-white leading-snug">{item.name}</h3>

                {item.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 p-2 rounded-xl bg-dark-950 border border-slate-800 italic">
                    "{item.notes}"
                  </p>
                )}

                {/* Dates */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Última Revisión:</span>
                    <span className="text-slate-300">{formatDate(item.lastMaintenanceDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Próxima Revisión:</span>
                    <span className="text-orange-400 font-bold">{formatDate(item.nextMaintenanceDate)}</span>
                  </div>
                </div>
              </div>

              {/* Status Switcher Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
                  {statusIcon}
                  <span>{item.status}</span>
                </span>

                <select
                  value={item.status}
                  onChange={e => handleStatusChange(item.id, e.target.value as GymEquipment['status'])}
                  className="bg-dark-950 border border-slate-700 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="Operativo">🟢 Operativo</option>
                  <option value="En mantenimiento">🟡 En Mantenimiento</option>
                  <option value="Fuera de servicio">🔴 Fuera de Servicio</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

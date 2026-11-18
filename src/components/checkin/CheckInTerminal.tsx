import React, { useState, useRef, useEffect } from 'react';
import {
  ScanLine,
  CheckCircle2,
  XCircle,
  QrCode,
  Zap,
  RotateCw,
  Search,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useGym, CheckInResult } from '../../context/GymContext';
import { Member } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { RenewModal } from '../members/RenewModal';
import { playScannerBeep } from '../../utils/audio';

export const CheckInTerminal: React.FC = () => {
  const { processCheckIn, checkIns, members } = useGym();
  const [docInput, setDocInput] = useState('');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [renewTargetMember, setRenewTargetMember] = useState<Member | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCheckIn = (idToProcess?: string) => {
    const target = idToProcess !== undefined ? idToProcess : docInput;
    if (!target.trim()) return;

    playScannerBeep();
    const result = processCheckIn(target.trim());
    setLastResult(result);
    setDocInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckIn();
    }
  };

  // Simulate scanning a test QR code
  const handleSimulateScan = (docId: string) => {
    setDocInput(docId);
    playScannerBeep();
    setTimeout(() => {
      handleCheckIn(docId);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-neon-green">
            <ScanLine className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Terminal de Acceso & Torniquete
              </h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Validación en tiempo real con alertas sonoras, control de cupos y descuento automático de tiqueteras.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsScanningQR(!isScanningQR)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
            isScanningQR
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-neon-cyan'
              : 'bg-dark-950 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>{isScanningQR ? 'Cerrar Cámara QR' : 'Simulador Cámara QR'}</span>
        </button>
      </div>

      {/* Main Grid: Input & Result Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel (lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main ID Input Box */}
          <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Ingrese Documento / Cédula / ID
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={docInput}
                onChange={e => setDocInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej. 1017234890"
                className="w-full bg-dark-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3.5 pl-11 text-lg font-mono text-white placeholder-slate-600 focus:outline-none transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-4" />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleCheckIn()}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-dark-950 font-extrabold text-sm shadow-neon-green transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                Validar Acceso [Enter]
              </button>
              {docInput && (
                <button
                  onClick={() => setDocInput('')}
                  className="px-3 py-3 rounded-xl bg-dark-950 border border-slate-800 text-slate-400 hover:text-white"
                  title="Limpiar"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Simulated QR Camera Scanner View */}
            {isScanningQR && (
              <div className="mt-5 p-4 rounded-xl bg-dark-950 border border-cyan-500/30 text-center animate-in fade-in duration-300">
                <div className="relative w-full h-44 bg-dark-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#06b6d4] animate-bounce" />
                  <QrCode className="w-20 h-20 text-slate-700 animate-pulse" />
                  <div className="absolute bottom-2 inset-x-0 text-[11px] text-cyan-400 font-mono">
                    Apunte el carnet digital / QR al sensor
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Lector óptico conectado y transmitiendo en tiempo real
                </p>
              </div>
            )}
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="bg-dark-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Casos de Prueba Rápida (Demo)</span>
              </div>
              <span className="text-[10px] text-slate-500">1-click test</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Haz clic en cualquiera de estos perfiles para probar inmediatamente la validación sonora y visual:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateScan('1017234890')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-dark-950 hover:bg-slate-800/80 border border-emerald-500/20 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Carlos Mendoza
                  </span>
                  <span className="block text-[10px] text-slate-400">Mensualidad Activa (14 días)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Acceso OK
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan('1035678912')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-dark-950 hover:bg-slate-800/80 border border-amber-500/20 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Camila Morales
                  </span>
                  <span className="block text-[10px] text-slate-400">Mensualidad Por Vencer (1 día)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Alerta Visual
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan('1015678234')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-dark-950 hover:bg-slate-800/80 border border-rose-500/20 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                    Sebastián Herrera
                  </span>
                  <span className="block text-[10px] text-slate-400">Mensualidad Vencida hace 4 días</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Denegado 🚫
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan('1094567812')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-dark-950 hover:bg-slate-800/80 border border-cyan-500/20 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Mateo Londoño
                  </span>
                  <span className="block text-[10px] text-slate-400">Tiquetera (Descuenta 1 entrada)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  -1 Crédito
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateScan('1019876543')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-dark-950 hover:bg-slate-800/80 border border-rose-500/20 text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                    Santiago Peña
                  </span>
                  <span className="block text-[10px] text-slate-400">Tiquetera Agotada (0 créditos)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Sin Saldo 🚫
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Visual Alert Card & Status Banner (lg: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Real-time Visual Alert Card */}
          {lastResult ? (
            <div
              className={`rounded-2xl p-6 sm:p-8 border-2 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${
                lastResult.success
                  ? 'bg-gradient-to-br from-emerald-950/40 via-dark-900 to-dark-950 border-emerald-500/60 shadow-neon-green'
                  : 'bg-gradient-to-br from-rose-950/40 via-dark-900 to-dark-950 border-rose-500/60 shadow-neon-rose'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Result Icon / Avatar */}
                <div className="relative shrink-0">
                  {lastResult.member?.avatar ? (
                    <img
                      src={lastResult.member.avatar}
                      alt={lastResult.member.name}
                      className={`w-24 h-24 rounded-2xl object-cover border-2 shadow-xl ${
                        lastResult.success ? 'border-emerald-400' : 'border-rose-500'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 ${
                        lastResult.success
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                          : 'bg-rose-500/20 border-rose-400 text-rose-400'
                      }`}
                    >
                      {lastResult.success ? (
                        <CheckCircle2 className="w-12 h-12" />
                      ) : (
                        <XCircle className="w-12 h-12" />
                      )}
                    </div>
                  )}

                  <div
                    className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-2 border-dark-900 text-white ${
                      lastResult.success ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  >
                    {lastResult.success ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 border shadow-sm"
                    style={{
                      backgroundColor: lastResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                      borderColor: lastResult.success ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)',
                      color: lastResult.success ? '#34d399' : '#fb7185',
                    }}
                  >
                    {lastResult.success ? '🟢 ACCESO CONCEDIDO' : '🔴 ACCESO DENEGADO'}
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight truncate">
                    {lastResult.member?.name || lastResult.record.memberName}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Documento: <span className="text-slate-200">{lastResult.record.documentId}</span>
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-dark-950/70 border border-slate-800 text-xs">
                    <p className={`font-semibold ${lastResult.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {lastResult.record.reason}
                    </p>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-dark-950/80 border border-slate-800 text-left">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Tipo de Plan</span>
                      <span className="text-xs font-bold text-white capitalize">
                        {lastResult.record.planType}
                      </span>
                    </div>

                    {lastResult.record.planType === 'tiquetera' ? (
                      <div className="p-2.5 rounded-xl bg-dark-950/80 border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Créditos Restantes</span>
                        <span className="text-xs font-extrabold text-cyan-400">
                          {lastResult.record.remainingCredits ?? 0} entradas
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-dark-950/80 border border-slate-800 text-left">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Vigencia</span>
                        <span
                          className={`text-xs font-extrabold ${
                            (lastResult.record.remainingDays ?? 0) < 0
                              ? 'text-rose-400'
                              : (lastResult.record.remainingDays ?? 0) <= 3
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {lastResult.record.remainingDays !== undefined
                            ? lastResult.record.remainingDays < 0
                              ? `Venció hace ${Math.abs(lastResult.record.remainingDays)}d`
                              : `${lastResult.record.remainingDays} días restantes`
                            : 'Válido hoy'}
                        </span>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-dark-950/80 border border-slate-800 text-left col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Hora</span>
                      <span className="text-xs font-mono text-slate-300">
                        {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Renew Button when Denied or Expiring */}
                  {(!lastResult.success || (lastResult.record.remainingDays !== undefined && lastResult.record.remainingDays <= 3)) && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                      <button
                        onClick={() => {
                          const target = lastResult.member || members.find(m => m.documentId === lastResult.record.documentId);
                          if (target) setRenewTargetMember(target);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 font-bold text-xs shadow-neon-green hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        <span>⚡ Renovar Membresía Ahora</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-8 border border-slate-800 bg-dark-900/60 flex flex-col items-center justify-center text-center min-h-[220px]">
              <div className="w-16 h-16 rounded-2xl bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <ScanLine className="w-8 h-8 animate-pulse text-emerald-500/50" />
              </div>
              <h4 className="text-base font-bold text-white">Listo para Escaneo o Cédula</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Ingrese el documento del socio en el teclado o elija un caso de prueba para validar el acceso.
              </p>
            </div>
          )}

          {/* Today's Live Check-in Feed */}
          <div className="flex-1 bg-dark-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Historial de Ingresos de Hoy
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                {checkIns.length} asistencias
              </span>
            </div>

            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-950/80 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Socio</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Hora</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {checkIns.map(chk => {
                    const isAllowed = chk.status === 'permitido';
                    return (
                      <tr key={chk.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          <div>{chk.memberName}</div>
                          <span className="text-[10px] font-mono text-slate-400">{chk.documentId}</span>
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-300">
                          {chk.planType}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {formatDateTime(chk.timestamp).split(',')[1] || formatDateTime(chk.timestamp)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isAllowed
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {isAllowed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isAllowed ? 'Permitido' : 'Denegado'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-[200px] truncate" title={chk.reason}>
                          {chk.reason || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Modal */}
      <RenewModal
        isOpen={!!renewTargetMember}
        onClose={() => setRenewTargetMember(null)}
        member={renewTargetMember}
      />
    </div>
  );
};

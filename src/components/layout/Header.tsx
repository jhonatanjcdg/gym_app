import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Zap,
  Menu,
  Clock,
  Sparkles,
  Cloud,
  CloudUpload,
  RefreshCw,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenQuickCheckIn: () => void;
  onOpenDailyPass: () => void;
  onOpenCloudSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenQuickCheckIn,
  onOpenDailyPass,
  onOpenCloudSync,
}) => {
  const {
    currentRole,
    setCurrentRole,
    soundEnabled,
    setSoundEnabled,
    resetToSeedData,
    cloudSyncStatus,
    isSyncingCloud,
    pendingChangesCount,
  } = useGym();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-dark-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-200">{timeStr || '17:44 PM'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">17 Nov 2026</span>
        </div>
      </div>

      {/* Center / Action Shortcuts */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQuickCheckIn}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          title="Abrir terminal de acceso"
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Torniquete Check-in</span>
          <kbd className="hidden xl:inline px-1.5 py-0.5 text-[10px] bg-emerald-500/20 rounded text-emerald-300 font-mono">
            F2
          </kbd>
        </button>

        <button
          onClick={onOpenDailyPass}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-dark-950 text-xs font-bold shadow-neon-green hover:brightness-110 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Pase Diario</span>
          <span className="sm:hidden">+ Diario</span>
        </button>
      </div>

      {/* Right: Role Switcher & Audio Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill */}
        <div className="flex items-center bg-dark-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'admin'
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Modo Administrador: Acceso total a finanzas, configuración y socios"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            onClick={() => setCurrentRole('staff')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'staff'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Modo Recepción / Entrenador: Check-in, ventas básicas y rutinas (Finanzas protegidas)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recepción</span>
          </button>
        </div>

        {/* Cloud Sync Status Pill */}
        <button
          onClick={onOpenCloudSync}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            cloudSyncStatus === 'synced'
              ? 'bg-dark-900 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
          }`}
          title="Seguridad: Copia Local Excel + Sincronización en la Nube"
        >
          {isSyncingCloud ? (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : cloudSyncStatus === 'synced' ? (
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <CloudUpload className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          )}
          <span className="hidden md:inline">
            {isSyncingCloud ? 'Subiendo...' : cloudSyncStatus === 'synced' ? 'Nube OK' : `${pendingChangesCount} pendientes`}
          </span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled
              ? 'bg-dark-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40'
              : 'bg-dark-900 border-rose-500/30 text-rose-400'
          }`}
          title={soundEnabled ? 'Silenciar alertas sonoras' : 'Activar alertas sonoras'}
          aria-label="Alternar sonido"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('¿Restablecer los datos de demostración a su estado inicial?')) {
              resetToSeedData();
            }
          }}
          className="p-2 rounded-xl bg-dark-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          title="Restablecer datos de prueba"
          aria-label="Restablecer datos"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

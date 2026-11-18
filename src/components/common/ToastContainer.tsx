import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useGym } from '../../context/GymContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGym();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let borderClass = 'border-emerald-500/40 bg-dark-900/95 text-emerald-300';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;

        if (toast.type === 'error') {
          borderClass = 'border-rose-500/40 bg-dark-900/95 text-rose-300';
          icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40 bg-dark-900/95 text-amber-300';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-cyan-500/40 bg-dark-900/95 text-cyan-300';
          icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white tracking-wide">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

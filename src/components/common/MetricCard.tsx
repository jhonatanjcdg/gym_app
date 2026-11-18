import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'emerald' | 'cyan' | 'orange' | 'rose' | 'purple';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'emerald',
  onClick,
}) => {
  const accentStyles = {
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      valueColor: 'text-white',
    },
    cyan: {
      border: 'hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]',
      valueColor: 'text-white',
    },
    orange: {
      border: 'hover:border-orange-500/50',
      iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      glow: 'group-hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]',
      valueColor: 'text-white',
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      valueColor: 'text-white',
    },
    purple: {
      border: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      valueColor: 'text-white',
    },
  };

  const style = accentStyles[accentColor];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl bg-dark-900/90 border border-slate-800/80 p-5 transition-all duration-300 ${
        style.border
      } ${style.glow} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.valueColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                  trend.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border ${style.iconBg} transition-transform group-hover:scale-110 duration-200`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

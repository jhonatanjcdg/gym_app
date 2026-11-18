import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Users,
  ShoppingBag,
  DollarSign,
  Dumbbell,
  Calendar,
  Wrench,
  Sparkles,
  X,
  Lock,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';

export type NavTab =
  | 'dashboard'
  | 'checkin'
  | 'members'
  | 'pos'
  | 'finances'
  | 'routines'
  | 'classes'
  | 'equipment';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDailyPass: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile,
  onOpenDailyPass,
}) => {
  const { currentRole, checkIns, members } = useGym();

  // Expiring members count for notification badge
  const expiringCount = members.filter(m => m.status === 'por_vencer' || m.status === 'vencido').length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'checkin' as NavTab,
      label: 'Terminal Check-in',
      icon: <ScanLine className="w-5 h-5" />,
      badge: `${checkIns.length}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'members' as NavTab,
      label: 'Socios & Membresías',
      icon: <Users className="w-5 h-5" />,
      badge: expiringCount > 0 ? `${expiringCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse',
    },
    {
      id: 'pos' as NavTab,
      label: 'Tienda & Mini-POS',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'finances' as NavTab,
      label: 'Finanzas & Caja',
      icon: <DollarSign className="w-5 h-5" />,
      isRestrictedForStaff: currentRole === 'staff',
      badge: currentRole === 'staff' ? 'Restringido' : null,
      badgeColor: 'bg-slate-800 text-slate-400 text-[10px]',
    },
    {
      id: 'routines' as NavTab,
      label: 'Gestor de Rutinas',
      icon: <Dumbbell className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'classes' as NavTab,
      label: 'Agenda de Clases',
      icon: <Calendar className="w-5 h-5" />,
      badge: null,
    },
    {
      id: 'equipment' as NavTab,
      label: 'Mantenimiento Equipos',
      icon: <Wrench className="w-5 h-5" />,
      badge: null,
    },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar (Desktop fixed, Mobile off-canvas) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-neon-green">
              <Dumbbell className="w-5 h-5 text-dark-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">TITAN</span>
                <span className="font-bold text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  PULSE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Gym Management OS
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Módulos Principales
          </div>

          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isRestrictedForStaff && (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Quick Drop-in Action Card */}
          <div className="pt-4 px-1">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-dark-850 to-dark-800 border border-emerald-500/20 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Pase Diario Express</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug mb-3">
                ¿Cliente de un solo día? Regístralo en 15 segundos sin papeleo.
              </p>
              <button
                onClick={() => {
                  onCloseMobile();
                  onOpenDailyPass();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-bold text-xs transition-all shadow-neon-green text-center active:scale-95"
              >
                + Registrar Drop-in
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & Role Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-dark-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {currentRole === 'admin' ? 'AD' : 'ST'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentRole === 'admin' ? 'Sede Central (Admin)' : 'Recepción Turno 1'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                Rol: {currentRole === 'admin' ? 'Super Administrador' : 'Recepcionista'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Thumb friendly) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-dark-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard' as NavTab, label: 'Inicio', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'checkin' as NavTab, label: 'Acceso', icon: <ScanLine className="w-5 h-5" /> },
          { id: 'members' as NavTab, label: 'Socios', icon: <Users className="w-5 h-5" /> },
          { id: 'pos' as NavTab, label: 'Tienda', icon: <ShoppingBag className="w-5 h-5" /> },
          { id: 'finances' as NavTab, label: 'Finanzas', icon: <DollarSign className="w-5 h-5" /> },
        ].map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

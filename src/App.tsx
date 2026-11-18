import React, { useState, useEffect } from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { CheckInTerminal } from './components/checkin/CheckInTerminal';
import { MembersView } from './components/members/MembersView';
import { PosView } from './components/pos/PosView';
import { FinancesView } from './components/finances/FinancesView';
import { RoutinesView } from './components/routines/RoutinesView';
import { ClassesView } from './components/classes/ClassesView';
import { EquipmentView } from './components/equipment/EquipmentView';
import { DailyPassModal } from './components/daily-pass/DailyPassModal';
import { CloudSyncModal } from './components/sync/CloudSyncModal';

const GymApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDailyPassOpen, setIsDailyPassOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);

  // Global keyboard shortcuts (F2 opens check-in terminal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('checkin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Sidebar (Desktop fixed + Mobile drawer + Mobile bottom nav) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenDailyPass={() => setIsDailyPassOpen(true)}
      />

      {/* Main Content Area (Offset by sidebar width on lg screens) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Sticky Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenQuickCheckIn={() => setActiveTab('checkin')}
          onOpenDailyPass={() => setIsDailyPassOpen(true)}
          onOpenCloudSync={() => setIsCloudSyncOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateToCheckin={() => setActiveTab('checkin')}
              onNavigateToMembers={() => setActiveTab('members')}
              onNavigateToPos={() => setActiveTab('pos')}
              onOpenDailyPass={() => setIsDailyPassOpen(true)}
            />
          )}

          {activeTab === 'checkin' && <CheckInTerminal />}

          {activeTab === 'members' && <MembersView />}

          {activeTab === 'pos' && <PosView />}

          {activeTab === 'finances' && <FinancesView />}

          {activeTab === 'routines' && <RoutinesView />}

          {activeTab === 'classes' && <ClassesView />}

          {activeTab === 'equipment' && <EquipmentView />}
        </main>
      </div>

      {/* Global Quick Daily Pass Modal */}
      <DailyPassModal
        isOpen={isDailyPassOpen}
        onClose={() => setIsDailyPassOpen(false)}
      />

      {/* Cloud & Local Backup Center Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <GymProvider>
      <GymApp />
    </GymProvider>
  );
}

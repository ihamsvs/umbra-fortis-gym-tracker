'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { AppTab } from '@/types/gym';
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  hydrate,
  addFriend,
  selectFriend,
  deleteFriend,
  addExercise,
  deleteExercise,
  addLog,
  deleteLog,
  deleteAllLogs,
  resetAll,
  importState,
  GymState,
} from '@/lib/gymStore';
import { Navbar } from '@/components/Navbar';
import { FriendModal } from '@/components/FriendModal';
import { QuickLogModal } from '@/components/QuickLogModal';
import { WorkoutLogger } from '@/components/WorkoutLogger';
import { Dashboard } from '@/components/Dashboard';
import { ProgressCharts } from '@/components/ProgressCharts';
import { ExerciseList } from '@/components/ExerciseList';
import { HistoryLog } from '@/components/HistoryLog';
import { PlateCalculator } from '@/components/PlateCalculator';
import { SettingsTab } from '@/components/SettingsTab';
import { hydrateTheme } from '@/lib/themeStore';
import { syncWithSupabase } from '@/lib/supabaseSync';
import { getStoredAuthUser, saveAuthUser, clearAuthUser } from '@/lib/authStore';
import { LoginScreen } from '@/components/LoginScreen';
import { BatIcon } from '@/components/BatIcon';
import { Friend } from '@/types/gym';

type Tab = AppTab;

export default function Home() {
  const { friends, exercises, logs, activeFriendId } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [activeTab, setActiveTab] = useState<Tab>('logger');
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [authUser, setAuthUser] = useState<Friend | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [barWeight, setBarWeight] = useState(20);
  const [plateSizes, setPlateSizes] = useState<number[]>([25, 20, 15, 10, 5, 2.5, 1.25]);

  // Load persisted data once after mount and trigger cloud sync
  useEffect(() => {
    hydrate();
    hydrateTheme();
    syncWithSupabase();

    const stored = getStoredAuthUser();
    if (stored) {
      setAuthUser(stored);
      selectFriend(stored.id);
    }
    setAuthChecked(true);
  }, []);

  // Listen for import events from SettingsTab
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<GymState> | undefined;
      if (detail?.friends && detail?.exercises && detail?.logs) {
        importState({
          friends: detail.friends,
          exercises: detail.exercises,
          logs: detail.logs,
          activeFriendId: detail.activeFriendId || detail.friends[0]?.id || '',
        });
      }
    };
    window.addEventListener('gym-tracker:import', handler);
    return () => window.removeEventListener('gym-tracker:import', handler);
  }, []);

  const handleLoginSuccess = (user: Friend) => {
    setAuthUser(user);
    saveAuthUser(user);
    selectFriend(user.id);
  };

  const handleLogout = () => {
    clearAuthUser();
    setAuthUser(null);
    selectFriend('');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 rounded-2xl bg-accent text-zinc-950 flex items-center justify-center animate-pulse">
          <BatIcon className="w-10 h-10" />
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <LoginScreen
        friends={friends}
        onLoginSuccess={handleLoginSuccess}
        onRefreshFromSupabase={syncWithSupabase}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-zinc-100 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        friends={friends}
        activeFriendId={activeFriendId}
        currentUser={authUser}
        onSelectFriend={selectFriend}
        onOpenQuickLog={() => setQuickLogOpen(true)}
        onOpenAddFriend={() => setAddFriendOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {activeTab === 'logger' && (
          <WorkoutLogger
            friends={friends}
            exercises={exercises}
            logs={logs}
            activeFriendId={activeFriendId}
            currentUser={authUser}
            onSelectFriend={selectFriend}
            onSaveLog={addLog}
            onAddExercise={addExercise}
            onDeleteLog={deleteLog}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            friends={friends}
            exercises={exercises}
            logs={logs}
            activeFriendId={activeFriendId}
            currentUser={authUser}
            onOpenQuickLog={() => setQuickLogOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'charts' && (
          <ProgressCharts
            friends={friends}
            exercises={exercises}
            logs={logs}
            activeFriendId={activeFriendId}
            currentUser={authUser}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseList exercises={exercises} onAddExercise={addExercise} />
        )}

        {activeTab === 'history' && (
          <HistoryLog
            friends={friends}
            exercises={exercises}
            logs={logs}
            onDeleteLog={deleteLog}
          />
        )}

        {activeTab === 'calculator' && (
          <PlateCalculator
            barWeight={barWeight}
            setBarWeight={setBarWeight}
            plateSizes={plateSizes}
            setPlateSizes={setPlateSizes}
            onLogWeight={() => {
              setQuickLogOpen(true);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            friends={friends}
            exercises={exercises}
            logs={logs}
            onDeleteFriend={deleteFriend}
            onDeleteExercise={deleteExercise}
            onDeleteAllLogs={deleteAllLogs}
            onResetAll={resetAll}
            onLogout={handleLogout}
          />
        )}
      </main>

      <footer className="border-t border-zinc-800/60 py-5 text-center text-[11px] text-zinc-500">
        Umbra Fortis — Fuerza en la sombra, progreso en equipo
      </footer>

      <FriendModal
        isOpen={addFriendOpen}
        onClose={() => setAddFriendOpen(false)}
        onAddFriend={addFriend}
      />

      {quickLogOpen && (
        <QuickLogModal
          onClose={() => setQuickLogOpen(false)}
          friends={friends}
          exercises={exercises}
          logs={logs}
          activeFriendId={activeFriendId}
          onSaveLog={addLog}
        />
      )}
    </div>
  );
}

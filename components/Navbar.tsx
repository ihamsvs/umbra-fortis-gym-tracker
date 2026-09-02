'use client';

import React, { useState } from 'react';
import { Friend, AppTab } from '@/types/gym';
import { Dumbbell, PlusCircle, Users, BarChart3, ListFilter, Calculator, Settings, ChevronDown, History, Flame, LogOut, User } from 'lucide-react';
import { BatIcon } from '@/components/BatIcon';
import { FriendAvatar } from '@/components/FriendAvatar';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  friends: Friend[];
  activeFriendId: string;
  currentUser?: Friend | null;
  onSelectFriend: (id: string) => void;
  onOpenQuickLog: () => void;
  onOpenAddFriend: () => void;
  onLogout?: () => void;
}

const TABS: { id: AppTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'logger', label: 'Registrar Sesión', shortLabel: 'Entrenar', icon: Flame },
  { id: 'profile', label: 'Mi Perfil', shortLabel: 'Perfil', icon: User },
  { id: 'charts', label: 'Progreso & Gráficos', shortLabel: 'Progreso', icon: BarChart3 },
  { id: 'exercises', label: 'Ejercicios', shortLabel: 'Ejercicios', icon: Dumbbell },
  { id: 'history', label: 'Historial', shortLabel: 'Historial', icon: History },
  { id: 'calculator', label: 'Calculadora Discos', shortLabel: 'Discos', icon: Calculator },
  { id: 'settings', label: 'Ajustes', shortLabel: 'Ajustes', icon: Settings },
];

export function Navbar({
  activeTab,
  setActiveTab,
  friends,
  activeFriendId,
  currentUser,
  onSelectFriend,
  onOpenQuickLog,
  onOpenAddFriend,
  onLogout,
}: NavbarProps) {
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const activeFriend =
    (currentUser && currentUser.id === activeFriendId ? currentUser : null) ||
    friends.find((f) => f.id === activeFriendId) ||
    currentUser ||
    friends[0];

  const renderTab = (tab: (typeof TABS)[number], compact: boolean) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        aria-label={tab.label}
        className={
          compact
            ? `relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all min-w-0 ${
                isActive ? 'text-accent' : 'text-zinc-500 hover:text-zinc-300'
              }`
            : `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-zinc-800 text-accent border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`
        }
      >
        <Icon className={`w-4 h-4 ${compact ? '' : isActive ? 'text-accent' : 'text-zinc-400'}`} />
        {compact && (
          <>
            <span className="text-[9px] font-bold leading-none truncate max-w-full">{tab.shortLabel}</span>
            <span
              className={`absolute top-0 h-0.5 w-8 rounded-full transition-all ${
                isActive ? 'bg-accent' : 'bg-transparent'
              }`}
            />
          </>
        )}
        {!compact && <span>{tab.label}</span>}
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md text-zinc-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary text-zinc-950 shadow-lg shadow-accent/25 shrink-0">
                <BatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-base sm:text-lg text-white uppercase truncate">Umbra Fortis</span>
                  <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider">
                    Gym
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-zinc-400">Fuerza en la sombra — tu gym de casa</p>
              </div>
            </div>

            {/* Authenticated User Account Capsule */}
            <div className="relative shrink-0">
              <button
                onClick={() => setFriendMenuOpen(!friendMenuOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all text-sm font-medium cursor-pointer"
              >
                <div className="relative">
                  <FriendAvatar friend={activeFriend} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block -mb-0.5">Atleta Activo</span>
                  <span className="text-xs font-black text-white">{activeFriend?.name || 'Usuario'}</span>
                </div>
                <span className="sm:hidden text-xs font-bold max-w-[64px] truncate text-white">{activeFriend?.name || 'Usuario'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${friendMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Secure Account Popover */}
              {friendMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                    <FriendAvatar friend={activeFriend} size="md" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white truncate">{activeFriend?.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                        ID: {activeFriend?.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setFriendMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-zinc-200 border border-zinc-800 transition-colors"
                    >
                      <span>Ver Mi Perfil</span>
                      <User className="w-3.5 h-3.5 text-accent" />
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setFriendMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                      >
                        <span>Cerrar Sesión</span>
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-tight">
                    🔒 Sesión protegida. Para ingresar con otra cuenta, cierra sesión e introduce la contraseña.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            <button
              onClick={onOpenQuickLog}
              aria-label="Anotar Peso"
              className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-zinc-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-accent/20 shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Anotar Peso</span>
            </button>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden md:flex space-x-1 sm:space-x-2 border-t border-zinc-800/60 pt-1 pb-2 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => renderTab(tab, false))}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-7 px-0.5 pt-1">
          {TABS.map((tab) => renderTab(tab, true))}
        </div>
      </nav>
    </>
  );
}

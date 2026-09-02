'use client';

import React, { useMemo } from 'react';
import { Friend, Exercise, WorkoutLog, AppTab } from '@/types/gym';
import { calculateVolume, getMaxWeightInLog, formatDate, getFriendPRs, calculate1RM } from '@/lib/utils';
import {
  Trophy,
  Award,
  Plus,
  Calendar,
  Dumbbell,
  ChevronRight,
  TrendingUp,
  Zap,
  Activity,
  Users,
  ShieldCheck,
  Flame,
  User,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { BatIcon } from '@/components/BatIcon';
import { FriendAvatar } from '@/components/FriendAvatar';

interface ProfileViewProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  currentUser?: Friend | null;
  onOpenQuickLog: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

const KEY_EXERCISE_IDS = ['e1', 'e3', 'e4', 'e5', 'e6'];

export function ProfileView({
  friends,
  exercises,
  logs,
  activeFriendId,
  currentUser,
  onOpenQuickLog,
  onNavigateTab,
}: ProfileViewProps) {
  // Combine all members ensuring current user is present
  const allMembers = useMemo(() => {
    const list = [...friends];
    if (currentUser && !list.some((f) => f.id === currentUser.id)) {
      list.unshift(currentUser);
    }
    return list;
  }, [friends, currentUser]);

  // Active athlete
  const activeFriend =
    (currentUser && currentUser.id === activeFriendId ? currentUser : null) ||
    friends.find((f) => f.id === activeFriendId) ||
    currentUser ||
    friends[0];

  const currentFriendId = activeFriend?.id || activeFriendId;

  // Other friends (excluding the active user)
  const otherFriends = useMemo(() => {
    return allMembers.filter((f) => f.id !== currentFriendId);
  }, [allMembers, currentFriendId]);

  // Logs of active athlete
  const activeFriendLogs = useMemo(() => {
    return logs
      .filter((l) => l.friendId === currentFriendId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, currentFriendId]);

  // Personal Stats
  const totalVolumeActive = activeFriendLogs.reduce((acc, log) => acc + calculateVolume(log.sets), 0);
  const friendPRsMap = getFriendPRs(logs, currentFriendId);
  const prCount = Object.keys(friendPRsMap).length;

  // Favorite exercise
  const exerciseCounts: Record<string, number> = {};
  for (const log of activeFriendLogs) {
    exerciseCounts[log.exerciseId] = (exerciseCounts[log.exerciseId] || 0) + 1;
  }
  let favExerciseId = '';
  let maxCount = 0;
  for (const [id, count] of Object.entries(exerciseCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favExerciseId = id;
    }
  }
  const favoriteExercise = exercises.find((e) => e.id === favExerciseId);

  // Recent 5 logs
  const recentLogs = activeFriendLogs.slice(0, 5);

  // Key Personal Records for current user
  const personalRecords = useMemo(() => {
    return KEY_EXERCISE_IDS.map((eid) => {
      const exercise = exercises.find((e) => e.id === eid);
      const pr = friendPRsMap[eid];
      return {
        exercise,
        pr,
      };
    }).filter((item) => item.exercise);
  }, [exercises, friendPRsMap]);

  // Other friends stats
  const friendsStats = useMemo(() => {
    return otherFriends.map((friend) => {
      const friendLogs = logs.filter((l) => l.friendId === friend.id);
      const prsMap = getFriendPRs(logs, friend.id);
      const prs = Object.values(prsMap);
      let best = null as { weight: number; reps: number; exercise?: Exercise } | null;
      for (const p of prs) {
        if (!best || p.maxWeight > best.weight) {
          best = {
            weight: p.maxWeight,
            reps: p.repsAtMax,
            exercise: exercises.find((e) => e.id === p.exerciseId),
          };
        }
      }

      return {
        friend,
        sessionsCount: friendLogs.length,
        totalVolume: friendLogs.reduce((acc, l) => acc + calculateVolume(l.sets), 0),
        prsCount: prs.length,
        bestLift: best,
      };
    });
  }, [otherFriends, logs, exercises]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================= */}
      {/* 1. SECCIÓN SUPERIOR: MI PERFIL (ATLETA AUTENTICADO)       */}
      {/* ========================================================= */}
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-10 opacity-5 pointer-events-none">
          <BatIcon className="w-60 h-60 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <FriendAvatar friend={activeFriend} size="xl" className="ring-4 ring-accent/30 shadow-2xl shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[10px] font-black uppercase tracking-wider">
                  Mi Perfil de Atleta
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                  ID: {activeFriend?.id || 'usuario'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white mt-1.5 uppercase tracking-tight">
                {activeFriend?.name || 'Atleta'}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Fuerza en la sombra • Miembro desde {activeFriend?.joinedDate ? formatDate(activeFriend.joinedDate) : '2026'}
              </p>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigateTab('logger')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-accent via-amber-400 to-accent-secondary text-zinc-950 font-black text-sm shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Flame className="w-5 h-5 stroke-[2.5]" />
              <span>Registrar Entrenamiento</span>
            </button>
            <button
              onClick={() => onNavigateTab('charts')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-sm transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Mis Gráficos</span>
            </button>
          </div>
        </div>

        {/* Personal Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Dumbbell className="w-4 h-4 text-accent" />
              Volumen Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalVolumeActive.toLocaleString('es-ES')} <span className="text-xs font-bold text-zinc-400">kg</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Kilos totales movidos</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              Récords (PRs)
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {prCount} <span className="text-xs font-bold text-zinc-400">ejercicios</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Tus mejores marcas</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-sky-400" />
              Entrenamientos
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {activeFriendLogs.length} <span className="text-xs font-bold text-zinc-400">sesiones</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Registros guardados</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Más Frecuente
            </div>
            <div className="text-sm font-black text-white truncate">
              {favoriteExercise?.name || 'Sin registros'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {favExerciseId ? `${exerciseCounts[favExerciseId]} veces entrenado` : 'Comienza a registrar'}
            </p>
          </div>
        </div>
      </div>

      {/* Mis Mejores Marcas (Key PRs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Tus Mejores Marcas Personales
            </h2>
            <p className="text-xs text-zinc-400">Tus levantamientos récord en ejercicios principales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {personalRecords.map(({ exercise, pr }) => {
            const est1RM = pr ? calculate1RM(pr.maxWeight, pr.repsAtMax) : 0;

            return (
              <div
                key={exercise!.id}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase">
                    {exercise!.category}
                  </span>
                  {pr && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      RÉCORD
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-white truncate">{exercise!.name}</h3>

                {pr ? (
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-black text-accent">{pr.maxWeight} kg</span>
                      <span className="text-xs text-zinc-400 ml-1.5">× {pr.repsAtMax} reps</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{formatDate(pr.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block">1RM Estimado</span>
                      <span className="text-sm font-black text-sky-400">{est1RM} kg</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-zinc-600 italic">Sin registros todavía</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial Reciente de Este Usuario */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Tus Entrenamientos Recientes
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            <span>Ver Todo el Historial</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl text-xs text-zinc-500">
            Aún no has registrado entrenamientos. ¡Comienza hoy con tu primera sesión!
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {recentLogs.map((log) => {
              const ex = exercises.find((e) => e.id === log.exerciseId);
              const vol = calculateVolume(log.sets);
              const { maxWeight } = getMaxWeightInLog(log.sets);

              return (
                <div key={log.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{ex?.name || 'Ejercicio'}</span>
                      {log.isPR && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
                          PR
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatDate(log.date)} • {log.sets.length} series •{' '}
                      <strong className="text-zinc-200">Máx: {maxWeight} kg</strong> ({vol} kg vol.)
                    </p>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 shrink-0">
                    {log.sets.map((s) => `${s.weight}×${s.reps}`).slice(0, 3).join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. SECCIÓN INFERIOR: MIS AMIGOS / INTEGRANTES DEL GYM     */}
      {/* ========================================================= */}
      
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Compañeros de Entrenamiento ({otherFriends.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Progreso y rendimiento de los demás atletas de Umbra Fortis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {friendsStats.length === 0 ? (
            <div className="col-span-full bg-zinc-900/60 border border-dashed border-zinc-800 rounded-3xl p-6 text-center text-xs text-zinc-500">
              No hay otros miembros registrados en el equipo.
            </div>
          ) : (
            friendsStats.map((item) => (
              <div
                key={item.friend.id}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 shadow-xl transition-all space-y-4"
              >
                {/* Friend Header */}
                <div className="flex items-center gap-3">
                  <FriendAvatar friend={item.friend} size="md" />
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white truncate">{item.friend.name}</h3>
                    <p className="text-[11px] text-zinc-500">
                      {item.sessionsCount} sesiones • {item.prsCount} PRs
                    </p>
                  </div>
                </div>

                {/* Friend Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2">
                    <span className="text-[11px] font-bold text-zinc-400">Volumen Total</span>
                    <span className="text-xs font-black text-white">
                      {item.totalVolume.toLocaleString('es-ES')} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2">
                    <span className="text-[11px] font-bold text-zinc-400">Mejor Marca</span>
                    {item.bestLift ? (
                      <span className="text-xs font-black text-accent text-right">
                        {item.bestLift.weight} kg
                        <span className="block text-[9px] font-medium text-zinc-500 truncate max-w-[110px]">
                          {item.bestLift.exercise?.name || ''}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">Sin datos</span>
                    )}
                  </div>
                </div>

                {/* Action Link */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('charts')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-all cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  <span>Comparar en Gráficos</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

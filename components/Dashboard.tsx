'use client';

import React from 'react';
import { Friend, Exercise, WorkoutLog, AppTab } from '@/types/gym';
import { calculateVolume, getMaxWeightInLog, formatDate, getFriendPRs } from '@/lib/utils';
import { Trophy, Award, Plus, Calendar, Dumbbell, ChevronRight, TrendingUp, Zap, Activity, Users, ShieldCheck } from 'lucide-react';
import { BatIcon } from '@/components/BatIcon';
import { FriendAvatar } from '@/components/FriendAvatar';

interface DashboardProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  currentUser?: Friend | null;
  onOpenQuickLog: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

const RECORD_EXERCISE_IDS = ['e1', 'e3', 'e4', 'e5'];

export function Dashboard({
  friends,
  exercises,
  logs,
  activeFriendId,
  currentUser,
  onOpenQuickLog,
  onNavigateTab,
}: DashboardProps) {
  const allMembers = React.useMemo(() => {
    const list = [...friends];
    if (currentUser && !list.some((f) => f.id === currentUser.id)) {
      list.unshift(currentUser);
    }
    return list;
  }, [friends, currentUser]);

  const activeFriend =
    (currentUser && currentUser.id === activeFriendId ? currentUser : null) ||
    friends.find((f) => f.id === activeFriendId) ||
    currentUser ||
    friends[0];

  const currentFriendId = activeFriend?.id || activeFriendId;

  // Logs of active friend
  const activeFriendLogs = logs
    .filter((l) => l.friendId === currentFriendId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ---- Per member stats (general overview) ----
  const memberStats = allMembers.map((friend) => {
    const friendLogs = logs.filter((l) => l.friendId === friend.id);
    const prsMap = getFriendPRs(logs, friend.id);
    const prs = Object.values(prsMap);
    let best = null as { weight: number; exercise?: Exercise } | null;
    for (const p of prs) {
      if (!best || p.maxWeight > best.weight) {
        best = { weight: p.maxWeight, exercise: exercises.find((e) => e.id === p.exerciseId) };
      }
    }
    return {
      friend,
      sessions: friendLogs.length,
      volume: friendLogs.reduce((acc, l) => acc + calculateVolume(l.sets), 0),
      prs: prs.length,
      best,
    };
  });

  // ---- Group overview stats ----
  const totalSessions = logs.length;
  const totalVolume = logs.reduce((acc, l) => acc + calculateVolume(l.sets), 0);
  const totalPRs = memberStats.reduce((acc, m) => acc + m.prs, 0);

  // ---- Gym records (best lift per key exercise across all members) ----
  const gymRecords = RECORD_EXERCISE_IDS.map((eid) => {
    const exercise = exercises.find((e) => e.id === eid);
    let holder: Friend | null = null;
    let weight = 0;
    let date: string | null = null;
    for (const f of allMembers) {
      const pr = getFriendPRs(logs, f.id)[eid];
      if (pr && pr.maxWeight > weight) {
        weight = pr.maxWeight;
        holder = f;
        date = pr.date;
      }
    }
    return { exercise, holder, weight, date };
  }).filter((r) => r.exercise);

  // Calculations for active friend
  const totalVolumeActive = activeFriendLogs.reduce((acc, log) => acc + calculateVolume(log.sets), 0);
  const friendPRsMap = getFriendPRs(logs, currentFriendId);
  const prCount = Object.keys(friendPRsMap).length;

  // Favorite exercise (most logged exercise)
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

  // Group Leaderboard (Top Bench Press across all friends)
  const topBenchPRs = allMembers.map((friend) => {
    const friendPrs = getFriendPRs(logs, friend.id);
    const benchPR = friendPrs['e1'];
    return {
      friend,
      weight: benchPR ? benchPR.maxWeight : 0,
      date: benchPR ? benchPR.date : null,
    };
  }).sort((a, b) => b.weight - a.weight);

  const rankStyles = ['bg-accent text-zinc-950', 'bg-zinc-300 text-zinc-900', 'bg-amber-700 text-white'];
  const rankLabel = (index: number) => ['1', '2', '3'][index] || `#${index + 1}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* 1. GROUP OVERVIEW BANNER (all members) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20"></div>
        <div className="absolute top-0 right-10 h-full w-40 opacity-10 pointer-events-none flex items-center justify-center">
          <BatIcon className="w-32 h-32 text-accent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-zinc-950 shadow-xl shadow-accent/25">
              <BatIcon className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[11px] font-bold uppercase tracking-wider">
                  Cuartel General
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase tracking-tight">
                Umbra Fortis
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                El rendimiento de todo el equipo, en un solo lugar
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenQuickLog}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-accent to-accent-secondary text-zinc-950 font-extrabold text-sm shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Anotar Levantamiento</span>
            </button>
            <button
              onClick={() => onNavigateTab('charts')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-sm transition-all"
            >
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Ver Gráficos</span>
            </button>
          </div>
        </div>

        {/* Group Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-accent" />
              Integrantes
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {allMembers.length} <span className="text-xs font-bold text-zinc-400">miembros</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">La liga de Umbra Fortis</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-sky-400" />
              Sesiones Totales
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalSessions} <span className="text-xs font-bold text-zinc-400">entrenos</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Suma de todo el gym</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Dumbbell className="w-4 h-4 text-accent" />
              Volumen Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalVolume.toLocaleString('es-ES')} <span className="text-xs font-bold text-zinc-400">kg</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Acumulado entre todos</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              Récords del Gym
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {totalPRs} <span className="text-xs font-bold text-zinc-400">PRs</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Marcas activas en el equipo</p>
          </div>
        </div>
      </div>

      {/* 2. GYM RECORDS (best lift per key exercise) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Récords del Gimnasio
            </h2>
            <p className="text-xs text-zinc-400">La mejor marca de cada movimiento, sin importar quién la logró</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gymRecords.map((record) => (
            <div
              key={record.exercise!.id}
              className={`bg-zinc-900/90 border rounded-3xl p-5 shadow-xl transition-all ${
                record.holder?.id === activeFriendId ? 'border-accent/40 bg-accent/5' : 'border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                  {record.exercise!.category}
                </span>
                {record.holder?.id === activeFriendId && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                    TU RÉCORD
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-white">{record.exercise!.name}</h3>

              {record.holder ? (
                <div className="mt-4 flex items-center gap-3">
                  <FriendAvatar friend={record.holder} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{record.holder.name}</p>
                    <p className="text-[10px] text-zinc-500">{record.date ? formatDate(record.date) : ''}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-lg font-black text-accent">{record.weight}</span>
                    <span className="text-[10px] font-bold text-zinc-400 ml-0.5">kg</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-zinc-600 italic">Sin registros todavía</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. MEMBERS OVERVIEW (all members at a glance) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Integrantes del Gym
            </h2>
            <p className="text-xs text-zinc-400">Estado y progreso de cada miembro del equipo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.length === 0 ? (
            <div className="col-span-full bg-zinc-900/60 border border-dashed border-zinc-800 rounded-3xl p-6 text-center text-xs text-zinc-500">
              No hay usuarios en la base de datos de Supabase. Ingresa los usuarios en la tabla `friends` para ver las estadísticas del equipo.
            </div>
          ) : (
            memberStats.map((m) => (
              <div key={m.friend.id} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <FriendAvatar friend={m.friend} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white truncate">{m.friend.name}</p>
                    <p className="text-[10px] text-zinc-500">{m.sessions} sesiones · {m.prs} PRs</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                    <span className="text-[11px] font-bold text-zinc-400">Volumen</span>
                    <span className="text-sm font-black text-white">{m.volume.toLocaleString('es-ES')} kg</span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                    <span className="text-[11px] font-bold text-zinc-400">Mejor marca</span>
                    {m.best ? (
                      <span className="text-xs font-black text-accent text-right">
                        {m.best.weight} kg
                        <span className="block text-[10px] font-semibold text-zinc-500">
                          {m.best.exercise?.name || ''}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">Sin datos</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. ACTIVE FRIEND HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <FriendAvatar friend={activeFriend} size="xl" className="ring-2 ring-accent/40" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 text-[11px] font-bold uppercase tracking-wider">
                  Mi perfil
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                ¡Hola, {activeFriend?.name || 'Atleta'}!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Resumen de tu rendimiento y marcas en Umbra Fortis
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenQuickLog}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-accent to-accent-secondary text-zinc-950 font-extrabold text-sm shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Anotar Levantamiento</span>
            </button>
            <button
              onClick={() => onNavigateTab('charts')}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-sm transition-all"
            >
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Ver Gráficos</span>
            </button>
          </div>
        </div>

        {/* Personal Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Dumbbell className="w-4 h-4 text-accent" />
              Volumen Total
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalVolumeActive.toLocaleString('es-ES')} <span className="text-xs font-bold text-zinc-400">kg</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Acumulado total levantado</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              Récords (PRs)
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {prCount} <span className="text-xs font-bold text-zinc-400">ejercicios</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Marcas máximas activas</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-sky-400" />
              Sesiones
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {activeFriendLogs.length} <span className="text-xs font-bold text-zinc-400">registros</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Entrenamientos anotados</p>
          </div>

          <div className="bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-violet-400" />
              Favorito
            </div>
            <div className="text-sm font-bold text-white truncate">
              {favoriteExercise ? favoriteExercise.name : 'N/A'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {maxCount > 0 ? `${maxCount} veces registrado` : 'Aún sin datos'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Friendly Competition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Últimos Levantamientos de {activeFriend?.name}
              </h2>
              <p className="text-xs text-zinc-400">Historial reciente de {activeFriend?.name}</p>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-bold text-accent hover:text-accent-soft flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              Ver todo el historial <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 space-y-3">
              <Dumbbell className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm font-semibold">Aún no has anotado ningún levantamiento.</p>
              <button
                onClick={onOpenQuickLog}
                className="px-4 py-2 rounded-xl bg-accent text-zinc-950 font-bold text-xs inline-block"
              >
                Anotar mi primer peso
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const exercise = exercises.find((e) => e.id === log.exerciseId);
                const { maxWeight } = getMaxWeightInLog(log.sets);

                return (
                  <div
                    key={log.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 hover:border-zinc-700 transition-all shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                            {exercise?.category || 'Ejercicio'}
                          </span>
                          {log.isPR && (
                            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
                              <Award className="w-3 h-3" /> RÉCORD PERSONAL
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-white mt-1.5 group-hover:text-accent transition-colors">
                          {exercise?.name || 'Ejercicio desconocido'}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {exercise?.equipment} • {formatDate(log.date)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-zinc-400 block uppercase">Carga Max</span>
                        <span className="text-xl font-black text-white">{maxWeight} <span className="text-xs font-bold text-accent">kg</span></span>
                      </div>
                    </div>

                    {/* Sets Chips */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2">
                      {log.sets.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-300"
                        >
                          <span className="text-zinc-500 font-bold mr-1">#{idx + 1}</span>
                          <strong className="text-white">{s.weight} kg</strong> × {s.reps} reps
                        </div>
                      ))}
                    </div>

                    {log.notes && (
                      <p className="mt-2 text-xs italic text-zinc-400 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/40">
                        “{log.notes}”
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Group Leaderboard & Quick Tools */}
        <div className="space-y-6">
          
          {/* Bench Press Leaderboard */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Ránking Press de Banca
                </h3>
                <p className="text-[11px] text-zinc-400">Mayor peso registrado en el gym</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {topBenchPRs.length === 0 ? (
                <p className="text-xs text-zinc-600 italic py-2 text-center">Sin usuarios registrados</p>
              ) : (
                topBenchPRs.map((item, index) => (
                  <div
                    key={item.friend.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      item.friend.id === activeFriendId
                        ? 'bg-accent/10 border-accent/30'
                        : 'bg-zinc-950 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${rankStyles[index] || 'bg-zinc-800 text-zinc-400'}`}>
                        {rankLabel(index)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <FriendAvatar friend={item.friend} size="sm" />
                        <div>
                          <span className="text-xs font-bold text-white block">{item.friend.name}</span>
                          {item.date && (
                            <span className="text-[10px] text-zinc-500">{formatDate(item.date)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {item.weight > 0 ? (
                        <span className="text-sm font-black text-accent">{item.weight} kg</span>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Sin registro</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Tools Banner */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
              Herramienta de Gimnasio
            </h3>
            <p className="text-xs text-zinc-400">
              ¿Vas a armar la barra y no quieres hacer cálculos mentales? Usa nuestra Calculadora de Discos.
            </p>
            <button
              onClick={() => onNavigateTab('calculator')}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-accent border border-zinc-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Abrir Calculadora de Discos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

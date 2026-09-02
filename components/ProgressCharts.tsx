'use client';

import React, { useState, useMemo } from 'react';
import { Friend, Exercise, WorkoutLog, MuscleGroup } from '@/types/gym';
import { calculate1RM, getMaxWeightInLog, formatDate } from '@/lib/utils';
import { INITIAL_EXERCISES } from '@/lib/storage';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Users, Trophy, Activity, Dumbbell, Search, Filter } from 'lucide-react';
import { FriendAvatar } from '@/components/FriendAvatar';
import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, getServerSnapshot } from '@/lib/themeStore';

interface ProgressChartsProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  currentUser?: Friend | null;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

export function ProgressCharts({
  friends,
  exercises,
  logs,
  activeFriendId,
  currentUser,
}: ProgressChartsProps) {
  const activeTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const accentColor = activeTheme.primary;

  const activeFriend =
    (currentUser && currentUser.id === activeFriendId ? currentUser : null) ||
    friends.find((f) => f.id === activeFriendId) ||
    currentUser ||
    friends[0];

  const currentFriendId = activeFriend?.id || activeFriendId;

  // Complete merged list of all exercises (combining catalog, custom & logs)
  const allExercises = useMemo(() => {
    const map = new Map<string, Exercise>();

    // 1. Initial exercises
    for (const ex of INITIAL_EXERCISES) {
      map.set(ex.id, ex);
    }

    // 2. Exercises from state / Supabase
    for (const ex of exercises) {
      if (ex && ex.id) {
        map.set(ex.id, ex);
      }
    }

    // 3. Fallback for any exercise found in logs
    for (const l of logs) {
      if (l.exerciseId && !map.has(l.exerciseId)) {
        map.set(l.exerciseId, {
          id: l.exerciseId,
          name: l.exerciseId.replace('ex_', '').replace(/_/g, ' '),
          category: 'Pecho',
          equipment: 'Barra',
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, logs]);

  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    return allExercises[0]?.id || 'e1';
  });
  const [viewMode, setViewMode] = useState<'weight' | '1rm' | 'compare'>('weight');

  // Filtered exercises for dropdown/selection
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesCat = selectedCategory === 'Todos' || ex.category === selectedCategory;
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allExercises, selectedCategory, searchQuery]);

  // Ensure selectedExercise is valid
  const effectiveExerciseId = allExercises.some((e) => e.id === selectedExerciseId)
    ? selectedExerciseId
    : allExercises[0]?.id || 'e1';

  const selectedExercise = allExercises.find((e) => e.id === effectiveExerciseId);

  // Process data for active friend single progress line
  const activeFriendLogs = useMemo(() => {
    return logs
      .filter((l) => l.friendId === currentFriendId && l.exerciseId === effectiveExerciseId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [logs, currentFriendId, effectiveExerciseId]);

  const singleChartData = activeFriendLogs.map((log) => {
    const { maxWeight, reps } = getMaxWeightInLog(log.sets);
    const est1RM = calculate1RM(maxWeight, reps);
    return {
      date: formatDate(log.date),
      rawDate: log.date,
      pesoMax: maxWeight,
      est1RM: est1RM,
      repsAtMax: reps,
      isPR: log.isPR,
      notes: log.notes,
    };
  });

  // Calculate stats
  const firstLogWeight = singleChartData[0]?.pesoMax || 0;
  const lastLogWeight = singleChartData[singleChartData.length - 1]?.pesoMax || 0;
  const maxWeightEver = Math.max(...singleChartData.map((d) => d.pesoMax), 0);
  const max1RMEver = Math.max(...singleChartData.map((d) => d.est1RM), 0);
  const totalGain = lastLogWeight - firstLogWeight;

  // Process data for comparing ALL friends on this exercise
  const allMembers = useMemo(() => {
    const list = [...friends];
    if (currentUser && !list.some((f) => f.id === currentUser.id)) {
      list.unshift(currentUser);
    }
    return list;
  }, [friends, currentUser]);

  const exerciseLogs = useMemo(() => {
    return logs.filter((l) => l.exerciseId === effectiveExerciseId);
  }, [logs, effectiveExerciseId]);

  const uniqueDatesMap = new Map<string, Record<string, number>>();

  for (const log of exerciseLogs) {
    const { maxWeight } = getMaxWeightInLog(log.sets);
    const friend = allMembers.find((f) => f.id === log.friendId);
    if (!friend) continue;

    if (!uniqueDatesMap.has(log.date)) {
      uniqueDatesMap.set(log.date, {});
    }
    const dateEntry = uniqueDatesMap.get(log.date)!;
    dateEntry[friend.name] = maxWeight;
  }

  // Convert map to sorted array
  const comparisonChartData = Array.from(uniqueDatesMap.entries())
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([dateStr, friendWeights]) => ({
      date: formatDate(dateStr),
      rawDate: dateStr,
      ...friendWeights,
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Gráficos de Progresión
          </h2>
          <p className="text-xs text-zinc-400">Analiza tus incrementos de carga y compara con tus amigos</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex w-full sm:w-auto items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setViewMode('weight')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              viewMode === 'weight'
                ? 'bg-accent text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            Peso Máximo
          </button>
          <button
            onClick={() => setViewMode('1rm')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              viewMode === '1rm'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            1RM Estimado
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              viewMode === 'compare'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            Comparar Grupo
          </button>
        </div>
      </div>

      {/* Exercise Filter & Selector Box */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-5 rounded-3xl space-y-3.5 shadow-xl">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'Todos'
                ? 'bg-accent text-zinc-950 shadow-md'
                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Todos ({allExercises.length})
          </button>
          {MUSCLE_GROUPS.map((cat) => {
            const count = allExercises.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-zinc-950 shadow-md'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Exercise Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ejercicio por nombre o equipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white placeholder-zinc-500 focus:border-accent outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={effectiveExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-sm font-extrabold text-accent rounded-xl px-3.5 py-2.5 outline-none focus:border-accent cursor-pointer"
            >
              {filteredExercises.map((ex) => {
                const logsCount = logs.filter(
                  (l) => l.exerciseId === ex.id && l.friendId === currentFriendId
                ).length;
                return (
                  <option key={ex.id} value={ex.id} className="text-white">
                    [{ex.category}] {ex.name} {logsCount > 0 ? `(${logsCount} registros)` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Quick Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Levantador</span>
          <div className="flex items-center gap-2 mt-1">
            <FriendAvatar friend={activeFriend} size="sm" />
            <span className="text-base font-extrabold text-white truncate">{activeFriend?.name || 'Atleta'}</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Máximo Levantado</span>
          <span className="text-xl font-black text-accent">{maxWeightEver} kg</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Mejor 1RM Estimado</span>
          <span className="text-xl font-black text-sky-400">{max1RMEver} kg</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block">Progreso Acumulado</span>
          <span className={`text-xl font-black ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? `+${totalGain}` : totalGain} kg
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-2xl relative">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-300">
            {viewMode === 'compare'
              ? `Comparación de todos los amigos en ${selectedExercise?.name || 'Ejercicio'}`
              : `Progreso de ${activeFriend?.name || 'Atleta'} en ${selectedExercise?.name || 'Ejercicio'}`}
          </h3>
          <span className="text-xs text-zinc-500 font-medium">Unidad: kilogramos (kg)</span>
        </div>

        {/* Chart render based on viewMode */}
        <div className="h-80 sm:h-96 w-full">
          {viewMode === 'weight' || viewMode === '1rm' ? (
            singleChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Trophy className="w-8 h-8 text-zinc-600" />
                <p className="text-sm font-semibold">No hay registros de este ejercicio para {activeFriend?.name || 'este usuario'}.</p>
                <p className="text-xs text-zinc-600">¡Anota tu primer levantamiento para ver la gráfica!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={singleChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 12, fill: '#a1a1aa' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value, name) => [
                      `${value} kg`,
                      name === 'pesoMax' ? 'Peso Máximo' : '1RM Estimado',
                    ]}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  {viewMode === 'weight' && (
                    <Line
                      type="monotone"
                      dataKey="pesoMax"
                      name="Peso Máximo (kg)"
                      stroke={accentColor}
                      strokeWidth={3}
                      dot={{ r: 6, fill: accentColor, stroke: '#18181b', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: accentColor }}
                    />
                  )}
                  {viewMode === '1rm' && (
                    <Line
                      type="monotone"
                      dataKey="est1RM"
                      name="1RM Estimado (kg)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#38bdf8', stroke: '#18181b', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: '#38bdf8' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )
          ) : (
            /* Comparison view between all friends */
            comparisonChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                <p className="text-sm font-semibold">No hay registros suficientes para comparar en este ejercicio.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
                  <YAxis stroke="#71717a" tick={{ fontSize: 12, fill: '#a1a1aa' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  {allMembers.map((friend) => (
                    <Line
                      key={friend.id}
                      type="monotone"
                      dataKey={friend.name}
                      name={friend.name}
                      stroke={friend.color || '#3b82f6'}
                      strokeWidth={3}
                      connectNulls
                      dot={{ r: 5, fill: friend.color, stroke: '#18181b', strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </div>
    </div>
  );
}

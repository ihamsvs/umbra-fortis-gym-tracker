'use client';

import React, { useMemo, useState } from 'react';
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
  Share2,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { BatIcon } from '@/components/BatIcon';
import { FriendAvatar } from '@/components/FriendAvatar';
import { PRShareStoryModal, PRShareData } from '@/components/PRShareStoryModal';
import { getAthleteRankForExercise, matchRankedExercise } from '@/lib/rankedTiers';

interface ProfileViewProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  currentUser?: Friend | null;
  onOpenQuickLog: () => void;
  onNavigateTab: (tab: AppTab) => void;
}

const EXERCISE_CATEGORIES = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'] as const;

export function ProfileView({
  friends,
  exercises,
  logs,
  activeFriendId,
  currentUser,
  onOpenQuickLog,
  onNavigateTab,
}: ProfileViewProps) {
  const [prShareData, setPrShareData] = useState<PRShareData | null>(null);

  // PR Explorer search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [filterScope, setFilterScope] = useState<'prs_only' | 'all'>('prs_only');
  const [sortBy, setSortBy] = useState<'weight_desc' | 'recent' | 'name_asc'>('weight_desc');

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

  // Process all exercises with their personal records
  const allExercisePRs = useMemo(() => {
    return exercises.map((exercise) => {
      const pr = friendPRsMap[exercise.id] || null;
      const est1RM = pr ? calculate1RM(pr.maxWeight, pr.repsAtMax) : 0;
      const rankedType = matchRankedExercise(exercise.name);
      const rankedTier = rankedType && activeFriend
        ? getAthleteRankForExercise(activeFriend.id, rankedType, logs, exercises)
        : null;

      return {
        exercise,
        pr,
        est1RM,
        rankedTier,
        hasPR: Boolean(pr && pr.maxWeight > 0),
      };
    });
  }, [exercises, friendPRsMap, activeFriend, logs]);

  // Total count of exercises with actual PRs recorded
  const totalRecordedPRs = useMemo(() => {
    return allExercisePRs.filter((item) => item.hasPR).length;
  }, [allExercisePRs]);

  // Filtered & sorted exercise PRs for search
  const filteredExercisePRs = useMemo(() => {
    let list = allExercisePRs;

    // Filter by scope (only PRs vs all catalog)
    if (filterScope === 'prs_only') {
      list = list.filter((item) => item.hasPR);
    }

    // Filter by muscle category
    if (selectedCategory !== 'Todos') {
      list = list.filter((item) => item.exercise.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.exercise.name.toLowerCase().includes(q) ||
          item.exercise.equipment.toLowerCase().includes(q) ||
          item.exercise.category.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'weight_desc') {
        const weightA = a.pr?.maxWeight || 0;
        const weightB = b.pr?.maxWeight || 0;
        if (weightB !== weightA) return weightB - weightA;
        return a.exercise.name.localeCompare(b.exercise.name);
      }
      if (sortBy === 'recent') {
        const dateA = a.pr?.date || '';
        const dateB = b.pr?.date || '';
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return (b.pr?.maxWeight || 0) - (a.pr?.maxWeight || 0);
      }
      // name_asc
      return a.exercise.name.localeCompare(b.exercise.name);
    });
  }, [allExercisePRs, filterScope, selectedCategory, searchQuery, sortBy]);

  // Ranked tier for Bench Press
  const benchRank = useMemo(() => {
    if (!activeFriend) return null;
    return getAthleteRankForExercise(activeFriend.id, 'bench_press', logs, exercises);
  }, [activeFriend, logs, exercises]);
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

      {/* Ranked League Tier Teaser Card */}
      {benchRank && (
        <div
          onClick={() => onNavigateTab && onNavigateTab('ranked')}
          className={`cursor-pointer group relative overflow-hidden rounded-3xl border-2 p-5 shadow-xl transition-all hover:scale-[1.01] ${benchRank.tier.accentBg} ${benchRank.tier.borderColor}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border"
                style={{
                  backgroundColor: `${benchRank.tier.color}20`,
                  borderColor: benchRank.tier.color,
                }}
              >
                <Trophy className="w-6 h-6" style={{ color: benchRank.tier.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Liga Ranked • Press de Banca
                  </span>
                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      color: benchRank.tier.color,
                      backgroundColor: `${benchRank.tier.color}15`,
                      borderColor: `${benchRank.tier.color}40`,
                    }}
                  >
                    Rango: {benchRank.tier.name}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {benchRank.tier.name} • {benchRank.bestPRWeight > 0 ? `${benchRank.bestPRWeight} kg PR` : 'Sin marca'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {benchRank.nextTier
                    ? `Faltan solo ${benchRank.kgToNextTier} kg para ascender a ${benchRank.nextTier.name} (${benchRank.lp} LP)`
                    : '¡Rango Máximo Campeón alcanzado!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-black text-white group-hover:text-accent transition-colors self-end sm:self-center">
              <span>Ver Clasificación Completa</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EXPLORADOR & BUSCADOR DE PRs POR EJERCICIO             */}
      {/* ========================================================= */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        {/* Header with Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Récords Personales por Ejercicio (PRs)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Encuentra y consulta tus mejores marcas y pesos máximos registrados para cada movimiento.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
              <strong className="text-accent">{totalRecordedPRs}</strong> con récord de{' '}
              <span className="text-zinc-500">{exercises.length}</span> ejercicios
            </span>
          </div>
        </div>

        {/* Controls: Search bar + Scope toggle + Sort */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ejercicio o equipamiento (ej. banca, mancuerna, sentadilla)..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-zinc-500 hover:text-zinc-300 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scope selector: Con Récord vs Todos */}
            <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setFilterScope('prs_only')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterScope === 'prs_only'
                    ? 'bg-accent text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Con Récord ({totalRecordedPRs})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterScope('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterScope === 'all'
                    ? 'bg-accent text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Todos ({exercises.length})</span>
              </button>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-2xl shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-zinc-300 outline-none cursor-pointer"
              >
                <option value="weight_desc" className="bg-zinc-900 text-white">Mayor Peso (PR)</option>
                <option value="recent" className="bg-zinc-900 text-white">Más Reciente</option>
                <option value="name_asc" className="bg-zinc-900 text-white">Nombre (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {EXERCISE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-accent/40 shadow-sm'
                      : 'bg-zinc-950/70 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
          <span>
            Mostrando <strong className="text-white font-mono">{filteredExercisePRs.length}</strong>{' '}
            {filteredExercisePRs.length === 1 ? 'ejercicio' : 'ejercicios'}
            {selectedCategory !== 'Todos' && ` en ${selectedCategory}`}
            {searchQuery && ` para "${searchQuery}"`}
          </span>

          {(searchQuery || selectedCategory !== 'Todos' || filterScope !== 'prs_only') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setFilterScope('prs_only');
                setSortBy('weight_desc');
              }}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer filtros</span>
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {filteredExercisePRs.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-3xl bg-zinc-950/50 border border-dashed border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No se encontraron ejercicios</p>
              <p className="text-xs text-zinc-500 mt-1">
                {filterScope === 'prs_only' && totalRecordedPRs === 0
                  ? 'Aún no has registrado récords de peso. ¡Comienza una sesión para guardar tus marcas!'
                  : 'Prueba a cambiar el término de búsqueda o selecciona otra categoría.'}
              </p>
            </div>
            {filterScope === 'prs_only' && (
              <button
                type="button"
                onClick={() => setFilterScope('all')}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
              >
                Ver todos los ejercicios del catálogo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredExercisePRs.map(({ exercise, pr, est1RM, rankedTier }) => {
              return (
                <div
                  key={exercise.id}
                  className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                    pr
                      ? 'bg-zinc-950/90 border-zinc-800/90 hover:border-zinc-700 shadow-xl hover:-translate-y-0.5'
                      : 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500'
                  }`}
                >
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 uppercase border border-zinc-800">
                        {exercise.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/60 px-2 py-0.5 rounded-full border border-zinc-800">
                        {exercise.equipment}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rankedTier && rankedTier.bestPRWeight > 0 && (
                        <span
                          className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1"
                          style={{
                            color: rankedTier.tier.color,
                            backgroundColor: `${rankedTier.tier.color}15`,
                            borderColor: `${rankedTier.tier.color}40`,
                          }}
                        >
                          <Trophy className="w-2.5 h-2.5" />
                          <span>{rankedTier.tier.name}</span>
                        </span>
                      )}

                      {pr && (
                        <button
                          type="button"
                          onClick={() =>
                            setPrShareData({
                              friend: activeFriend,
                              exercise,
                              weight: pr.maxWeight,
                              reps: pr.repsAtMax,
                              date: pr.date,
                            })
                          }
                          className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-accent transition-colors cursor-pointer border border-zinc-800 hover:border-accent/40"
                          title="Compartir en Instagram Stories o WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Exercise Title */}
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-2">
                      {exercise.name}
                    </h3>
                    {exercise.description && (
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {exercise.description}
                      </p>
                    )}
                  </div>

                  {/* PR Weight Display */}
                  {pr ? (
                    <div className="pt-2 border-t border-zinc-900 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl font-black text-accent tracking-tight">
                            {pr.maxWeight} kg
                          </span>
                          <span className="text-xs font-bold text-zinc-400">
                            × {pr.repsAtMax} reps
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span>{formatDate(pr.date)}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase block">
                          1RM Estimado
                        </span>
                        <span className="text-xs sm:text-sm font-black text-sky-400 font-mono">
                          {est1RM} kg
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between">
                      <span className="text-xs text-zinc-600 italic">Sin récord aún</span>
                      <button
                        type="button"
                        onClick={onOpenQuickLog}
                        className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-accent transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Anotar peso</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 shadow-xl hover-lift transition-all space-y-4"
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

      {/* PR Instagram / WhatsApp 9:16 Story Share Modal */}
      {prShareData && (
        <PRShareStoryModal
          isOpen={Boolean(prShareData)}
          onClose={() => setPrShareData(null)}
          prData={prShareData}
        />
      )}

    </div>
  );
}

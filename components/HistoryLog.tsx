'use client';

import React, { useState, useMemo } from 'react';
import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import { calculateVolume, getMaxWeightInLog, formatDate } from '@/lib/utils';
import {
  ListFilter,
  Search,
  Trash2,
  Award,
  Calendar,
  User,
  Dumbbell,
  AlertTriangle,
  Flame,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Share2,
} from 'lucide-react';
import { FriendAvatar } from '@/components/FriendAvatar';
import { PRShareStoryModal, PRShareData } from '@/components/PRShareStoryModal';

interface HistoryLogProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  onDeleteLog: (logId: string) => void;
}

interface GroupedDaySession {
  sessionId: string;
  friendId: string;
  date: string;
  title: string;
  totalVolume: number;
  totalSets: number;
  prsCount: number;
  exerciseItems: {
    logId: string;
    exercise?: Exercise;
    sets: WorkoutLog['sets'];
    notes?: string;
    isPR?: boolean;
    maxWeight: number;
    volume: number;
  }[];
}

const ROUTINE_FILTER_OPTIONS = [
  'Todos',
  'Día de Pecho',
  'Día de Espalda',
  'Día de Piernas',
  'Día de Hombros',
  'Día de Brazos',
  'Día de Pecho & Tríceps',
  'Día de Espalda & Bíceps',
  'Torso / Pierna',
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Full Body',
];

export function HistoryLog({ friends, exercises, logs, onDeleteLog }: HistoryLogProps) {
  const [filterFriendId, setFilterFriendId] = useState<string>('Todos');
  const [filterRoutine, setFilterRoutine] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Story Share Modal
  const [prShareData, setPrShareData] = useState<PRShareData | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'session';
    id: string; // logId or comma-separated logIds
    title: string;
  } | null>(null);

  // Group logs into Day Sessions
  const groupedSessions = useMemo(() => {
    const sessionMap = new Map<string, GroupedDaySession>();

    // Sort logs descending by date
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const log of sorted) {
      const exercise = exercises.find((e) => e.id === log.exerciseId);
      const volume = calculateVolume(log.sets);
      const { maxWeight } = getMaxWeightInLog(log.sets);

      // Determine session title
      const title = log.sessionTitle || (exercise ? `Día de ${exercise.category}` : 'Entrenamiento Diario');

      // Unique session key: date + friendId + title (or sessionId if present)
      const groupKey = log.sessionId || `${log.friendId}_${log.date}_${title.toLowerCase().trim()}`;

      if (!sessionMap.has(groupKey)) {
        sessionMap.set(groupKey, {
          sessionId: groupKey,
          friendId: log.friendId,
          date: log.date,
          title,
          totalVolume: 0,
          totalSets: 0,
          prsCount: 0,
          exerciseItems: [],
        });
      }

      const session = sessionMap.get(groupKey)!;
      session.totalVolume += volume;
      session.totalSets += log.sets.length;
      if (log.isPR) session.prsCount++;

      session.exerciseItems.push({
        logId: log.id,
        exercise,
        sets: log.sets,
        notes: log.notes,
        isPR: log.isPR,
        maxWeight,
        volume,
      });
    }

    return Array.from(sessionMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [logs, exercises]);

  // Filter grouped sessions
  const filteredSessions = useMemo(() => {
    return groupedSessions.filter((session) => {
      // 1. Friend filter
      if (filterFriendId !== 'Todos' && session.friendId !== filterFriendId) {
        return false;
      }

      // 2. Routine Title filter
      if (filterRoutine !== 'Todos') {
        const matchesRoutine = session.title.toLowerCase().includes(filterRoutine.toLowerCase().replace('día de ', ''));
        if (!matchesRoutine) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = session.title.toLowerCase().includes(q);
        const matchesDate = formatDate(session.date).toLowerCase().includes(q) || session.date.includes(q);
        const matchesExercises = session.exerciseItems.some(
          (item) =>
            item.exercise?.name.toLowerCase().includes(q) ||
            item.exercise?.category.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q))
        );
        if (!matchesTitle && !matchesDate && !matchesExercises) return false;
      }

      return true;
    });
  }, [groupedSessions, filterFriendId, filterRoutine, searchQuery]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const ids = deleteTarget.id.split(',');
    for (const id of ids) {
      if (id.trim()) onDeleteLog(id.trim());
    }
    setDeleteTarget(null);
  };

  const totalExercisesCount = filteredSessions.reduce((acc, s) => acc + s.exerciseItems.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-accent stroke-[2.5]" />
            Historial de Días de Entrenamiento
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sesiones completas y rutinas organizadas cronológicamente por día
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300">
            Días: <span className="text-accent font-black">{filteredSessions.length}</span> sesiones
          </div>
          <div className="text-xs font-bold px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300">
            Ejercicios: <span className="text-emerald-400 font-black">{totalExercisesCount}</span>
          </div>
        </div>
      </div>

      {/* Routine Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ROUTINE_FILTER_OPTIONS.map((routine) => (
          <button
            key={routine}
            type="button"
            onClick={() => setFilterRoutine(routine)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterRoutine === routine
                ? 'bg-accent text-zinc-950 shadow-md font-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {routine}
          </button>
        ))}
      </div>

      {/* Search & Friend Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/80 border border-zinc-800 p-4 rounded-3xl shadow-xl">
        {/* Friend Filter */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-2xl">
          <User className="w-4 h-4 text-accent shrink-0" />
          <select
            value={filterFriendId}
            onChange={(e) => setFilterFriendId(e.target.value)}
            className="w-full bg-transparent text-xs font-extrabold text-white outline-none cursor-pointer"
          >
            <option value="Todos" className="bg-zinc-900 text-white">Todos los Atletas</option>
            {friends.map((f) => (
              <option key={f.id} value={f.id} className="bg-zinc-900 text-white">
                {f.name} ({f.avatar})
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por día, ejercicio o notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white placeholder-zinc-500 focus:border-accent outline-none"
          />
        </div>
      </div>

      {/* Sessions Feed */}
      {filteredSessions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 space-y-2">
          <ListFilter className="w-10 h-10 mx-auto text-zinc-600" />
          <p className="text-sm font-semibold">No se encontraron entrenamientos con los filtros actuales.</p>
          <p className="text-xs text-zinc-600">Comienza a registrar tus entrenamientos por día.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSessions.map((session) => {
            const friend = friends.find((f) => f.id === session.friendId);
            const allLogIds = session.exerciseItems.map((e) => e.logId).join(',');

            return (
              <div
                key={session.sessionId}
                className="bg-zinc-900/95 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl shadow-xl overflow-hidden transition-all animate-fade-in-up"
              >
                {/* Day Session Header */}
                <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 sm:p-5 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <FriendAvatar friend={friend} size="md" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-accent text-zinc-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-zinc-950" />
                          {session.title}
                        </span>
                        <span className="text-xs text-zinc-400 font-semibold">
                          {friend?.name || 'Atleta'}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" /> {formatDate(session.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges & Delete Session */}
                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                        Vol: <strong className="text-emerald-400">{session.totalVolume.toLocaleString('es-ES')} kg</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                        Series: <strong className="text-amber-400">{session.totalSets}</strong> ({session.exerciseItems.length} ex)
                      </div>
                      {session.prsCount > 0 && (
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>{session.prsCount} PR</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'session',
                          id: allLogIds,
                          title: `${session.title} (${formatDate(session.date)})`,
                        })
                      }
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                      title="Eliminar este día de entrenamiento completo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises List for this Session */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">
                    Ejercicios Realizados en este Día ({session.exerciseItems.length}):
                  </span>

                  <div className="grid grid-cols-1 gap-3">
                    {session.exerciseItems.map((item, exIdx) => (
                      <div
                        key={item.logId}
                        className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3.5 sm:p-4 hover:border-zinc-700 transition-all space-y-2.5"
                      >
                        {/* Exercise Name & PR badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-black flex items-center justify-center shrink-0">
                              {exIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <span className="text-sm font-extrabold text-white truncate block">
                                {item.exercise?.name || 'Ejercicio'}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {item.exercise?.category} • {item.exercise?.equipment}
                              </span>
                            </div>
                            {item.isPR && (
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
                                  <Award className="w-3 h-3" /> PR
                                </span>
                                {friend && item.exercise && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPrShareData({
                                        friend,
                                        exercise: item.exercise!,
                                        weight: item.maxWeight,
                                        reps: item.sets[0]?.reps || 1,
                                        date: session.date,
                                        notes: item.notes,
                                      })
                                    }
                                    className="p-1 rounded-md bg-amber-500/10 hover:bg-amber-500/25 text-accent border border-amber-500/25 transition-colors cursor-pointer"
                                    title="Compartir Récord en Instagram Stories o WhatsApp"
                                  >
                                    <Share2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-black text-accent">
                                Máx: {item.maxWeight} kg
                              </span>
                              <span className="text-[10px] text-zinc-500 block">
                                {item.volume} kg vol.
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'single',
                                  id: item.logId,
                                  title: item.exercise?.name || 'Ejercicio',
                                })
                              }
                              className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar este ejercicio de la sesión"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Sets Row */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.sets.map((set, sIdx) => (
                            <span
                              key={set.id || sIdx}
                              className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300"
                            >
                              <span className="text-zinc-500 text-[10px] mr-1">#{sIdx + 1}</span>
                              <strong className="text-white">{set.weight}kg</strong> × {set.reps}
                            </span>
                          ))}
                        </div>

                        {/* Exercise Notes */}
                        {item.notes && (
                          <p className="text-xs italic text-zinc-400 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/60">
                            “{item.notes}”
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {deleteTarget.type === 'session' ? '¿Eliminar día completo?' : '¿Eliminar ejercicio?'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Se borrará <strong>{deleteTarget.title}</strong> del historial. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

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

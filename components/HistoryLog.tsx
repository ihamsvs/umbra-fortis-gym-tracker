'use client';

import React, { useState } from 'react';
import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import { calculateVolume, getMaxWeightInLog, formatDate } from '@/lib/utils';
import { ListFilter, Search, Trash2, Award, Calendar, User, Dumbbell, AlertTriangle } from 'lucide-react';
import { FriendAvatar } from '@/components/FriendAvatar';

interface HistoryLogProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  onDeleteLog: (logId: string) => void;
}

export function HistoryLog({ friends, exercises, logs, onDeleteLog }: HistoryLogProps) {
  const [filterFriendId, setFilterFriendId] = useState<string>('Todos');
  const [filterExerciseId, setFilterExerciseId] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = logs
    .filter((log) => {
      const matchesFriend = filterFriendId === 'Todos' || log.friendId === filterFriendId;
      const matchesExercise = filterExerciseId === 'Todos' || log.exerciseId === filterExerciseId;
      
      const exercise = exercises.find((e) => e.id === log.exerciseId);
      const exName = exercise?.name.toLowerCase() || '';
      const notes = log.notes?.toLowerCase() || '';
      const matchesSearch = exName.includes(searchQuery.toLowerCase()) || notes.includes(searchQuery.toLowerCase());

      return matchesFriend && matchesExercise && matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleConfirmDelete = (id: string) => {
    onDeleteLog(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-accent" />
            Historial de Entrenamiento
          </h2>
          <p className="text-xs text-zinc-400">Todos los pesos anotados ordenados por fecha</p>
        </div>

        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
          Total de registros: <span className="text-accent font-extrabold">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
        
        {/* Friend Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-accent" /> Levantador
          </label>
          <select
            value={filterFriendId}
            onChange={(e) => setFilterFriendId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none focus:border-accent"
          >
            <option value="Todos">Todos los Amigos</option>
            {friends.map((f) => (
              <option key={f.id} value={f.id}>
                {f.avatar} {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Exercise Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-accent" /> Ejercicio
          </label>
          <select
            value={filterExerciseId}
            onChange={(e) => setFilterExerciseId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none focus:border-accent"
          >
            <option value="Todos">Todos los Ejercicios</option>
            {exercises.map((e) => (
              <option key={e.id} value={e.id}>
                [{e.category}] {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center gap-1">
            <Search className="w-3 h-3 text-accent" /> Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar en notas o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 rounded-xl px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Logs Feed */}
      {filteredLogs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 space-y-2">
          <ListFilter className="w-10 h-10 mx-auto text-zinc-600" />
          <p className="text-sm font-semibold">No se encontraron registros con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredLogs.map((log) => {
            const friend = friends.find((f) => f.id === log.friendId);
            const exercise = exercises.find((e) => e.id === log.exerciseId);
            const { maxWeight } = getMaxWeightInLog(log.sets);
            const volume = calculateVolume(log.sets);

            return (
              <div
                key={log.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 sm:p-5 transition-all shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <FriendAvatar friend={friend} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{friend?.name || 'Usuario'}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(log.date)}
                        </span>
                        {log.isPR && (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
                            <Award className="w-3 h-3" /> PR
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-accent mt-0.5">
                        {exercise?.name || 'Ejercicio'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block">Max / Volumen</span>
                      <span className="text-sm font-black text-white">
                        {maxWeight} kg <span className="text-xs text-zinc-400 font-normal">({volume} kg tot.)</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setDeletingId(log.id)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Eliminar este registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets Table / Badges */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {log.sets.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-300"
                    >
                      <span className="text-zinc-500 font-bold mr-1.5">Serie {idx + 1}:</span>
                      <strong className="text-white">{s.weight} kg</strong> × {s.reps} reps
                    </div>
                  ))}
                </div>

                {log.notes && (
                  <p className="mt-2.5 text-xs italic text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/60">
                    “{log.notes}”
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 text-center space-y-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">¿Eliminar entrenamiento?</h3>
            <p className="text-xs text-zinc-400">Esta acción no se puede deshacer. Se borrará el registro del historial.</p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmDelete(deletingId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Friend, Exercise, WorkoutLog, WorkoutSet, MuscleGroup } from '@/types/gym';
import { calculate1RM, getMaxWeightInLog, checkIsPR } from '@/lib/utils';
import { X, Plus, Trash2, Award, Calendar, FileText, Dumbbell, Flame } from 'lucide-react';
import { addWorkoutLogAction } from '@/actions/workouts';

interface QuickLogModalProps {
  onClose: () => void;
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  onSaveLog: (log: WorkoutLog) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

const DEFAULT_SETS: WorkoutSet[] = [
  { id: '1', weight: 60, reps: 10 },
  { id: '2', weight: 60, reps: 8 },
  { id: '3', weight: 60, reps: 8 },
];

export function QuickLogModal({
  onClose,
  friends,
  exercises,
  logs,
  activeFriendId,
  onSaveLog,
}: QuickLogModalProps) {
  const initialExerciseId = exercises[0]?.id || '';

  const findLastLog = (friendId: string, exerciseId: string) => {
    return logs
      .filter((l) => l.friendId === friendId && l.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const loadLastSets = (friendId: string, exerciseId: string) => {
    const last = findLastLog(friendId, exerciseId);
    if (last?.sets?.length) {
      return last.sets.map((s, idx) => ({ id: String(idx + 1), weight: s.weight, reps: s.reps }));
    }
    return DEFAULT_SETS;
  };

  const [selectedFriendId, setSelectedFriendId] = useState(activeFriendId);
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedExerciseId, setSelectedExerciseId] = useState(initialExerciseId);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>(() =>
    loadLastSets(activeFriendId, initialExerciseId)
  );

  const [showPRBanner, setShowPRBanner] = useState(false);

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectFriend = (id: string) => {
    setSelectedFriendId(id);
    setSets(loadLastSets(id, selectedExerciseId));
  };

  const handleSelectExercise = (id: string) => {
    setSelectedExerciseId(id);
    setSets(loadLastSets(selectedFriendId, id));
  };

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        id: String(Date.now()),
        weight: lastSet ? lastSet.weight : 50,
        reps: lastSet ? lastSet.reps : 10,
      },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, idx) => idx !== index));
  };

  const handleUpdateSet = (index: number, field: 'weight' | 'reps', value: number) => {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: Math.max(0, value) };
    setSets(updated);
  };

  const { maxWeight, reps } = getMaxWeightInLog(sets);
  const est1RM = calculate1RM(maxWeight, reps);
  const isNewPR = checkIsPR(logs, selectedFriendId, selectedExerciseId, sets);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExerciseId || !selectedFriendId) return;

    const newLog: WorkoutLog = {
      id: 'log_' + Date.now(),
      friendId: selectedFriendId,
      exerciseId: selectedExerciseId,
      date,
      sets: sets.map((s) => ({ id: s.id, weight: Number(s.weight), reps: Number(s.reps) })),
      notes: notes.trim() || undefined,
      isPR: isNewPR,
    };

    onSaveLog(newLog);
    addWorkoutLogAction(newLog).catch(() => {});

    if (isNewPR) {
      setShowPRBanner(true);
      setTimeout(() => {
        setShowPRBanner(false);
        onClose();
      }, 1800);
    } else {
      onClose();
    }
  };

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-7 shadow-2xl relative text-zinc-100 scrollbar-none">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PR Banner Overlay Animation */}
        {showPRBanner && (
          <div className="absolute inset-0 z-50 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 rounded-3xl">
            <div className="p-4 bg-amber-500/20 text-amber-400 rounded-full border-2 border-amber-400 animate-bounce mb-4">
              <Award className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">¡NUEVO RÉCORD PERSONAL!</h3>
            <p className="text-accent font-bold text-lg mt-2">
              {maxWeight} kg en {selectedExercise?.name}
            </p>
            <p className="text-xs text-zinc-400 mt-1">1RM estimado: {est1RM} kg</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <Dumbbell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Anotar Levantamiento</h2>
            <p className="text-xs text-zinc-400">Registra tus series, peso y repeticiones del entrenamiento</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Friend & Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Levantador
              </label>
              <select
                value={selectedFriendId}
                onChange={(e) => handleSelectFriend(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm font-semibold text-white outline-none"
              >
                {friends.length === 0 ? (
                  <option value="">(Sin usuarios registrados)</option>
                ) : (
                  friends.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.avatar} {f.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm font-semibold text-white outline-none"
              />
            </div>
          </div>

          {/* Exercise Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Ejercicio
            </label>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('Todos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'Todos'
                    ? 'bg-accent text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((group) => (
                <button
                  type="button"
                  key={group}
                  onClick={() => setSelectedCategory(group)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === group
                      ? 'bg-accent text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Select Exercise Dropdown & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:col-span-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <select
                value={selectedExerciseId}
                onChange={(e) => handleSelectExercise(e.target.value)}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm font-bold text-accent outline-none"
              >
                {filteredExercises.map((ex) => (
                  <option key={ex.id} value={ex.id} className="text-white">
                    [{ex.category}] {ex.name} ({ex.equipment})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sets Builder */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Series & Carga (kg)
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 font-semibold">
                <span>Max: <strong className="text-accent">{maxWeight} kg</strong></span>
                <span>Est 1RM: <strong className="text-amber-400">{est1RM} kg</strong></span>
                {isNewPR && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30 font-black text-[10px]">
                    <Award className="w-3 h-3" /> PR ALCANZABLE
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {sets.map((set, idx) => (
                <div key={set.id} className="flex items-center gap-2 sm:gap-4 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                  <span className="w-6 text-center font-bold text-xs text-zinc-500">#{idx + 1}</span>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <span className="text-[11px] font-bold text-zinc-400">PESO:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.weight === 0 ? '' : set.weight}
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === '' ? 0 : parseFloat(raw);
                          handleUpdateSet(idx, 'weight', isNaN(val) ? 0 : val);
                        }}
                        className="w-full bg-transparent text-sm font-black text-white text-right outline-none"
                      />
                      <span className="text-xs font-bold text-zinc-400">kg</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
                      <span className="text-[11px] font-bold text-zinc-400">REPS:</span>
                      <input
                        type="number"
                        min="1"
                        value={set.reps === 0 ? '' : set.reps}
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const val = raw === '' ? 0 : parseInt(raw, 10);
                          handleUpdateSet(idx, 'reps', isNaN(val) ? 0 : val);
                        }}
                        className="w-full bg-transparent text-sm font-black text-white text-right outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSet(idx)}
                    disabled={sets.length <= 1}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSet}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-accent/50 text-xs font-bold text-zinc-300 hover:text-accent flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Otra Serie</span>
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Notas u Observaciones (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Buena técnica, descansé 2 mins entre series..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-xs font-medium text-white placeholder-zinc-600 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-accent to-accent-secondary hover:brightness-110 text-zinc-950 font-extrabold text-sm shadow-xl shadow-accent/20 transition-all active:scale-[0.98]"
          >
            <Flame className="w-5 h-5 stroke-[2.5]" />
            <span>Guardar Entrenamiento</span>
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Friend,
  Exercise,
  WorkoutLog,
  WorkoutSet,
  MuscleGroup,
  Equipment,
  ActiveWorkoutSession,
  SessionExerciseItem,
  AppTab,
} from '@/types/gym';
import { calculate1RM, getMaxWeightInLog, checkIsPR, calculateVolume, formatDate } from '@/lib/utils';
import {
  Dumbbell,
  Plus,
  Trash2,
  Award,
  Calendar,
  FileText,
  Flame,
  Search,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  History,
  FolderPlus,
  X,
  Play,
  Check,
  Clock,
  Zap,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { FriendAvatar } from './FriendAvatar';
import { addWorkoutLogAction } from '@/actions/workouts';
import { addExerciseAction } from '@/actions/exercises';

interface WorkoutLoggerProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  currentUser?: Friend | null;
  onSelectFriend: (id: string) => void;
  onSaveLog: (log: WorkoutLog) => void;
  onAddExercise: (exercise: Exercise) => void;
  onDeleteLog: (logId: string) => void;
  onNavigateTab?: (tab: AppTab) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];
const SESSION_STORAGE_KEY = 'gym_tracker_active_session_v2';

export function WorkoutLogger({
  friends,
  exercises,
  logs,
  activeFriendId,
  currentUser,
  onSelectFriend,
  onSaveLog,
  onAddExercise,
  onDeleteLog,
  onNavigateTab,
}: WorkoutLoggerProps) {
  const activeFriend =
    (currentUser && currentUser.id === activeFriendId ? currentUser : null) ||
    friends.find((f) => f.id === activeFriendId) ||
    currentUser ||
    friends[0];

  const currentFriendId = activeFriend?.id || activeFriendId;

  // Selected date for workout (default today)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Active workout session state
  const [activeSession, setActiveSession] = useState<ActiveWorkoutSession | null>(null);

  // Modals
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isCustomExerciseOpen, setIsCustomExerciseOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [completedSetIds, setCompletedSetIds] = useState<Record<string, boolean>>({});

  // Summary Celebration Modal
  const [summaryData, setSummaryData] = useState<{
    isOpen: boolean;
    date: string;
    totalVolume: number;
    totalSets: number;
    exerciseCount: number;
    prsCount: number;
  } | null>(null);

  // Filter & Search inside exercise picker
  const [pickerCategory, setPickerCategory] = useState<MuscleGroup | 'Todos'>('Todos');
  const [pickerSearch, setPickerSearch] = useState('');

  // Form for custom exercise
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<MuscleGroup>('Pecho');
  const [newExEquipment, setNewExEquipment] = useState<Equipment>('Barra');

  // Load in-progress session from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveWorkoutSession;
        if (parsed && parsed.exercises) {
          setActiveSession(parsed);
          setSelectedDate(parsed.date);
        }
      }
    } catch (e) {
      console.error('Error loading active session:', e);
    }
  }, []);

  // Save active session to localStorage whenever it changes
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [activeSession]);

  // Helper to find last log for exercise & friend
  const findLastLog = (friendId: string, exerciseId: string) => {
    return logs
      .filter((l) => l.friendId === friendId && l.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const loadLastSetsForExercise = (exerciseId: string): WorkoutSet[] => {
    const last = findLastLog(currentFriendId, exerciseId);
    if (last?.sets?.length) {
      return last.sets.map((s, idx) => ({ id: `set_${Date.now()}_${idx}`, weight: s.weight, reps: s.reps }));
    }
    return [
      { id: `set_${Date.now()}_1`, weight: 60, reps: 10 },
      { id: `set_${Date.now()}_2`, weight: 60, reps: 8 },
      { id: `set_${Date.now()}_3`, weight: 60, reps: 8 },
    ];
  };

  // Start a new workout session
  const handleStartWorkout = () => {
    const initialExercise = exercises[0];
    const newSession: ActiveWorkoutSession = {
      id: `session_${Date.now()}`,
      date: selectedDate,
      startTime: Date.now(),
      exercises: initialExercise
        ? [
            {
              id: `item_${Date.now()}`,
              exerciseId: initialExercise.id,
              sets: loadLastSetsForExercise(initialExercise.id),
            },
          ]
        : [],
    };
    setActiveSession(newSession);
    setCompletedSetIds({});
  };

  // Cancel in-progress session
  const handleCancelSession = () => {
    setActiveSession(null);
    setConfirmCancelOpen(false);
    setCompletedSetIds({});
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Add exercise item to active session
  const handleAddExerciseToSession = (exerciseId: string) => {
    if (!activeSession) return;
    const newId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: SessionExerciseItem = {
      id: newId,
      exerciseId,
      sets: loadLastSetsForExercise(exerciseId),
    };
    setActiveSession({
      ...activeSession,
      exercises: [...activeSession.exercises, newItem],
    });
    setIsExercisePickerOpen(false);

    // Auto-scroll newly added exercise to center of viewport
    setTimeout(() => {
      const el = document.getElementById(`exercise_card_${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  // Remove exercise from active session
  const handleRemoveExerciseFromSession = (itemId: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      exercises: activeSession.exercises.filter((item) => item.id !== itemId),
    });
  };

  // Add set to an exercise in session
  const handleAddSetToExercise = (itemId: string) => {
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.map((item) => {
      if (item.id === itemId) {
        const lastSet = item.sets[item.sets.length - 1];
        const newSet: WorkoutSet = {
          id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          weight: lastSet ? lastSet.weight : 50,
          reps: lastSet ? lastSet.reps : 10,
        };
        return { ...item, sets: [...item.sets, newSet] };
      }
      return item;
    });
    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  // Remove set from an exercise
  const handleRemoveSetFromExercise = (itemId: string, setIndex: number) => {
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.map((item) => {
      if (item.id === itemId) {
        if (item.sets.length <= 1) return item;
        const newSets = item.sets.filter((_, idx) => idx !== setIndex);
        return { ...item, sets: newSets };
      }
      return item;
    });
    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  // Update set field (weight or reps)
  const handleUpdateSet = (
    itemId: string,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number
  ) => {
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.map((item) => {
      if (item.id === itemId) {
        const newSets = [...item.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: Math.max(0, value) };
        return { ...item, sets: newSets };
      }
      return item;
    });
    setActiveSession({ ...activeSession, exercises: updatedExercises });
  };

  // Adjust weight with stepper
  const handleAdjustWeight = (itemId: string, setIndex: number, delta: number) => {
    const item = activeSession?.exercises.find((i) => i.id === itemId);
    const current = item?.sets[setIndex]?.weight || 0;
    handleUpdateSet(itemId, setIndex, 'weight', Math.max(0, current + delta));
  };

  // Adjust reps with stepper
  const handleAdjustReps = (itemId: string, setIndex: number, delta: number) => {
    const item = activeSession?.exercises.find((i) => i.id === itemId);
    const current = item?.sets[setIndex]?.reps || 0;
    handleUpdateSet(itemId, setIndex, 'reps', Math.max(1, current + delta));
  };

  // Update notes of an exercise in session
  const handleUpdateItemNotes = (itemId: string, notes: string) => {
    if (!activeSession) return;
    const updated = activeSession.exercises.map((item) => {
      if (item.id === itemId) {
        return { ...item, notes };
      }
      return item;
    });
    setActiveSession({ ...activeSession, exercises: updated });
  };

  // Toggle set completion check
  const handleToggleSetCompleted = (setId: string) => {
    setCompletedSetIds((prev) => ({
      ...prev,
      [setId]: !prev[setId],
    }));
  };

  // Save the entire workout session
  const handleFinishAndSaveWorkout = async () => {
    if (!activeSession || activeSession.exercises.length === 0) return;

    let totalVolumeCalculated = 0;
    let totalSetsCount = 0;
    let prsAchieved = 0;

    for (const item of activeSession.exercises) {
      const isPR = checkIsPR(logs, currentFriendId, item.exerciseId, item.sets);
      if (isPR) prsAchieved++;

      totalVolumeCalculated += calculateVolume(item.sets);
      totalSetsCount += item.sets.length;

      const log: WorkoutLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        friendId: currentFriendId,
        exerciseId: item.exerciseId,
        date: activeSession.date,
        sets: item.sets.map((s) => ({ id: s.id, weight: Number(s.weight), reps: Number(s.reps) })),
        notes: item.notes?.trim() || undefined,
        isPR,
      };

      // Save locally
      onSaveLog(log);

      // Save to Supabase in background
      addWorkoutLogAction(log).catch((err) => {
        console.log('Supabase session log save:', err);
      });
    }

    // Show summary modal
    setSummaryData({
      isOpen: true,
      date: activeSession.date,
      totalVolume: totalVolumeCalculated,
      totalSets: totalSetsCount,
      exerciseCount: activeSession.exercises.length,
      prsCount: prsAchieved,
    });

    // Clear active session
    setActiveSession(null);
    setCompletedSetIds({});
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  // Create custom exercise
  const handleCreateCustomExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: Exercise = {
      id: 'ex_' + Date.now(),
      name: newExName.trim(),
      category: newExCategory,
      equipment: newExEquipment,
      isCustom: true,
    };

    onAddExercise(newEx);
    addExerciseAction(newEx).catch(() => {});

    if (activeSession) {
      handleAddExerciseToSession(newEx.id);
    }
    setNewExName('');
    setIsCustomExerciseOpen(false);
  };

  // Filtered exercises for picker modal
  const filteredPickerExercises = exercises.filter((ex) => {
    const matchesCat = pickerCategory === 'Todos' || ex.category === pickerCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      ex.category.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(pickerSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate live total volume in active session
  const liveSessionVolume =
    activeSession?.exercises.reduce((acc, item) => acc + calculateVolume(item.sets), 0) || 0;
  const liveSessionSetsCount =
    activeSession?.exercises.reduce((acc, item) => acc + item.sets.length, 0) || 0;

  // Day's completed logs for selected date
  const completedDayLogs = logs
    .filter((l) => l.date === selectedDate && l.friendId === currentFriendId)
    .sort((a, b) => (b.id > a.id ? 1 : -1));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. ATHLETE BANNER & DATE PICKER */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <FriendAvatar friend={activeFriend} size="lg" className="ring-2 ring-accent/30 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25 uppercase tracking-wider">
                  Atleta Activo
                </span>
                {activeSession && (
                  <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    🔴 En Entrenamiento
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {activeFriend?.name || 'Atleta'}
              </h1>
              <p className="text-xs text-zinc-400">
                {activeSession ? 'Rutina en progreso — registra tus series en vivo' : 'Selecciona el día e inicia tu rutina de ejercicios'}
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-2xl">
            <Calendar className="w-4 h-4 text-accent" />
            <div className="text-left">
              <span className="text-[9px] font-bold text-zinc-500 uppercase block leading-none">Fecha</span>
              <input
                type="date"
                disabled={Boolean(activeSession)}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKOUT VIEW: PRE-WORKOUT OR ACTIVE SESSION */}
      {!activeSession ? (
        /* PRE-WORKOUT VIEW */
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-accent to-accent-secondary text-zinc-950 flex items-center justify-center shadow-xl shadow-accent/25">
            <Dumbbell className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              ¿Listo para entrenar, {activeFriend?.name || 'Atleta'}?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Inicia tu sesión para ir agregando ejercicios, series, kilos y repeticiones. Al terminar, guarda tu registro con un solo clic.
            </p>
          </div>

          <button
            onClick={handleStartWorkout}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent via-amber-400 to-accent-secondary text-zinc-950 font-black text-base sm:text-lg shadow-xl shadow-accent/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-zinc-950 stroke-[2.5]" />
            <span>Iniciar Entrenamiento ({formatDate(selectedDate)})</span>
          </button>
        </div>
      ) : (
        /* ACTIVE WORKOUT SESSION VIEW */
        <div className="space-y-6">
          
          {/* Active Session Header Bar */}
          <div className="bg-zinc-950 border border-accent/30 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-30 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent/15 text-accent rounded-2xl border border-accent/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-accent block -mb-0.5">
                  Sesión en Progreso
                </span>
                <div className="text-sm font-black text-white">
                  {formatDate(activeSession.date)}
                </div>
              </div>
            </div>

            {/* Live Metrics */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                Ejercicios: <span className="text-accent">{activeSession.exercises.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                Series: <span className="text-amber-400">{liveSessionSetsCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                Volumen: <span className="text-emerald-400">{liveSessionVolume.toLocaleString('es-ES')} kg</span>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-accent font-bold text-xs border border-accent/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ejercicio</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(true)}
                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                title="Descartar sesión"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Exercise Items in Session */}
          {activeSession.exercises.length === 0 ? (
            <div className="bg-zinc-900/80 border border-dashed border-zinc-800 rounded-3xl p-8 text-center space-y-4">
              <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-300">No hay ejercicios en esta sesión aún.</p>
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-accent text-zinc-950 font-extrabold text-xs shadow-md shadow-accent/20 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir mi primer ejercicio</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSession.exercises.map((item, exIndex) => {
                const exercise = exercises.find((e) => e.id === item.exerciseId);
                const lastLog = findLastLog(currentFriendId, item.exerciseId);
                const { maxWeight: exMax } = getMaxWeightInLog(item.sets);
                const isPR = checkIsPR(logs, currentFriendId, item.exerciseId, item.sets);

                return (
                  <div
                    key={item.id}
                    id={`exercise_card_${item.id}`}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl relative scroll-mt-24 transition-all"
                  >
                    {/* Exercise Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-accent/15 text-accent font-black text-xs flex items-center justify-center shrink-0 border border-accent/25">
                          {exIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-white truncate">
                              {exercise?.name || 'Ejercicio'}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase">
                              {exercise?.category} • {exercise?.equipment}
                            </span>
                            {isPR && (
                              <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30">
                                <Award className="w-3 h-3" /> PR Potencial
                              </span>
                            )}
                          </div>
                          {lastLog && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              Última vez ({formatDate(lastLog.date)}):{' '}
                              <strong className="text-zinc-200">
                                {lastLog.sets.map((s) => `${s.weight}kg×${s.reps}`).join(' | ')}
                              </strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseFromSession(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-950 rounded-xl transition-colors self-start sm:self-auto"
                        title="Quitar ejercicio de la sesión"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets Table */}
                    <div className="space-y-2.5">
                      {item.sets.map((set, sIdx) => {
                        const isDone = Boolean(completedSetIds[set.id]);

                        return (
                          <div
                            key={set.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border transition-all ${
                              isDone
                                ? 'bg-emerald-950/20 border-emerald-500/30'
                                : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 font-bold text-xs flex items-center justify-center">
                                #{sIdx + 1}
                              </span>
                              <span className="text-xs font-bold text-zinc-400 sm:hidden">Serie #{sIdx + 1}</span>

                              <button
                                type="button"
                                onClick={() => handleToggleSetCompleted(set.id)}
                                className={`sm:hidden p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                                  isDone
                                    ? 'bg-emerald-500 text-zinc-950'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                              {/* Weight Input & Steppers */}
                              <div className="flex items-center justify-between bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Peso:</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={set.weight === 0 ? '' : set.weight}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const val = raw === '' ? 0 : parseFloat(raw);
                                      handleUpdateSet(
                                        item.id,
                                        sIdx,
                                        'weight',
                                        isNaN(val) ? 0 : val
                                      );
                                    }}
                                    className="w-16 bg-transparent text-sm font-black text-white text-right outline-none"
                                  />
                                  <span className="text-xs font-bold text-zinc-400">kg</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustWeight(item.id, sIdx, -2.5)}
                                    className="px-1.5 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400"
                                  >
                                    -2.5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustWeight(item.id, sIdx, +2.5)}
                                    className="px-1.5 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-[10px] font-bold text-accent"
                                  >
                                    +2.5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustWeight(item.id, sIdx, +5)}
                                    className="px-1.5 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-[10px] font-bold text-amber-400"
                                  >
                                    +5
                                  </button>
                                </div>
                              </div>

                              {/* Reps Input & Steppers */}
                              <div className="flex items-center justify-between bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Reps:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={set.reps === 0 ? '' : set.reps}
                                    placeholder="0"
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const val = raw === '' ? 0 : parseInt(raw, 10);
                                      handleUpdateSet(
                                        item.id,
                                        sIdx,
                                        'reps',
                                        isNaN(val) ? 0 : val
                                      );
                                    }}
                                    className="w-14 bg-transparent text-sm font-black text-white text-right outline-none"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustReps(item.id, sIdx, -1)}
                                    className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-zinc-400"
                                  >
                                    -1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustReps(item.id, sIdx, +1)}
                                    className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-accent"
                                  >
                                    +1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustReps(item.id, sIdx, +2)}
                                    className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-zinc-300"
                                  >
                                    +2
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {/* Complete set button (Desktop) */}
                              <button
                                type="button"
                                onClick={() => handleToggleSetCompleted(set.id)}
                                className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                                    : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                                }`}
                                title={isDone ? 'Serie completada' : 'Marcar serie como completada'}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSetFromExercise(item.id, sIdx)}
                                disabled={item.sets.length <= 1}
                                className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg disabled:opacity-20 transition-colors"
                                title="Eliminar serie"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Set Button */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddSetToExercise(item.id)}
                        className="flex-1 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-dashed border-zinc-700 hover:border-accent text-xs font-bold text-zinc-300 hover:text-accent flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Serie</span>
                      </button>

                      <input
                        type="text"
                        placeholder="Notas del ejercicio (opcional)..."
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateItemNotes(item.id, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Add Another Exercise Button */}
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(true)}
                className="w-full py-4 rounded-3xl bg-zinc-900 hover:bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-accent text-sm font-extrabold text-white hover:text-accent flex items-center justify-center gap-2 transition-all shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Añadir Otro Ejercicio a la Sesión</span>
              </button>

              {/* SAVE / FINISH WORKOUT BUTTON */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3">
                <button
                  type="button"
                  onClick={handleFinishAndSaveWorkout}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-accent via-amber-400 to-accent-secondary text-zinc-950 font-black text-base sm:text-lg shadow-xl shadow-accent/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  <span>Guardar Registro de Entrenamiento ({activeSession.exercises.length} ejercicios)</span>
                </button>
                <p className="text-center text-[11px] text-zinc-500">
                  Se guardarán todos los ejercicios, series y repeticiones de la sesión en tu cuenta de Supabase.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. RESUMEN DE ENTRENAMIENTOS DE ESTE DÍA */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Entrenamientos del Día ({formatDate(selectedDate)})
            </h3>
          </div>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
            {completedDayLogs.length} {completedDayLogs.length === 1 ? 'ejercicio' : 'ejercicios'}
          </span>
        </div>

        {completedDayLogs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl text-xs text-zinc-500">
            No hay registros guardados para esta fecha. Inicia una sesión para guardar tus series.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {completedDayLogs.map((log) => {
              const ex = exercises.find((e) => e.id === log.exerciseId);
              const vol = calculateVolume(log.sets);
              const { maxWeight: logMax } = getMaxWeightInLog(log.sets);

              return (
                <div
                  key={log.id}
                  className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-white truncate">{ex?.name}</span>
                      {log.isPR && (
                        <span className="flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-400/30">
                          <Award className="w-3 h-3" /> PR
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span>{log.sets.length} series</span>
                      <span>•</span>
                      <span className="text-accent font-bold">Máx: {logMax} kg</span>
                      <span>•</span>
                      <span>Vol: {vol} kg</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {log.sets.map((s, i) => (
                        <span
                          key={s.id || i}
                          className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                        >
                          {s.weight}kg × {s.reps}
                        </span>
                      ))}
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-900 mt-1">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors shrink-0"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL: EXERCISE PICKER */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl relative text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div>
                <h3 className="text-base font-black text-white">Seleccionar Ejercicio</h3>
                <p className="text-xs text-zinc-400">Elige un ejercicio para agregar a tu rutina</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomExerciseOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-accent font-bold text-xs border border-accent/20 flex items-center gap-1"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Nuevo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExercisePickerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Muscle Group Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setPickerCategory('Todos')}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  pickerCategory === 'Todos'
                    ? 'bg-accent text-zinc-950'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setPickerCategory(g)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    pickerCategory === g
                      ? 'bg-accent text-zinc-950'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative my-2">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ejercicio por nombre o equipamiento..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-medium text-white placeholder-zinc-500 focus:border-accent outline-none"
              />
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2">
              {filteredPickerExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleAddExerciseToSession(ex.id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-accent/40 text-left transition-all group"
                >
                  <div>
                    <span className="text-sm font-extrabold text-white group-hover:text-accent transition-colors block">
                      {ex.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {ex.category} • {ex.equipment}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE CUSTOM EXERCISE */}
      {isCustomExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsCustomExerciseOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-accent/15 text-accent rounded-xl">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Nuevo Ejercicio</h3>
                <p className="text-xs text-zinc-400">Añade un ejercicio a la biblioteca de Umbra Fortis</p>
              </div>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Nombre del Ejercicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Press Francés con Mancuerna"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Grupo Muscular</label>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value as MuscleGroup)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-white outline-none"
                  >
                    {MUSCLE_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Equipamiento</label>
                  <select
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value as Equipment)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-white outline-none"
                  >
                    <option value="Barra">Barra</option>
                    <option value="Mancuernas">Mancuernas</option>
                    <option value="Polea">Polea</option>
                    <option value="Corporal">Corporal</option>
                    <option value="Banca">Banca</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-accent text-zinc-950 font-black text-sm hover:brightness-110 shadow-lg shadow-accent/20 transition-all mt-2"
              >
                Crear y Añadir a Sesión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: CELEBRATION SUMMARY */}
      {summaryData?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="bg-zinc-900 border-2 border-accent rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl shadow-accent/25 space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-accent/20 border-2 border-accent text-accent flex items-center justify-center animate-bounce">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-accent text-zinc-950 font-black text-xs uppercase tracking-widest inline-block mb-1.5">
                ¡ENTRENAMIENTO COMPLETADO!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Gran trabajo, {activeFriend?.name || 'Atleta'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tu sesión ha sido sincronizada exitosamente con Supabase.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-left">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Fecha</span>
                <span className="text-sm font-black text-white">{formatDate(summaryData.date)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Volumen Total</span>
                <span className="text-lg font-black text-accent">{summaryData.totalVolume.toLocaleString('es-ES')} kg</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Ejercicios</span>
                <span className="text-lg font-black text-white">{summaryData.exerciseCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Series Totales</span>
                <span className="text-lg font-black text-amber-400">{summaryData.totalSets}</span>
              </div>
            </div>

            {summaryData.prsCount > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>¡Conseguiste {summaryData.prsCount} nuevo(s) Récord(s) Personal(es)!</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSummaryData(null)}
              className="w-full py-3.5 rounded-2xl bg-accent text-zinc-950 font-black text-sm hover:brightness-110 shadow-lg shadow-accent/20 transition-all"
            >
              Cerrar y Ver Resumen
            </button>
          </div>
        </div>
      )}

      {/* 7. MODAL: CONFIRM CANCEL SESSION */}
      {confirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">¿Descartar este entrenamiento?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Se perderán los ejercicios y series registradas en esta sesión en vivo.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
              >
                Continuar Sesión
              </button>
              <button
                type="button"
                onClick={handleCancelSession}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Sí, Descartar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

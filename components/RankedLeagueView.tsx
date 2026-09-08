'use client';

import React, { useState } from 'react';
import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import {
  RANKED_EXERCISES,
  RANK_TIERS,
  RankedExerciseType,
  getAthleteRankForExercise,
  getRankedLeaderboard,
  calculateRankFromPR,
  TierInfo,
} from '@/lib/rankedTiers';
import { formatDate, validateSetAgainstMR } from '@/lib/utils';
import { FriendAvatar } from './FriendAvatar';
import {
  Trophy,
  Crown,
  Shield,
  Award,
  Zap,
  Flame,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Calculator,
  Share2,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { BatIcon } from './BatIcon';
import { PRShareStoryModal, PRShareData } from './PRShareStoryModal';

interface RankedLeagueViewProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
  currentUser?: Friend | null;
  onNavigateTab?: (tab: string) => void;
}

export function RankedLeagueView({
  friends,
  exercises,
  logs,
  activeFriendId,
  currentUser,
  onNavigateTab,
}: RankedLeagueViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<RankedExerciseType>('bench_press');
  const [prShareData, setPrShareData] = useState<PRShareData | null>(null);

  // Live Simulator state (direct PR weight in kg)
  const [simWeight, setSimWeight] = useState<number>(85);

  // MR Ceiling Validation Simulator state (interactive demo of the user's scenario: 90kg MR vs 100kg x 7)
  const [testMR, setTestMR] = useState<number>(90);
  const [testWeight, setTestWeight] = useState<number>(100);
  const [testReps, setTestReps] = useState<number>(7);
  const mrValidationResult = validateSetAgainstMR(testWeight, testReps, testMR);

  const activeFriend = currentUser || friends.find((f) => f.id === activeFriendId) || friends[0];
  const userRank = activeFriend
    ? getAthleteRankForExercise(activeFriend.id, selectedExercise, logs, exercises)
    : null;

  const leaderboard = getRankedLeaderboard(selectedExercise, friends, logs, exercises);
  const activeExConfig = RANKED_EXERCISES.find((e) => e.id === selectedExercise)!;

  // Simulator calculation directly from PR weight
  const simRank = calculateRankFromPR(selectedExercise, simWeight);

  // Helper for Tier Badge Icon
  const renderTierIcon = (tier: TierInfo, className = 'w-5 h-5') => {
    switch (tier.id) {
      case 'campeon':
        return <Crown className={className} style={{ color: tier.color }} />;
      case 'gran_maestro':
        return <Flame className={className} style={{ color: tier.color }} />;
      case 'maestro':
        return <Sparkles className={className} style={{ color: tier.color }} />;
      case 'diamante':
        return <Zap className={className} style={{ color: tier.color }} />;
      case 'platino':
        return <Award className={className} style={{ color: tier.color }} />;
      case 'oro':
        return <Trophy className={className} style={{ color: tier.color }} />;
      case 'plata':
        return <Shield className={className} style={{ color: tier.color }} />;
      default:
        return <Shield className={className} style={{ color: tier.color }} />;
    }
  };

  const handleOpenShare = () => {
    if (!userRank || !activeFriend) return;
    const matchingEx = exercises.find((e) =>
      activeExConfig.matchKeywords.some((kw) => e.name.toLowerCase().includes(kw))
    ) || {
      id: selectedExercise,
      name: activeExConfig.name,
      category: activeExConfig.category as any,
      equipment: 'Barra',
    };

    setPrShareData({
      friend: activeFriend,
      exercise: matchingEx,
      weight: userRank.bestPRWeight,
      reps: userRank.bestPRReps || 1,
      date: userRank.prDate || new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-5 sm:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent px-2 py-0.5 rounded-full bg-accent/15 border border-accent/25">
                Liga Competitiva
              </span>
              <span className="text-[10px] font-bold text-zinc-400">Basada en tu PR Real</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Liga Ranked de Fuerza
            </h1>
            <p className="text-xs text-zinc-400">
              Rangos realistas medidos directamente por los kilos de tu récord personal (PR) guardado en la base de datos.
            </p>
          </div>
        </div>

        {/* Quick Exercise Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-x-auto scrollbar-none">
          {RANKED_EXERCISES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setSelectedExercise(ex.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                selectedExercise === ex.id
                  ? 'bg-accent text-zinc-950 shadow-md shadow-accent/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {ex.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* User Hero Ranked Card */}
      {userRank && (
        <div
          className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-7 shadow-2xl transition-all duration-300 ${userRank.tier.accentBg} ${userRank.tier.borderColor}`}
          style={{
            boxShadow: `0 10px 40px -10px ${userRank.tier.glowColor}`,
          }}
        >
          {/* Subtle Bat Watermark in Background */}
          <div className="absolute right-4 -bottom-10 opacity-5 pointer-events-none">
            <BatIcon className="w-64 h-64" style={{ color: userRank.tier.color }} />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Tier Identity & PR Database Badge */}
            <div className="flex items-start sm:items-center gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-xl border-2"
                style={{
                  backgroundColor: `${userRank.tier.color}20`,
                  borderColor: userRank.tier.color,
                  boxShadow: `0 0 25px ${userRank.tier.glowColor}`,
                }}
              >
                {renderTierIcon(userRank.tier, 'w-8 h-8 sm:w-10 sm:h-10')}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: userRank.tier.color,
                      backgroundColor: `${userRank.tier.color}15`,
                      borderColor: `${userRank.tier.color}40`,
                    }}
                  >
                    Rango en {activeExConfig.shortName}
                  </span>

                  {userRank.hasDbRecord ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Database className="w-3 h-3" /> PR Validado en BD: {userRank.bestPRWeight} kg
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Database className="w-3 h-3 text-zinc-500" /> Sin PR en Base de Datos
                    </span>
                  )}

                  {userRank.estimatedMR > 0 && (
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Techo MR: {userRank.estimatedMR} kg
                    </span>
                  )}

                  {userRank.hasDisqualifiedSets && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{userRank.disqualifiedSetsCount} serie(s) inverosímiles filtradas</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span style={{ color: userRank.tier.color }}>{userRank.tier.name}</span>
                  {userRank.hasDbRecord && (
                    <span className="text-zinc-400 text-base sm:text-xl font-bold font-mono">
                      {userRank.bestPRWeight} kg PR {userRank.bestPRReps > 1 ? `(× ${userRank.bestPRReps} reps)` : ''}
                    </span>
                  )}
                </h2>

                <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                  {userRank.hasDbRecord
                    ? `Medido con tu PR oficial de ${userRank.bestPRWeight} kg guardado en la base de datos${userRank.prDate ? ` el ${formatDate(userRank.prDate)}` : ''}. ${userRank.tier.description}`
                    : `Aún no tienes un PR guardado en la base de datos para ${activeExConfig.name}. Entrena este ejercicio para conseguir tu rango.`}
                </p>
              </div>
            </div>

            {/* LP and Progression */}
            <div className="w-full lg:w-80 bg-zinc-950/85 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-zinc-400 uppercase tracking-wider">Puntos de Liga (LP)</span>
                <span className="text-white font-mono" style={{ color: userRank.tier.color }}>
                  {userRank.lp} / 100 LP
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${userRank.lp}%`,
                    backgroundColor: userRank.tier.color,
                    boxShadow: `0 0 12px ${userRank.tier.color}`,
                  }}
                />
              </div>

              {/* Next Tier Indicator */}
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                {userRank.nextTier ? (
                  <span>
                    Próximo rango: <strong className="text-white">{userRank.nextTier.name}</strong>
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">¡Rango Campeón Alcanzado!</span>
                )}

                {userRank.kgToNextTier > 0 && (
                  <span className="text-accent font-bold font-mono">
                    Faltan {userRank.kgToNextTier} kg
                  </span>
                )}
              </div>

              {userRank.hasDbRecord ? (
                <button
                  type="button"
                  onClick={handleOpenShare}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-accent" />
                  <span>Compartir Rango (Story)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('logger')}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-accent hover:bg-accent/90 text-zinc-950 font-black text-xs transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Registrar Entrenamiento</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Leaderboard + Formula & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table (2 Cols) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/25">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Clasificación de la Liga por PR en BD
                </h3>
                <p className="text-xs text-zinc-400">
                  Récords de peso guardados en {activeExConfig.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Techo MR Activo</span>
              </span>
              <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>{leaderboard.length} Atletas</span>
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((item) => {
              const isCurrentUser = activeFriend?.id === item.friend.id;
              const hasMark = item.rankResult.hasDbRecord;

              return (
                <div
                  key={item.friend.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-zinc-950 border-accent/60 shadow-lg shadow-accent/5 ring-1 ring-accent/30'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950'
                  }`}
                >
                  {/* Left: Position & Avatar & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position Medal */}
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                      {item.position === 1 && (
                        <span className="text-amber-400 flex items-center justify-center">
                          <Crown className="w-5 h-5 fill-amber-400/20" />
                        </span>
                      )}
                      {item.position === 2 && (
                        <span className="text-slate-300 font-bold">#2</span>
                      )}
                      {item.position === 3 && (
                        <span className="text-amber-600 font-bold">#3</span>
                      )}
                      {item.position > 3 && (
                        <span className="text-zinc-500 font-mono">#{item.position}</span>
                      )}
                    </div>

                    <FriendAvatar friend={item.friend} size="md" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white truncate">
                          {item.friend.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                            Tú
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-zinc-400 block truncate flex items-center gap-1 mt-0.5">
                        {hasMark ? (
                          <>
                            <Database className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                            <span>
                              PR: <strong>{item.rankResult.bestPRWeight} kg</strong>
                              {item.rankResult.bestPRReps > 1 ? ` × ${item.rankResult.bestPRReps} reps` : ''}
                            </span>
                            {item.rankResult.prDate && (
                              <span className="text-zinc-500 font-mono text-[10px]">
                                ({formatDate(item.rankResult.prDate)})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-zinc-500">Sin PR registrado en base de datos</span>
                        )}
                      </span>

                      {item.rankResult.hasDisqualifiedSets && (
                        <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{item.rankResult.disqualifiedSetsCount} serie(s) anómalas excluidas</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Tier Badge & PR Weight */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="hidden sm:block">
                      <span
                        className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border flex items-center gap-1.5"
                        style={{
                          color: item.rankResult.tier.color,
                          backgroundColor: `${item.rankResult.tier.color}15`,
                          borderColor: `${item.rankResult.tier.color}40`,
                        }}
                      >
                        {renderTierIcon(item.rankResult.tier, 'w-3.5 h-3.5')}
                        <span>{item.rankResult.tier.name}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-sm sm:text-base font-black text-white font-mono block">
                        {hasMark ? `${item.rankResult.bestPRWeight} kg` : '—'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        {hasMark
                          ? `${item.rankResult.lp} LP${item.rankResult.estimatedMR > 0 ? ` • MR: ${item.rankResult.estimatedMR}kg` : ''}`
                          : '0 LP'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator & Quick Info (1 Col) */}
        <div className="space-y-6">
          {/* Simulator Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Simulador de Rango</h3>
                <p className="text-[11px] text-zinc-400">Comprueba qué rango da tu peso en barra</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Peso de PR en barra:</span>
                  <span className="text-accent font-mono text-sm">{simWeight} kg</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="220"
                  step="2.5"
                  value={simWeight}
                  onChange={(e) => setSimWeight(parseFloat(e.target.value) || 20)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation Result */}
            <div
              className="p-4 rounded-2xl border text-center space-y-1.5 transition-all"
              style={{
                backgroundColor: `${simRank.tier.color}15`,
                borderColor: `${simRank.tier.color}50`,
              }}
            >
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Con un PR de <strong className="text-white font-mono">{simWeight} kg</strong>:
              </span>
              <div
                className="text-xl font-black uppercase flex items-center justify-center gap-2"
                style={{ color: simRank.tier.color }}
              >
                {renderTierIcon(simRank.tier, 'w-6 h-6')}
                <span>{simRank.tier.name}</span>
                <span className="text-xs text-zinc-300 font-mono">({simRank.lp} LP)</span>
              </div>
              {simRank.nextTier ? (
                <p className="text-[11px] text-zinc-400">
                  A solo <strong className="text-white font-mono">{simRank.kgToNextTier} kg</strong> de {simRank.nextTier.name}
                </p>
              ) : (
                <p className="text-[11px] text-amber-400 font-bold">¡Rango Máximo Campeón!</p>
              )}
            </div>
          </div>

          {/* MR Ceiling Tester Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Validador de Techo MR</h3>
                <p className="text-[11px] text-zinc-400">Verifica la coherencia fisiológica de una marca</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">MR Previo:</label>
                  <div className="flex items-center bg-zinc-950 px-2 py-1.5 rounded-xl border border-zinc-800">
                    <input
                      type="number"
                      value={testMR}
                      onChange={(e) => setTestMR(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                    />
                    <span className="text-[10px] text-zinc-500">kg</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Peso:</label>
                  <div className="flex items-center bg-zinc-950 px-2 py-1.5 rounded-xl border border-zinc-800">
                    <input
                      type="number"
                      value={testWeight}
                      onChange={(e) => setTestWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                    />
                    <span className="text-[10px] text-zinc-500">kg</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Reps:</label>
                  <div className="flex items-center bg-zinc-950 px-2 py-1.5 rounded-xl border border-zinc-800">
                    <input
                      type="number"
                      value={testReps}
                      onChange={(e) => setTestReps(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-transparent text-xs font-mono font-bold text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Validation Result Box */}
              {!mrValidationResult.isValid ? (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Registro Inverosímil Detectado</span>
                  </div>
                  <p className="text-[11px] text-red-300/90 leading-tight">
                    {mrValidationResult.reason}
                  </p>
                  <p className="text-[10px] text-red-400 font-mono font-bold">
                    ⛔ Quedaría excluido de la Liga Ranked
                  </p>
                </div>
              ) : mrValidationResult.isWarning ? (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Advertencia de Salto Agresivo</span>
                  </div>
                  <p className="text-[11px] text-amber-300 leading-tight">
                    {mrValidationResult.reason}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono font-bold">
                    ⚠️ Permitido pero con verificación de datos
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Registro Fisiológicamente Válido</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/90 leading-tight">
                    1RM proyectado: <strong>{mrValidationResult.projected1RM} kg</strong> (+{mrValidationResult.percentageJump}%).
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono font-bold">
                    ✅ Califica limpiamente para la Liga Ranked
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Help Callout */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-2 text-xs text-zinc-400">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              Pesos Realistas y Motivadores
            </h4>
            <p className="leading-relaxed">
              Los rangos están calibrados para atletas reales de gimnasio de casa. Tu rango se asigna
              directamente por el peso que levantas, sin fórmulas abstractas ni cálculos de repeticiones máximas.
            </p>
          </div>
        </div>
      </div>

      {/* Educational Formula Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-2xl bg-accent/15 text-accent border border-accent/25">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Fórmula Oficial de Rangos y Puntos de Liga (LP)
            </h3>
            <p className="text-xs text-zinc-400">
              Cálculo transparente basado directamente en los kilos de tu Récord Personal (PR) con validación de techo fisiológico.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Formula 1: Real PR weight assignment */}
          <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                1. Asignación Directa por Kilos de PR
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Peso Real en Barra
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-center text-sm sm:text-base text-accent font-bold">
              Rango = Umbral( PR de Peso en Base de Datos )
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              No utilizamos estimaciones teóricas ni fórmulas de 1RM. Tu rango se mide por el récord
              de peso más alto que lograste levantar y que está guardado en tu historial de la base de datos.
            </p>
            <div className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
              <strong>Ejemplo en Press de Banca:</strong> Si tu récord guardado es de <strong>85 kg</strong>,
              entras directamente en <strong className="text-yellow-400">ORO</strong> (rango de 70 a 90 kg).
            </div>
          </div>

          {/* Formula 2: League Points (LP) */}
          <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                2. Fórmula de Puntos de Liga (LP)
              </h4>
              <span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                0 a 100 LP
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-center text-xs sm:text-sm text-blue-400 font-bold">
              LP = [ ( PR Actual - Piso del Rango ) ÷ ( Techo - Piso ) ] × 100
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Cada rango abarca una banda de kilos. Cada kilo que añades a tu récord suma LP en tu barra de progresión.
              Al alcanzar 100 LP, subes inmediatamente a la siguiente división.
            </p>
            <div className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
              <strong>Ejemplo con 85 kg en Oro (70 a 90 kg):</strong>
              <br />
              LP = (85 - 70) ÷ (90 - 70) = 15 ÷ 20 = <strong className="text-blue-400">75 LP</strong>.
              ¡A solo <strong className="text-accent">5 kg</strong> de ascender a Platino!
            </div>
          </div>

          {/* Formula 3: MR Ceiling Validation */}
          <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                3. Validación de Techo MR
              </h4>
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Anti-Inverosímil
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-center text-xs sm:text-sm text-amber-400 font-bold">
              Válido = Salto ≤ 15-20% y Reps Lógicas s/ MR
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              El sistema usa tu MR previo como techo lógico. Ningún registro puede violar la física del esfuerzo sin progresión intermedia creíble.
            </p>
            <div className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
              <strong>Ejemplo del Techo:</strong> Si tu MR estimado es de <strong>90 kg</strong> y registras <strong>100 kg × 7 reps</strong>,
              se detecta como <strong className="text-red-400">inverosímil (+37% salto)</strong> y queda excluido de la liga para proteger la tabla.
            </div>
          </div>
        </div>
      </div>

      {/* Tier Ladder Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white">Escalera Oficial de Rangos</h3>
            <p className="text-xs text-zinc-400">
              Kilos de PR necesarios en barra para cada nivel en {activeExConfig.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RANK_TIERS.map((tier) => {
            const isCurrent = userRank?.tier.id === tier.id;
            const minW = tier.minWeight[selectedExercise];

            return (
              <div
                key={tier.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-zinc-950 border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/30'
                    : 'bg-zinc-950/70 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderTierIcon(tier, 'w-4 h-4')}
                    <span className="text-sm font-black text-white">{tier.name}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                      Tu Nivel
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono font-bold" style={{ color: tier.color }}>
                  {tier.id === 'campeon'
                    ? `≥ ${minW} kg`
                    : tier.id === 'bronce'
                    ? `< ${RANK_TIERS[1].minWeight[selectedExercise]} kg`
                    : `${minW} - ${RANK_TIERS[tier.order].minWeight[selectedExercise] - 0.1} kg`}
                </div>

                <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                  {tier.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Modal Integration */}
      <PRShareStoryModal
        isOpen={Boolean(prShareData)}
        onClose={() => setPrShareData(null)}
        prData={prShareData}
      />
    </div>
  );
}

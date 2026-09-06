'use client';

import React, { useState } from 'react';
import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import {
  RANKED_EXERCISES,
  RANK_TIERS,
  RankedExerciseType,
  getAthleteRankForExercise,
  getRankedLeaderboard,
  calculateRankFrom1RM,
  TierInfo,
} from '@/lib/rankedTiers';
import { calculate1RM } from '@/lib/utils';
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
  ArrowUpRight,
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
}: RankedLeagueViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<RankedExerciseType>('bench_press');
  const [prShareData, setPrShareData] = useState<PRShareData | null>(null);

  // Live Simulator state
  const [simWeight, setSimWeight] = useState<number>(80);
  const [simReps, setSimReps] = useState<number>(5);

  const activeFriend = currentUser || friends.find((f) => f.id === activeFriendId) || friends[0];
  const userRank = activeFriend
    ? getAthleteRankForExercise(activeFriend.id, selectedExercise, logs, exercises)
    : null;

  const leaderboard = getRankedLeaderboard(selectedExercise, friends, logs, exercises);
  const activeExConfig = RANKED_EXERCISES.find((e) => e.id === selectedExercise)!;

  // Simulator calculation
  const sim1RM = calculate1RM(simWeight, simReps);
  const simRank = calculateRankFrom1RM(selectedExercise, sim1RM);

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
      weight: userRank.bestWeight || userRank.best1RM,
      reps: userRank.bestReps || 1,
      date: new Date().toISOString(),
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
              <span className="text-[10px] font-bold text-zinc-400">Temporada Activa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Liga Ranked de Fuerza
            </h1>
            <p className="text-xs text-zinc-400">
              Clasificación por rangos competitivos basada en marcas personales de fuerza.
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
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
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
            {/* Tier Identity */}
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

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: userRank.tier.color,
                      backgroundColor: `${userRank.tier.color}15`,
                      borderColor: `${userRank.tier.color}40`,
                    }}
                  >
                    Rango Oficial en {activeExConfig.shortName}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <span style={{ color: userRank.tier.color }}>{userRank.tier.name}</span>
                  <span className="text-zinc-400 text-lg sm:text-xl font-bold font-mono">
                    {userRank.best1RM > 0 ? `${userRank.best1RM} kg 1RM` : 'Sin Registro'}
                  </span>
                </h2>

                <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                  {userRank.tier.description}
                </p>
              </div>
            </div>

            {/* LP and Progression */}
            <div className="w-full lg:w-80 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
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

              {/* Next Tier or Master Badge */}
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                {userRank.nextTier ? (
                  <span>
                    Próximo rango: <strong className="text-white">{userRank.nextTier.name}</strong>
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">¡Rango Máximo Alcanzado!</span>
                )}

                {userRank.kgToNextTier > 0 && (
                  <span className="text-accent font-bold">
                    Faltan {userRank.kgToNextTier} kg
                  </span>
                )}
              </div>

              {userRank.best1RM > 0 && (
                <button
                  type="button"
                  onClick={handleOpenShare}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-accent" />
                  <span>Compartir Rango (Story)</span>
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
                  Tabla de Clasificación de la Liga
                </h3>
                <p className="text-xs text-zinc-400">
                  Ranking de amigos en {activeExConfig.name}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
              {leaderboard.length} Atletas
            </span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((item) => {
              const isCurrentUser = activeFriend?.id === item.friend.id;
              const hasMark = item.rankResult.best1RM > 0;

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
                      <span className="text-[11px] text-zinc-500 block truncate">
                        {hasMark
                          ? `${item.rankResult.bestWeight} kg × ${item.rankResult.bestReps} reps`
                          : 'Sin registro en este ejercicio'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Tier Badge & 1RM */}
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
                        {hasMark ? `${item.rankResult.best1RM} kg` : '—'}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        {hasMark ? `${item.rankResult.lp} LP` : '0 LP'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator & Quick Formula (1 Col) */}
        <div className="space-y-6">
          {/* Simulator Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Simulador de Rango</h3>
                <p className="text-[11px] text-zinc-400">¿Qué rango alcanzarías hoy?</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Peso a levantar:</span>
                  <span className="text-accent font-mono">{simWeight} kg</span>
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

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Repeticiones:</span>
                  <span className="text-accent font-mono">{simReps} reps</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={simReps}
                  onChange={(e) => setSimReps(parseInt(e.target.value, 10) || 1)}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation Result */}
            <div
              className="p-3.5 rounded-2xl border text-center space-y-1 transition-all"
              style={{
                backgroundColor: `${simRank.tier.color}15`,
                borderColor: `${simRank.tier.color}50`,
              }}
            >
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                1RM Estimado: <strong className="text-white font-mono">{sim1RM} kg</strong>
              </span>
              <div
                className="text-lg font-black uppercase flex items-center justify-center gap-1.5"
                style={{ color: simRank.tier.color }}
              >
                {renderTierIcon(simRank.tier, 'w-5 h-5')}
                <span>{simRank.tier.name}</span>
                <span className="text-xs text-zinc-300 font-mono">({simRank.lp} LP)</span>
              </div>
              {simRank.nextTier && (
                <p className="text-[10px] text-zinc-400">
                  A solo <strong>{simRank.kgToNextTier} kg</strong> de {simRank.nextTier.name}
                </p>
              )}
            </div>
          </div>

          {/* Quick Help Callout */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-2 text-xs text-zinc-400">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-accent" />
              ¿Cómo subir de rango?
            </h4>
            <p className="leading-relaxed">
              Registra tus levantamientos en cualquier sesión de entrenamiento. El sistema detecta
              automáticamente tu peso y repeticiones para calcular tu 1RM oficial y actualizar tu
              rango al instante.
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
              Fórmula y Metodología de Rangos
            </h3>
            <p className="text-xs text-zinc-400">
              Cálculo matemático transparente del 1RM y distribución de Puntos de Liga (LP).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Formula 1: Epley 1RM */}
          <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                1. Fórmula de Epley (1RM Estimado)
              </h4>
              <span className="text-[10px] text-accent font-bold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                Estándar Internacional
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-center text-sm sm:text-base text-accent font-bold">
              1RM = Peso × [ 1 + ( Reps ÷ 30 ) ]
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              No es necesario intentar una repetición máxima riesgosa a 1 rep para conocer tu fuerza.
              La fórmula de Epley calcula tu 1RM con precisión científica a partir de series de 3 a 8
              repeticiones pesadas.
            </p>
            <div className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
              <strong>Ejemplo:</strong> 85 kg × 5 reps = 85 × (1 + 5/30) = 85 × 1.167 ={' '}
              <strong className="text-accent">99.2 kg (Oro 96 LP)</strong>.
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
              LP = [ (1RM - Piso del Rango) ÷ (Techo - Piso) ] × 100
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Cada rango abarca una banda de fuerza de 20 kg. Al ganar kilos en tus marcas, sumas LP
              en tu barra de progresión. Al llegar a 100 LP, asciendes inmediatamente al siguiente rango.
            </p>
            <div className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80">
              <strong>Promoción a Platino (100 kg):</strong> Si tu marca es 90 kg en Oro (80 a 100 kg),
              tienes (90 - 80) ÷ 20 = <strong className="text-blue-400">50 LP</strong>.
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
              Requisitos de peso (1RM) para cada nivel en {activeExConfig.name}
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
                  {tier.id === 'campeon' ? `≥ ${minW} kg` : tier.id === 'bronce' ? `< ${RANK_TIERS[1].minWeight[selectedExercise]} kg` : `${minW} - ${RANK_TIERS[tier.order].minWeight[selectedExercise] - 0.1} kg`}
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

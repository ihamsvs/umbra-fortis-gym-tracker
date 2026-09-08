import { WorkoutLog, Exercise, Friend } from '@/types/gym';
import { getMaxWeightInLog, getFriendPRs } from './utils';

export type RankTierId =
  | 'bronce'
  | 'plata'
  | 'oro'
  | 'platino'
  | 'diamante'
  | 'maestro'
  | 'gran_maestro'
  | 'campeon';

export type RankedExerciseType = 'bench_press' | 'squat' | 'deadlift' | 'overhead_press';

export interface RankedExerciseConfig {
  id: RankedExerciseType;
  name: string;
  shortName: string;
  category: string;
  matchKeywords: string[];
}

export const RANKED_EXERCISES: RankedExerciseConfig[] = [
  {
    id: 'bench_press',
    name: 'Press de Banca con Barra',
    shortName: 'Press de Banca',
    category: 'Pecho',
    matchKeywords: ['banca', 'bench'],
  },
  {
    id: 'squat',
    name: 'Sentadilla con Barra',
    shortName: 'Sentadilla',
    category: 'Piernas',
    matchKeywords: ['sentadilla', 'squat'],
  },
  {
    id: 'deadlift',
    name: 'Peso Muerto con Barra',
    shortName: 'Peso Muerto',
    category: 'Espalda / Piernas',
    matchKeywords: ['peso muerto', 'deadlift'],
  },
  {
    id: 'overhead_press',
    name: 'Press Militar con Barra',
    shortName: 'Press Militar',
    category: 'Hombros',
    matchKeywords: ['militar', 'overhead', 'press militar'],
  },
];

export interface TierInfo {
  id: RankTierId;
  order: number;
  name: string;
  color: string;
  accentBg: string;
  borderColor: string;
  glowColor: string;
  description: string;
  // Weight thresholds based directly on real PR weight (kg lifted on the bar)
  minWeight: {
    bench_press: number;
    squat: number;
    deadlift: number;
    overhead_press: number;
  };
}

export const RANK_TIERS: TierInfo[] = [
  {
    id: 'bronce',
    order: 1,
    name: 'Bronce',
    color: '#d97706',
    accentBg: 'bg-amber-950/30',
    borderColor: 'border-amber-700/60',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    description: 'Fase inicial: dominando la técnica y construyendo el hábito.',
    minWeight: {
      bench_press: 0,
      squat: 0,
      deadlift: 0,
      overhead_press: 0,
    },
  },
  {
    id: 'plata',
    order: 2,
    name: 'Plata',
    color: '#94a3b8',
    accentBg: 'bg-slate-900/50',
    borderColor: 'border-slate-400/50',
    glowColor: 'rgba(148, 163, 184, 0.25)',
    description: 'Fuerza intermedia sólida con discos medianos en la barra.',
    minWeight: {
      bench_press: 50,
      squat: 70,
      deadlift: 80,
      overhead_press: 30,
    },
  },
  {
    id: 'oro',
    order: 3,
    name: 'Oro',
    color: '#facc15',
    accentBg: 'bg-yellow-950/30',
    borderColor: 'border-yellow-400/60',
    glowColor: 'rgba(250, 204, 21, 0.3)',
    description: 'Nivel destacado de gimnasio. Cargas pesadas y técnica impecable.',
    minWeight: {
      bench_press: 70,
      squat: 95,
      deadlift: 110,
      overhead_press: 45,
    },
  },
  {
    id: 'platino',
    order: 4,
    name: 'Platino',
    color: '#06b6d4',
    accentBg: 'bg-cyan-950/30',
    borderColor: 'border-cyan-400/60',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    description: '¡Nivel avanzado! Rozando y conquistando el club de los 100 kg.',
    minWeight: {
      bench_press: 90,
      squat: 120,
      deadlift: 140,
      overhead_press: 55,
    },
  },
  {
    id: 'diamante',
    order: 5,
    name: 'Diamante',
    color: '#3b82f6',
    accentBg: 'bg-blue-950/30',
    borderColor: 'border-blue-500/60',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    description: 'Élite del gimnasio de casa. Cargas impresionantes y gran respeto.',
    minWeight: {
      bench_press: 105,
      squat: 140,
      deadlift: 170,
      overhead_press: 65,
    },
  },
  {
    id: 'maestro',
    order: 6,
    name: 'Maestro',
    color: '#a855f7',
    accentBg: 'bg-purple-950/30',
    borderColor: 'border-purple-500/60',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Fuerza titánica. Años de disciplina y dedicación al entrenamiento pesado.',
    minWeight: {
      bench_press: 120,
      squat: 160,
      deadlift: 200,
      overhead_press: 75,
    },
  },
  {
    id: 'gran_maestro',
    order: 7,
    name: 'Gran Maestro',
    color: '#ef4444',
    accentBg: 'bg-red-950/30',
    borderColor: 'border-red-500/60',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    description: 'Fuerza extrema de competición. Una auténtica bestia en la cueva.',
    minWeight: {
      bench_press: 135,
      squat: 180,
      deadlift: 225,
      overhead_press: 85,
    },
  },
  {
    id: 'campeon',
    order: 8,
    name: 'Campeón',
    color: '#f59e0b',
    accentBg: 'bg-zinc-950',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    description: 'Campeón Supremo de Umbra Fortis. La cima absoluta de fuerza de Gotham.',
    minWeight: {
      bench_press: 150,
      squat: 200,
      deadlift: 250,
      overhead_press: 95,
    },
  },
];

export interface AthleteRankResult {
  tier: TierInfo;
  nextTier: TierInfo | null;
  exerciseType: RankedExerciseType;
  exerciseName: string;
  bestPRWeight: number; // Official real weight (kg) from DB PR
  bestPRReps: number;   // Reps done with that PR
  prDate?: string;
  hasDbRecord: boolean;
  lp: number; // League points 0 - 100
  kgToNextTier: number;
  rankTitle: string;
}

/**
 * Finds matching ranked exercise type from exercise name
 */
export function matchRankedExercise(name: string): RankedExerciseType | null {
  const lower = name.toLowerCase();
  for (const item of RANKED_EXERCISES) {
    if (item.matchKeywords.some((kw) => lower.includes(kw))) {
      return item.id;
    }
  }
  return null;
}

/**
 * Calculates the exact rank, LP and distance to next rank given real PR weight (kg)
 */
export function calculateRankFromPR(
  exerciseType: RankedExerciseType,
  weightPR: number
): {
  tier: TierInfo;
  nextTier: TierInfo | null;
  lp: number;
  kgToNextTier: number;
} {
  const sorted = [...RANK_TIERS].sort((a, b) => a.order - b.order);
  let currentTier = sorted[0];
  let nextTier: TierInfo | null = sorted[1] || null;

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    if (weightPR >= tier.minWeight[exerciseType]) {
      currentTier = tier;
      nextTier = i < sorted.length - 1 ? sorted[i + 1] : null;
    }
  }

  let lp = 100;
  let kgToNextTier = 0;

  if (nextTier) {
    const floor = currentTier.minWeight[exerciseType];
    const ceiling = nextTier.minWeight[exerciseType];
    const span = ceiling - floor;
    if (span > 0) {
      const rawLp = ((weightPR - floor) / span) * 100;
      lp = Math.min(99, Math.max(0, Math.round(rawLp)));
      kgToNextTier = Math.max(0, Math.round((ceiling - weightPR) * 10) / 10);
    }
  } else {
    // Already in Campeón!
    lp = 100;
    kgToNextTier = 0;
  }

  return {
    tier: currentTier,
    nextTier,
    lp,
    kgToNextTier,
  };
}

/**
 * Gets the official PR stored in database for an athlete and calculates their rank from real kg
 */
export function getAthleteRankForExercise(
  friendId: string,
  exerciseType: RankedExerciseType,
  logs: WorkoutLog[],
  exercises: Exercise[]
): AthleteRankResult {
  const config = RANKED_EXERCISES.find((e) => e.id === exerciseType)!;

  // Find matching exercise IDs in catalog
  const matchingExercises = exercises.filter((ex) => matchRankedExercise(ex.name) === exerciseType);
  const matchingExerciseIds = new Set(matchingExercises.map((ex) => ex.id));

  // Get all PRs calculated from DB logs for this friend
  const friendPRs = getFriendPRs(logs, friendId);

  let bestPR: {
    exerciseId: string;
    maxWeight: number;
    repsAtMax: number;
    date: string;
  } | null = null;

  for (const exId of Array.from(matchingExerciseIds)) {
    const pr = friendPRs[exId];
    if (pr && pr.maxWeight > 0) {
      if (!bestPR || pr.maxWeight > bestPR.maxWeight) {
        bestPR = {
          exerciseId: pr.exerciseId,
          maxWeight: pr.maxWeight,
          repsAtMax: pr.repsAtMax,
          date: pr.date,
        };
      }
    }
  }

  // Fallback to directly inspecting logs if needed
  if (!bestPR || bestPR.maxWeight === 0) {
    const athleteLogs = logs.filter(
      (l) => l.friendId === friendId && matchingExerciseIds.has(l.exerciseId)
    );

    for (const log of athleteLogs) {
      const { maxWeight, reps } = getMaxWeightInLog(log.sets);
      if (maxWeight > 0) {
        if (!bestPR || maxWeight > bestPR.maxWeight) {
          bestPR = {
            exerciseId: log.exerciseId,
            maxWeight,
            repsAtMax: reps,
            date: log.date,
          };
        }
      }
    }
  }

  const hasDbRecord = Boolean(bestPR && bestPR.maxWeight > 0);
  const bestPRWeight = bestPR ? bestPR.maxWeight : 0;
  const bestPRReps = bestPR ? bestPR.repsAtMax : 0;
  const prDate = bestPR ? bestPR.date : '';

  const { tier, nextTier, lp, kgToNextTier } = calculateRankFromPR(exerciseType, bestPRWeight);

  return {
    tier,
    nextTier,
    exerciseType,
    exerciseName: config.name,
    bestPRWeight,
    bestPRReps,
    prDate,
    hasDbRecord,
    lp,
    kgToNextTier,
    rankTitle: hasDbRecord
      ? `${tier.name.toUpperCase()} • ${bestPRWeight} KG PR`
      : `${tier.name.toUpperCase()} • SIN PR EN BD`,
  };
}

/**
 * Generates ranked leaderboard for all athletes in a specific exercise based on real DB PR weight (kg)
 */
export function getRankedLeaderboard(
  exerciseType: RankedExerciseType,
  friends: Friend[],
  logs: WorkoutLog[],
  exercises: Exercise[]
): Array<{
  friend: Friend;
  rankResult: AthleteRankResult;
  position: number;
}> {
  const list = friends.map((friend) => {
    const rankResult = getAthleteRankForExercise(friend.id, exerciseType, logs, exercises);
    return {
      friend,
      rankResult,
      position: 0,
    };
  });

  // Sort descending by real PR weight lifted in DB, then by tier order
  list.sort((a, b) => {
    if (b.rankResult.bestPRWeight !== a.rankResult.bestPRWeight) {
      return b.rankResult.bestPRWeight - a.rankResult.bestPRWeight;
    }
    return b.rankResult.tier.order - a.rankResult.tier.order;
  });

  return list.map((item, index) => ({
    ...item,
    position: index + 1,
  }));
}

import { WorkoutLog, Exercise, Friend } from '@/types/gym';
import { calculate1RM, getMaxWeightInLog, getFriendPRs } from './utils';

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
    description: 'Fase inicial: construyendo los cimientos de la técnica y la fuerza básica.',
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
    description: 'Fuerza intermedia sólida y técnica consolidada.',
    minWeight: {
      bench_press: 60,
      squat: 80,
      deadlift: 100,
      overhead_press: 40,
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
    description: 'Nivel avanzado de gimnasio. Dominio evidente de cargas pesadas.',
    minWeight: {
      bench_press: 80,
      squat: 110,
      deadlift: 140,
      overhead_press: 55,
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
    description: '¡El Club de los 100 KG en Banca! Atleta experimentado y de élite.',
    minWeight: {
      bench_press: 100,
      squat: 140,
      deadlift: 180,
      overhead_press: 70,
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
    description: 'Fuerza excepcional. Nivel superior e inspirador para el resto del equipo.',
    minWeight: {
      bench_press: 120,
      squat: 170,
      deadlift: 220,
      overhead_press: 80,
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
    description: 'Maestría total del hierro. Años de disciplina y sobrecarga progresiva.',
    minWeight: {
      bench_press: 140,
      squat: 200,
      deadlift: 250,
      overhead_press: 90,
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
    description: 'Nivel competitivo de powerlifting. Una bestia levantando hierro.',
    minWeight: {
      bench_press: 160,
      squat: 230,
      deadlift: 280,
      overhead_press: 100,
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
    description: 'Campeón Supremo de Umbra Fortis. El pico absoluto de fuerza en Gotham.',
    minWeight: {
      bench_press: 180,
      squat: 260,
      deadlift: 310,
      overhead_press: 110,
    },
  },
];

export interface AthleteRankResult {
  tier: TierInfo;
  nextTier: TierInfo | null;
  exerciseType: RankedExerciseType;
  exerciseName: string;
  best1RM: number;
  bestWeight: number;
  bestReps: number;
  prDate?: string;
  hasDbRecord: boolean;
  lp: number; // League points 0 - 100
  kgToNextTier: number;
  rankTitle: string;
}

/**
 * Finds the corresponding exercise config from an exercise name
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
 * Calculates the exact rank, LP and distance to next rank given a 1RM
 */
export function calculateRankFrom1RM(
  exerciseType: RankedExerciseType,
  weight1RM: number
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
    if (weight1RM >= tier.minWeight[exerciseType]) {
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
      const rawLp = ((weight1RM - floor) / span) * 100;
      lp = Math.min(99, Math.max(0, Math.round(rawLp)));
      kgToNextTier = Math.max(0, Math.round((ceiling - weight1RM) * 10) / 10);
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
 * Gets the official PR stored in database for an athlete and calculates their rank
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
    max1RM: number;
    repsAtMax: number;
    date: string;
  } | null = null;

  for (const exId of Array.from(matchingExerciseIds)) {
    const pr = friendPRs[exId];
    if (pr && pr.maxWeight > 0) {
      if (
        !bestPR ||
        pr.maxWeight > bestPR.maxWeight ||
        (pr.maxWeight === bestPR.maxWeight && pr.max1RM > bestPR.max1RM)
      ) {
        bestPR = pr;
      }
    }
  }

  // Also inspect all logs directly to catch any matching logs
  if (!bestPR || bestPR.maxWeight === 0) {
    const athleteLogs = logs.filter(
      (l) => l.friendId === friendId && matchingExerciseIds.has(l.exerciseId)
    );

    for (const log of athleteLogs) {
      const { maxWeight, reps } = getMaxWeightInLog(log.sets);
      if (maxWeight > 0 && reps > 0) {
        const est1RM = calculate1RM(maxWeight, reps);
        if (!bestPR || maxWeight > bestPR.maxWeight || est1RM > bestPR.max1RM) {
          bestPR = {
            exerciseId: log.exerciseId,
            maxWeight,
            max1RM: est1RM,
            repsAtMax: reps,
            date: log.date,
          };
        }
      }
    }
  }

  const hasDbRecord = Boolean(bestPR && bestPR.maxWeight > 0);
  const best1RM = bestPR ? bestPR.max1RM : 0;
  const bestWeight = bestPR ? bestPR.maxWeight : 0;
  const bestReps = bestPR ? bestPR.repsAtMax : 0;
  const prDate = bestPR ? bestPR.date : '';

  const { tier, nextTier, lp, kgToNextTier } = calculateRankFrom1RM(exerciseType, best1RM);

  return {
    tier,
    nextTier,
    exerciseType,
    exerciseName: config.name,
    best1RM,
    bestWeight,
    bestReps,
    prDate,
    hasDbRecord,
    lp,
    kgToNextTier,
    rankTitle: hasDbRecord
      ? `${tier.name.toUpperCase()} • ${bestWeight} KG (1RM: ${best1RM} KG)`
      : `${tier.name.toUpperCase()} • SIN PR EN BD`,
  };
}

/**
 * Generates ranked leaderboard for all athletes in a specific exercise based on DB PRs
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

  // Sort descending by DB 1RM, then by tier order
  list.sort((a, b) => {
    if (b.rankResult.best1RM !== a.rankResult.best1RM) {
      return b.rankResult.best1RM - a.rankResult.best1RM;
    }
    return b.rankResult.tier.order - a.rankResult.tier.order;
  });

  return list.map((item, index) => ({
    ...item,
    position: index + 1,
  }));
}

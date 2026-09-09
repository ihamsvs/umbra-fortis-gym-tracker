import { WorkoutSet, WorkoutLog, PersonalRecord } from '@/types/gym';

/**
 * Generates a monogram (initials) from a friend's name.
 * Uses first letter of each word; for a single word, uses its first two letters.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

/**
 * Calculates Estimated 1RM (One Rep Max) using Epley Formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Calculates total volume (weight * reps across all sets)
 */
export function calculateVolume(sets: WorkoutSet[]): number {
  return sets.reduce((acc, set) => acc + (set.weight * set.reps), 0);
}

/**
 * Gets max weight lifted in a workout session
 */
export function getMaxWeightInLog(sets: WorkoutSet[]): { maxWeight: number; reps: number } {
  if (!sets || sets.length === 0) return { maxWeight: 0, reps: 0 };
  let maxWeight = 0;
  let repsAtMax = 0;
  
  for (const set of sets) {
    if (set.weight > maxWeight) {
      maxWeight = set.weight;
      repsAtMax = set.reps;
    }
  }
  return { maxWeight, reps: repsAtMax };
}

/**
 * Plate calculator for home gym bar
 * Given target weight and bar weight, returns plates needed FOR ONE SIDE of the bar.
 */
export interface PlateCount {
  weight: number;
  count: number; // per side
  color: string;
}

const DEFAULT_PLATE_COLORS: Record<number, string> = {
  25: 'bg-red-600 text-white border-red-700',
  20: 'bg-blue-600 text-white border-blue-700',
  15: 'bg-amber-500 text-black border-amber-600',
  10: 'bg-emerald-600 text-white border-emerald-700',
  5: 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-300 dark:text-zinc-900',
  2.5: 'bg-zinc-800 text-zinc-100 border-zinc-900 dark:bg-zinc-700',
  1.25: 'bg-zinc-500 text-white border-zinc-600',
};

export function calculatePlates(
  targetWeight: number, 
  barWeight: number = 20, 
  availablePlates: number[] = [25, 20, 15, 10, 5, 2.5, 1.25]
): {
  platesPerSide: PlateCount[];
  totalActualWeight: number;
  remainder: number;
} {
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);
  const weightPerSide = (targetWeight - barWeight) / 2;
  
  if (weightPerSide <= 0) {
    return { platesPerSide: [], totalActualWeight: barWeight, remainder: 0 };
  }

  const platesPerSide: PlateCount[] = [];
  let currentWeight = weightPerSide;

  for (const plate of sortedPlates) {
    const count = Math.floor(currentWeight / plate);
    if (count > 0) {
      platesPerSide.push({
        weight: plate,
        count,
        color: DEFAULT_PLATE_COLORS[plate] || 'bg-zinc-600 text-white border-zinc-700'
      });
      currentWeight -= count * plate;
    }
  }

  // Clean precision errors
  const remainder = Math.round(currentWeight * 100) / 100;
  const actualWeightPerSide = weightPerSide - remainder;
  const totalActualWeight = barWeight + (actualWeightPerSide * 2);

  return {
    platesPerSide,
    totalActualWeight,
    remainder
  };
}

/**
 * Format ISO date string into readable Spanish string
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hoy';
  if (isYesterday) return 'Ayer';

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get Personal Records for a friend across all exercises
 */
export function getFriendPRs(logs: WorkoutLog[], friendId: string): Record<string, PersonalRecord> {
  const friendLogs = logs.filter(l => l.friendId === friendId);
  const prs: Record<string, PersonalRecord> = {};

  for (const log of friendLogs) {
    const { maxWeight, reps } = getMaxWeightInLog(log.sets);
    const est1RM = calculate1RM(maxWeight, reps);

    if (!prs[log.exerciseId] || maxWeight > prs[log.exerciseId].maxWeight) {
      prs[log.exerciseId] = {
        friendId,
        exerciseId: log.exerciseId,
        maxWeight,
        max1RM: est1RM,
        repsAtMax: reps,
        date: log.date
      };
    }
  }

  return prs;
}

/**
 * Checks if a new log set represents a new Personal Record for that friend & exercise,
 * within the valid +20 kg ceiling.
 */
export function checkIsPR(logs: WorkoutLog[], friendId: string, exerciseId: string, sets: WorkoutSet[]): boolean {
  const { maxWeight } = getMaxWeightInLog(sets);
  if (maxWeight <= 0) return false;

  const currentPR = getAthleteCurrentPR(logs, friendId, exerciseId);
  const validation = validateSetAgainstPRCeiling(maxWeight, currentPR);
  if (!validation.isValid) {
    return false; // Cannot be a valid PR if it exceeds currentPR + 20 kg
  }

  const previousLogs = logs.filter(l => l.friendId === friendId && l.exerciseId === exerciseId);
  if (previousLogs.length === 0) return true; // First time performing exercise

  let previousMax = 0;
  for (const log of previousLogs) {
    const { maxWeight: prevMax } = getMaxWeightInLog(log.sets);
    if (prevMax > previousMax) previousMax = prevMax;
  }

  return maxWeight > previousMax;
}

export interface PRCeilingValidationResult {
  isValid: boolean;          // false if weight > currentPR + 20
  isWarning: boolean;        // true if jump is high (e.g. > +15 kg)
  reason?: string;           // Clear user-friendly explanation in Spanish
  currentPR: number;         // Current known PR
  maxAllowedWeight: number;  // currentPR + 20
  weight: number;
  diff: number;              // weight - currentPR
}

/**
 * Validates a set's weight against the athlete's current PR with a clean +20 kg ceiling.
 * Rule: if PR is 80 kg, they can lift 85, 90, 95 or up to 100 kg. Over 100 kg is considered exceeding the ceiling.
 */
export function validateSetAgainstPRCeiling(
  weight: number,
  currentPR: number
): PRCeilingValidationResult {
  const safeWeight = Number(weight) || 0;
  const safePR = Number(currentPR) || 0;

  if (safeWeight <= 0) {
    return {
      isValid: true,
      isWarning: false,
      currentPR: safePR,
      maxAllowedWeight: safePR > 0 ? safePR + 20 : 0,
      weight: safeWeight,
      diff: 0,
    };
  }

  // If athlete has no prior PR recorded for this exercise
  if (safePR <= 0) {
    const isSane = safeWeight <= 400;
    return {
      isValid: isSane,
      isWarning: !isSane,
      reason: !isSane ? 'El peso excede límites razonables (400 kg).' : undefined,
      currentPR: 0,
      maxAllowedWeight: 0,
      weight: safeWeight,
      diff: safeWeight,
    };
  }

  const maxAllowedWeight = safePR + 20;
  const diff = Math.round((safeWeight - safePR) * 10) / 10;

  // Exceeds +20 kg ceiling (e.g. PR is 80 kg, entered weight > 100 kg)
  if (safeWeight > maxAllowedWeight) {
    return {
      isValid: false,
      isWarning: false,
      reason: `Supera el techo permitido: Tu PR actual es de ${safePR} kg. Levantar ${safeWeight} kg (+${diff} kg) supera el techo máximo de +20 kg sobre tu récord (máximo permitido: ${maxAllowedWeight} kg).`,
      currentPR: safePR,
      maxAllowedWeight,
      weight: safeWeight,
      diff,
    };
  }

  // Warning when approaching the ceiling (+15 kg to +20 kg)
  if (diff > 15 && safeWeight <= maxAllowedWeight) {
    return {
      isValid: true,
      isWarning: true,
      reason: `Subida muy agresiva: +${diff} kg sobre tu PR de ${safePR} kg (cerca del techo de ${maxAllowedWeight} kg). Verifica que el peso sea correcto.`,
      currentPR: safePR,
      maxAllowedWeight,
      weight: safeWeight,
      diff,
    };
  }

  return {
    isValid: true,
    isWarning: false,
    currentPR: safePR,
    maxAllowedWeight,
    weight: safeWeight,
    diff,
  };
}

/**
 * Calculates the current known valid PR weight (kg) for an athlete on an exercise
 * based on all prior valid sets within the +20 kg ceiling rule.
 */
export function getAthleteCurrentPR(
  logs: WorkoutLog[],
  friendId: string,
  exerciseId: string,
  beforeDate?: string
): number {
  let relevantLogs = logs.filter((l) => l.friendId === friendId && l.exerciseId === exerciseId);
  if (beforeDate) {
    relevantLogs = relevantLogs.filter((l) => l.date < beforeDate);
  }
  if (relevantLogs.length === 0) return 0;

  // Sort chronologically ascending
  const sorted = [...relevantLogs].sort((a, b) => a.date.localeCompare(b.date));

  let currentPR = 0;

  for (const log of sorted) {
    for (const set of log.sets) {
      const w = Number(set.weight) || 0;
      if (w > 0) {
        if (currentPR === 0) {
          // First baseline PR
          currentPR = w;
        } else {
          // Check against currentPR + 20
          if (w <= currentPR + 20) {
            if (w > currentPR) {
              currentPR = w;
            }
          }
        }
      }
    }
  }

  return Math.round(currentPR * 10) / 10;
}

// Backwards-compatible aliases
export type MRValidationResult = PRCeilingValidationResult & {
  projected1RM?: number;
  estimatedMR?: number;
  percentageJump?: number;
  maxRecommendedReps?: number;
};

export function validateSetAgainstMR(
  weight: number,
  _reps: number,
  currentPR: number
): MRValidationResult {
  const res = validateSetAgainstPRCeiling(weight, currentPR);
  return {
    ...res,
    projected1RM: res.weight,
    estimatedMR: res.currentPR,
    percentageJump: res.currentPR > 0 ? Math.round((res.diff / res.currentPR) * 100) : 0,
  };
}

export const getAthleteEstimatedMR = getAthleteCurrentPR;

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
 * Checks if a new log set represents a new Personal Record for that friend & exercise
 */
export function checkIsPR(logs: WorkoutLog[], friendId: string, exerciseId: string, sets: WorkoutSet[]): boolean {
  const { maxWeight, reps } = getMaxWeightInLog(sets);
  if (maxWeight <= 0) return false;

  const currentMR = getAthleteEstimatedMR(logs, friendId, exerciseId);
  const validation = validateSetAgainstMR(maxWeight, reps, currentMR);
  if (!validation.isValid) {
    return false; // Absurd set cannot be a valid PR
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

export interface MRValidationResult {
  isValid: boolean;          // false if absurd/impossible
  isWarning: boolean;        // true if jump is high (+10-20%) but possible 1RM test
  reason?: string;           // Clear user-friendly explanation in Spanish
  projected1RM: number;      // Calculated 1RM from this set
  estimatedMR: number;       // Current known MR for this exercise
  percentageJump: number;    // % change compared to estimated MR
  maxRecommendedReps?: number;
}

/**
 * Validates a set's weight and reps against an athlete's estimated MR (1RM ceiling).
 * Protects against absurd/impossible records (e.g. MR 90 kg and registering 100 kg x 7 reps).
 */
export function validateSetAgainstMR(
  weight: number,
  reps: number,
  estimatedMR: number
): MRValidationResult {
  if (!weight || weight <= 0 || !reps || reps <= 0) {
    return {
      isValid: true,
      isWarning: false,
      projected1RM: 0,
      estimatedMR,
      percentageJump: 0,
    };
  }

  const projected1RM = calculate1RM(weight, reps);

  // If athlete has no prior MR, initial set is valid (within sane human boundaries)
  if (!estimatedMR || estimatedMR <= 0) {
    const isSane = weight <= 450 && reps <= 50;
    return {
      isValid: isSane,
      isWarning: !isSane,
      reason: !isSane ? 'El peso o repeticiones exceden los límites fisiológicos normales.' : undefined,
      projected1RM,
      estimatedMR: 0,
      percentageJump: 0,
    };
  }

  const percentageJump = Math.round(((projected1RM - estimatedMR) / estimatedMR) * 100);

  // Case 1 (User's explicit example):
  // Weight is heavier than prior MR and reps >= 3 (e.g. 100 kg x 7 reps when MR is 90 kg)
  if (weight > estimatedMR && reps >= 3) {
    return {
      isValid: false,
      isWarning: false,
      reason: `Registro inverosímil: Tu MR previo estimado es de ${estimatedMR} kg. No es fisiológicamente factible levantar ${weight} kg por ${reps} reps (1RM proyectado: ${projected1RM} kg, salto de +${percentageJump}%).`,
      projected1RM,
      estimatedMR,
      percentageJump,
      maxRecommendedReps: weight > estimatedMR * 1.05 ? 1 : 2,
    };
  }

  // Case 2: Projected 1RM jumps by more than 20% in a single session
  if (projected1RM > estimatedMR * 1.20) {
    return {
      isValid: false,
      isWarning: false,
      reason: `Salto inverosímil: Proyecta un 1RM de ${projected1RM} kg (+${percentageJump}% sobre tu MR de ${estimatedMR} kg). El techo fisiológico creíble por sesión es de ~15%.`,
      projected1RM,
      estimatedMR,
      percentageJump,
    };
  }

  // Case 3: Weight is near MR (>= 95%) but performed for 5 or more reps
  if (weight >= estimatedMR * 0.95 && reps >= 5) {
    return {
      isValid: false,
      isWarning: false,
      reason: `Inverosímil: Levantar ${weight} kg (~${Math.round((weight / estimatedMR) * 100)}% de tu MR de ${estimatedMR} kg) para ${reps} reps supera el techo de tu repetición máxima (1RM proyectado: ${projected1RM} kg).`,
      projected1RM,
      estimatedMR,
      percentageJump,
    };
  }

  // Case 4: Warning range (10% to 20% jump, or new weight PR with 2 reps)
  if (projected1RM > estimatedMR * 1.10 || (weight > estimatedMR && reps === 2)) {
    return {
      isValid: true,
      isWarning: true,
      reason: `Progresión muy agresiva: Proyecta ${projected1RM} kg (+${percentageJump}% sobre tu MR de ${estimatedMR} kg). Verifica que no sea un error de tipeo.`,
      projected1RM,
      estimatedMR,
      percentageJump,
    };
  }

  return {
    isValid: true,
    isWarning: false,
    projected1RM,
    estimatedMR,
    percentageJump,
  };
}

/**
 * Calculates the current known estimated MR (1RM / Rep Max ceiling) for an athlete on an exercise
 * based on all prior valid sets.
 */
export function getAthleteEstimatedMR(
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

  let currentMR = 0;

  for (const log of sorted) {
    for (const set of log.sets) {
      if (set.weight > 0 && set.reps > 0) {
        const est = calculate1RM(set.weight, set.reps);
        if (currentMR === 0) {
          // First baseline record
          currentMR = est;
        } else {
          // Validate set against previous MR ceiling
          const val = validateSetAgainstMR(set.weight, set.reps, currentMR);
          if (val.isValid && est > currentMR) {
            currentMR = est;
          }
        }
      }
    }
  }

  return Math.round(currentMR * 10) / 10;
}

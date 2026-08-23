export type Unit = 'kg' | 'lbs';

export type AppTab = 'logger' | 'dashboard' | 'charts' | 'exercises' | 'history' | 'calculator' | 'settings';

export type Equipment = 'Barra' | 'Mancuernas' | 'Polea' | 'Corporal' | 'Banca' | 'Otro';

export type MuscleGroup = 
  | 'Pecho' 
  | 'Espalda' 
  | 'Piernas' 
  | 'Hombros' 
  | 'Brazos' 
  | 'Core';

export interface Friend {
  id: string;
  name: string;
  avatar: string; // emoji or initials
  color: string;  // accent color hex
  joinedDate: string;
  pin?: string;   // access pin/password for login (defaults to '1234')
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  equipment: Equipment;
  description?: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

export interface WorkoutLog {
  id: string;
  friendId: string;
  exerciseId: string;
  date: string; // ISO string YYYY-MM-DD
  sets: WorkoutSet[];
  notes?: string;
  isPR?: boolean;
}

export interface PersonalRecord {
  friendId: string;
  exerciseId: string;
  maxWeight: number;
  max1RM: number;
  repsAtMax: number;
  date: string;
}

export interface PlateConfig {
  barWeight: number;
  targetWeight: number;
  availablePlates: number[]; // e.g. [20, 15, 10, 5, 2.5, 1.25]
}

export interface SessionExerciseItem {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface ActiveWorkoutSession {
  id: string;
  date: string;
  startTime: number;
  exercises: SessionExerciseItem[];
}

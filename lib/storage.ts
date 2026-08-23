import { Friend, Exercise, WorkoutLog } from '@/types/gym';

export const INITIAL_FRIENDS: Friend[] = [];

export const INITIAL_EXERCISES: Exercise[] = [
  { id: 'e1', name: 'Press de Banca con Barra', category: 'Pecho', equipment: 'Barra', description: 'Ejercicio rey de empuje para pectoral mayor.' },
  { id: 'e2', name: 'Press Inclinado con Mancuernas', category: 'Pecho', equipment: 'Mancuernas', description: 'Enfoque en la porción clavicular del pectoral.' },
  { id: 'e3', name: 'Sentadilla Trasera con Barra', category: 'Piernas', equipment: 'Barra', description: 'Ejercicio compuesto fundamental para cuadríceps y glúteos.' },
  { id: 'e4', name: 'Peso Muerto Rumano', category: 'Piernas', equipment: 'Barra', description: 'Trabajo intenso de isquiotibiales y glúteos.' },
  { id: 'e5', name: 'Press Militar con Barra', category: 'Hombros', equipment: 'Barra', description: 'Fuerza vertical de hombros y tríceps.' },
  { id: 'e6', name: 'Dominadas Lastradas', category: 'Espalda', equipment: 'Corporal', description: 'Tracción vertical para dorsal ancho.' },
  { id: 'e7', name: 'Remo con Barra', category: 'Espalda', equipment: 'Barra', description: 'Construcción de grosor de espalda.' },
  { id: 'e8', name: 'Curl de Bíceps con Barra EZ', category: 'Brazos', equipment: 'Barra', description: 'Aislamiento de bíceps.' },
  { id: 'e9', name: 'Fondos en Paralelas (Tríceps)', category: 'Brazos', equipment: 'Corporal', description: 'Empuje con peso corporal o lastre para tríceps y pecho.' },
  { id: 'e10', name: 'Elevación de Piernas Colgado', category: 'Core', equipment: 'Corporal', description: 'Fortalecimiento de abdomen bajo y flexores de cadera.' },
];

export const INITIAL_LOGS: WorkoutLog[] = [];

const KEYS = {
  FRIENDS: 'gym_tracker_friends_v3',
  EXERCISES: 'gym_tracker_exercises_v3',
  LOGS: 'gym_tracker_logs_v3',
  ACTIVE_FRIEND: 'gym_tracker_active_friend_v3',
};

export function getStoredFriends(): Friend[] {
  if (typeof window === 'undefined') return INITIAL_FRIENDS;
  try {
    const data = localStorage.getItem(KEYS.FRIENDS);
    if (!data) {
      localStorage.setItem(KEYS.FRIENDS, JSON.stringify(INITIAL_FRIENDS));
      return INITIAL_FRIENDS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading friends from localStorage:', e);
    return INITIAL_FRIENDS;
  }
}

export function saveFriends(friends: Friend[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.FRIENDS, JSON.stringify(friends));
}

export function getStoredExercises(): Exercise[] {
  if (typeof window === 'undefined') return INITIAL_EXERCISES;
  try {
    const data = localStorage.getItem(KEYS.EXERCISES);
    if (!data) {
      localStorage.setItem(KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES));
      return INITIAL_EXERCISES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading exercises from localStorage:', e);
    return INITIAL_EXERCISES;
  }
}

export function saveExercises(exercises: Exercise[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
}

export function getStoredLogs(): WorkoutLog[] {
  if (typeof window === 'undefined') return INITIAL_LOGS;
  try {
    const data = localStorage.getItem(KEYS.LOGS);
    if (!data) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading logs from localStorage:', e);
    return INITIAL_LOGS;
  }
}

export function saveLogs(logs: WorkoutLog[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
}

export function getStoredActiveFriendId(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(KEYS.ACTIVE_FRIEND) || '';
  } catch {
    return '';
  }
}

export function saveActiveFriendId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.ACTIVE_FRIEND, id);
}

export function resetToDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.FRIENDS, JSON.stringify(INITIAL_FRIENDS));
  localStorage.setItem(KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES));
  localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  localStorage.setItem(KEYS.ACTIVE_FRIEND, '');
}

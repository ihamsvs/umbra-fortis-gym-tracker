import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import {
  INITIAL_FRIENDS,
  INITIAL_EXERCISES,
  INITIAL_LOGS,
  getStoredFriends,
  saveFriends,
  getStoredExercises,
  saveExercises,
  getStoredLogs,
  saveLogs,
  getStoredActiveFriendId,
  saveActiveFriendId,
  resetToDefaults,
} from './storage';

export interface GymState {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  activeFriendId: string;
}

const DEFAULT_STATE: GymState = {
  friends: INITIAL_FRIENDS,
  exercises: INITIAL_EXERCISES,
  logs: INITIAL_LOGS,
  activeFriendId: '',
};

let hydrated = false;
let state: GymState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  const friends = getStoredFriends();
  let activeFriendId = getStoredActiveFriendId();
  if (!activeFriendId && friends.length > 0) {
    activeFriendId = friends[0].id;
  }
  state = {
    friends,
    exercises: getStoredExercises(),
    logs: getStoredLogs(),
    activeFriendId,
  };
  notify();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): GymState {
  return state;
}

export function getServerSnapshot(): GymState {
  return DEFAULT_STATE;
}

// ---- Mutations ----

export function addFriend(friend: Friend) {
  state = { ...state, friends: [...state.friends, friend], activeFriendId: friend.id };
  saveFriends(state.friends);
  saveActiveFriendId(state.activeFriendId);
  notify();
}

export function selectFriend(id: string) {
  state = { ...state, activeFriendId: id };
  saveActiveFriendId(id);
  notify();
}

export function deleteFriend(friendId: string) {
  const friends = state.friends.filter((f) => f.id !== friendId);
  let activeFriendId = state.activeFriendId;
  if (activeFriendId === friendId) {
    activeFriendId = friends[0]?.id || '';
  }
  state = {
    ...state,
    friends,
    activeFriendId,
    logs: state.logs.filter((l) => l.friendId !== friendId),
  };
  saveFriends(state.friends);
  saveLogs(state.logs);
  saveActiveFriendId(state.activeFriendId);
  notify();
}

export function addExercise(exercise: Exercise) {
  state = { ...state, exercises: [...state.exercises, exercise] };
  saveExercises(state.exercises);
  notify();
}

export function deleteExercise(exerciseId: string) {
  state = { ...state, exercises: state.exercises.filter((e) => e.id !== exerciseId) };
  saveExercises(state.exercises);
  notify();
}

export function addLog(log: WorkoutLog) {
  state = { ...state, logs: [log, ...state.logs] };
  saveLogs(state.logs);
  notify();
}

export function deleteLog(logId: string) {
  state = { ...state, logs: state.logs.filter((l) => l.id !== logId) };
  saveLogs(state.logs);
  notify();
}

export function deleteAllLogs() {
  state = { ...state, logs: [] };
  saveLogs(state.logs);
  notify();
}

export function resetAll() {
  resetToDefaults();
  state = { ...DEFAULT_STATE };
  notify();
}

export function importState(next: GymState) {
  state = { ...next };
  saveFriends(state.friends);
  saveExercises(state.exercises);
  saveLogs(state.logs);
  saveActiveFriendId(state.activeFriendId);
  notify();
}

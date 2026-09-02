import { getFriendsAction } from '@/actions/friends';
import { getExercisesAction, addExerciseAction } from '@/actions/exercises';
import { getWorkoutLogsAction } from '@/actions/workouts';
import { importState, getSnapshot } from './gymStore';
import { INITIAL_EXERCISES } from './storage';
import { Exercise } from '@/types/gym';

let syncing = false;

function mergeExercisesList(...lists: Exercise[][]): Exercise[] {
  const map = new Map<string, Exercise>();
  for (const list of lists) {
    if (!list) continue;
    for (const ex of list) {
      if (ex && ex.id) {
        map.set(ex.id, ex);
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function syncWithSupabase() {
  if (syncing || typeof window === 'undefined') return;
  syncing = true;

  try {
    const currentState = getSnapshot();

    // Fetch from Supabase
    const [friendsRes, exercisesRes, logsRes] = await Promise.all([
      getFriendsAction(),
      getExercisesAction(),
      getWorkoutLogsAction(),
    ]);

    // If Supabase not configured or failed, exit gracefully
    if (!friendsRes.isConfigured) {
      syncing = false;
      return;
    }

    const remoteFriends = friendsRes.success && friendsRes.data ? friendsRes.data : [];
    const remoteExercises = exercisesRes.success && exercisesRes.data ? exercisesRes.data : [];
    const remoteLogs = logsRes.success && logsRes.data ? logsRes.data : [];

    // Combine all exercises so no exercise is lost
    const combinedExercises = mergeExercisesList(
      INITIAL_EXERCISES,
      currentState.exercises,
      remoteExercises
    );

    // If remote exercises is empty, seed exercise catalog to Supabase
    if (remoteExercises.length === 0 && combinedExercises.length > 0) {
      for (const ex of combinedExercises) {
        await addExerciseAction(ex).catch(() => {});
      }
    }

    // Determine active friend
    let nextActiveFriendId = currentState.activeFriendId;
    if (remoteFriends.length > 0) {
      const exists = remoteFriends.some((f) => f.id === nextActiveFriendId);
      if (!exists) {
        nextActiveFriendId = remoteFriends[0].id;
      }
    } else {
      nextActiveFriendId = '';
    }

    // Sync remote data into local state
    importState({
      friends: remoteFriends,
      exercises: combinedExercises,
      logs: remoteLogs,
      activeFriendId: nextActiveFriendId,
    });
  } catch (err) {
    console.warn('Supabase sync warning:', err);
  } finally {
    syncing = false;
  }
}

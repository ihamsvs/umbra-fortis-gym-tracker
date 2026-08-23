'use server';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { WorkoutLog } from '@/types/gym';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  isConfigured: boolean;
}

/**
 * Obtener todos los registros de entrenamiento desde Supabase
 */
export async function getWorkoutLogsAction(): Promise<ActionResult<WorkoutLog[]>> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase no está configurado. Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local',
      isConfigured: false,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    const mapped: WorkoutLog[] = (data || []).map((row) => ({
      id: row.id,
      friendId: row.friend_id,
      exerciseId: row.exercise_id,
      date: row.date,
      sets: row.sets || [],
      notes: row.notes || undefined,
      isPR: row.is_pr,
    }));

    return { success: true, data: mapped, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al obtener logs';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Guardar un nuevo registro de entrenamiento en Supabase
 */
export async function addWorkoutLogAction(log: WorkoutLog): Promise<ActionResult<WorkoutLog>> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase no configurado en variables de entorno',
      isConfigured: false,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('workout_logs').insert([
      {
        id: log.id,
        friend_id: log.friendId,
        exercise_id: log.exerciseId,
        date: log.date,
        sets: log.sets,
        notes: log.notes || null,
        is_pr: Boolean(log.isPR),
      },
    ]);

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: log, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar log en Supabase';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Eliminar un registro de entrenamiento por su ID
 */
export async function deleteWorkoutLogAction(logId: string): Promise<ActionResult<string>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase no configurado', isConfigured: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('workout_logs').delete().eq('id', logId);

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: logId, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar log';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Eliminar todos los registros de entrenamiento
 */
export async function deleteAllWorkoutLogsAction(): Promise<ActionResult<boolean>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase no configurado', isConfigured: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('workout_logs').delete().neq('id', '');

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: true, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar todos los logs';
    return { success: false, error: message, isConfigured: true };
  }
}

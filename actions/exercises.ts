'use server';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Exercise } from '@/types/gym';
import { ActionResult } from './workouts';

/**
 * Obtener todos los ejercicios desde Supabase
 */
export async function getExercisesAction(): Promise<ActionResult<Exercise[]>> {
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
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    const mapped: Exercise[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      equipment: row.equipment,
      description: row.description || undefined,
      isCustom: row.is_custom,
    }));

    return { success: true, data: mapped, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener ejercicios';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Guardar o crear un nuevo ejercicio en Supabase
 */
export async function addExerciseAction(exercise: Exercise): Promise<ActionResult<Exercise>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase no configurado', isConfigured: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('exercises').insert([
      {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        description: exercise.description || null,
        is_custom: Boolean(exercise.isCustom),
      },
    ]);

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: exercise, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar ejercicio';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Eliminar un ejercicio por ID
 */
export async function deleteExerciseAction(exerciseId: string): Promise<ActionResult<string>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase no configurado', isConfigured: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: exerciseId, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar ejercicio';
    return { success: false, error: message, isConfigured: true };
  }
}

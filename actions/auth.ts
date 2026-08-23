'use server';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Friend } from '@/types/gym';
import { ActionResult } from './workouts';

export interface LoginResult {
  success: boolean;
  user?: Friend;
  error?: string;
  isConfigured: boolean;
}

/**
 * Validar credenciales de acceso (ID de levantador y PIN) contra Supabase
 */
export async function loginAction({
  friendId,
  pin,
}: {
  friendId: string;
  pin: string;
}): Promise<LoginResult> {
  if (!friendId) {
    return { success: false, error: 'Debes seleccionar o ingresar un usuario', isConfigured: true };
  }

  // If Supabase is not configured, allow local validation
  if (!isSupabaseConfigured) {
    return {
      success: true,
      user: {
        id: friendId,
        name: 'Usuario Local',
        avatar: 'UL',
        color: '#facc15',
        joinedDate: new Date().toISOString().split('T')[0],
      },
      isConfigured: false,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('id', friendId)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    if (!data) {
      return {
        success: false,
        error: 'Usuario no encontrado en la base de datos de Supabase',
        isConfigured: true,
      };
    }

    // Validate PIN / Password
    const expectedPin = data.pin ? String(data.pin).trim() : null;
    const providedPin = String(pin || '').trim();

    if (expectedPin && expectedPin !== providedPin) {
      return {
        success: false,
        error: 'Contraseña o PIN incorrecto.',
        isConfigured: true,
      };
    }

    const user: Friend = {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      color: data.color,
      joinedDate: data.joined_date,
      pin: data.pin || '1234',
    };

    return { success: true, user, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado durante el inicio de sesión';
    return { success: false, error: message, isConfigured: true };
  }
}

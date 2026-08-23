'use server';

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Friend } from '@/types/gym';
import { ActionResult } from './workouts';

/**
 * Obtener la lista de miembros / amigos desde Supabase
 */
export async function getFriendsAction(): Promise<ActionResult<Friend[]>> {
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
      .from('friends')
      .select('*')
      .order('joined_date', { ascending: true });

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    const mapped: Friend[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      color: row.color,
      joinedDate: row.joined_date,
      pin: row.pin || '1234',
    }));

    return { success: true, data: mapped, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener amigos';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Agregar un nuevo miembro / amigo en Supabase
 */
export async function addFriendAction(friend: Friend): Promise<ActionResult<Friend>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase no configurado', isConfigured: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('friends').insert([
      {
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar,
        color: friend.color,
        pin: friend.pin || '1234',
        joined_date: friend.joinedDate,
      },
    ]);

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: friend, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al guardar amigo';
    return { success: false, error: message, isConfigured: true };
  }
}

/**
 * Eliminar un amigo / miembro por ID
 */
export async function deleteFriendAction(friendId: string): Promise<ActionResult<string>> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase no configurado', isConfigured: false };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no disponible', isConfigured: false };
  }

  try {
    const { error } = await supabase.from('friends').delete().eq('id', friendId);

    if (error) {
      return { success: false, error: error.message, isConfigured: true };
    }

    return { success: true, data: friendId, isConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar amigo';
    return { success: false, error: message, isConfigured: true };
  }
}

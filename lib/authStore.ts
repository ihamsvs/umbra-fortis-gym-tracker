import { Friend } from '@/types/gym';

const AUTH_KEY = 'gym_tracker_auth_user_v2';

export function getStoredAuthUser(): Friend | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading auth user:', e);
    return null;
  }
}

export function saveAuthUser(user: Friend) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving auth user:', e);
  }
}

export function clearAuthUser() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error('Error clearing auth user:', e);
  }
}

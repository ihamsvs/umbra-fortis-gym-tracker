import { CharacterTheme, CHARACTERS } from '@/lib/characters';

const STORAGE_KEY = 'umbra_fortis_character_v1';

let active: CharacterTheme = CHARACTERS[0];
const listeners = new Set<() => void>();

function applyCssVars(theme: CharacterTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement.style;
  root.setProperty('--accent', theme.primary);
  root.setProperty('--accent-secondary', theme.secondary);
  root.setProperty('--accent-glow', theme.glow);
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CharacterTheme {
  return active;
}

export function getServerSnapshot(): CharacterTheme {
  return CHARACTERS[0];
}

export function setTheme(id: string): void {
  const theme = CHARACTERS.find((c) => c.id === id);
  if (!theme) return;
  active = theme;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }
  applyCssVars(theme);
  emit();
}

export function hydrateTheme(): void {
  if (typeof window === 'undefined') return;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const theme = CHARACTERS.find((c) => c.id === stored) || CHARACTERS[0];
  active = theme;
  applyCssVars(theme);
  emit();
}

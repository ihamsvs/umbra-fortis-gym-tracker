export type CharacterRole = 'hero' | 'villain';

export interface CharacterTheme {
  id: string;
  name: string;
  role: CharacterRole;
  primary: string;
  secondary: string;
  glow: string;
}

export const CHARACTERS: CharacterTheme[] = [
  // Héroes
  { id: 'batman', name: 'Batman', role: 'hero', primary: '#FACC15', secondary: '#F59E0B', glow: 'rgba(250, 204, 21, 0.07)' },
  { id: 'nightwing', name: 'Nightwing', role: 'hero', primary: '#38BDF8', secondary: '#0284C7', glow: 'rgba(56, 189, 248, 0.07)' },
  { id: 'robin', name: 'Robin', role: 'hero', primary: '#22C55E', secondary: '#16A34A', glow: 'rgba(34, 197, 94, 0.07)' },
  { id: 'batgirl', name: 'Batgirl', role: 'hero', primary: '#EF4444', secondary: '#DC2626', glow: 'rgba(239, 68, 68, 0.07)' },
  // Villanos
  { id: 'joker', name: 'Joker', role: 'villain', primary: '#A3E635', secondary: '#A855F7', glow: 'rgba(163, 230, 53, 0.07)' },
  { id: 'bane', name: 'Bane', role: 'villain', primary: '#7C3AED', secondary: '#5B21B6', glow: 'rgba(124, 58, 237, 0.07)' },
  { id: 'harley', name: 'Harley Quinn', role: 'villain', primary: '#EC4899', secondary: '#DB2777', glow: 'rgba(236, 72, 153, 0.07)' },
  { id: 'riddler', name: 'Acertijo', role: 'villain', primary: '#06B6D4', secondary: '#0891B2', glow: 'rgba(6, 182, 212, 0.07)' },
];

export function getCharacter(id: string): CharacterTheme {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

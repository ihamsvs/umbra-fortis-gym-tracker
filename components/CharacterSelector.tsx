'use client';

import React from 'react';
import { useSyncExternalStore } from 'react';
import { CHARACTERS, CharacterTheme } from '@/lib/characters';
import { subscribe, getSnapshot, getServerSnapshot, setTheme } from '@/lib/themeStore';
import { BatIcon } from '@/components/BatIcon';
import { Check, ShieldCheck, Skull } from 'lucide-react';

function CharacterCard({
  character,
  isActive,
  onSelect,
}: {
  character: CharacterTheme;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
        isActive
          ? 'bg-zinc-800 border-white/40 shadow-lg'
          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
      }`}
    >
      <span
        className="w-9 h-9 rounded-xl border-2 border-black/20 shadow-inner flex items-center justify-center shrink-0"
        style={{ backgroundColor: character.primary }}
      >
        {character.role === 'hero' ? (
          <ShieldCheck className="w-4 h-4 text-zinc-950" />
        ) : (
          <Skull className="w-4 h-4 text-zinc-950" />
        )}
      </span>
      <div className="min-w-0">
        <span className="block text-sm font-extrabold text-white truncate">{character.name}</span>
        <span className="block text-[10px] font-mono text-zinc-400">{character.primary}</span>
      </div>
      {isActive && (
        <span
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: character.primary }}
        >
          <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />
        </span>
      )}
    </button>
  );
}

export function CharacterSelector() {
  const activeTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const heroes = CHARACTERS.filter((c) => c.role === 'hero');
  const villains = CHARACTERS.filter((c) => c.role === 'villain');

  return (
    <div className="space-y-5">
      <div>
        <h4 className="flex items-center gap-2 text-xs font-extrabold text-zinc-300 uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" style={{ color: activeTheme.primary }} />
          Héroes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {heroes.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isActive={activeTheme.id === character.id}
              onSelect={() => setTheme(character.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-2 text-xs font-extrabold text-zinc-300 uppercase tracking-wider mb-3">
          <Skull className="w-4 h-4" style={{ color: activeTheme.primary }} />
          Villanos
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {villains.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isActive={activeTheme.id === character.id}
              onSelect={() => setTheme(character.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-950"
          style={{ backgroundColor: activeTheme.primary }}
        >
          <BatIcon className="w-5 h-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-white">
            Tema activo: {activeTheme.name}
          </p>
          <p className="text-[11px] text-zinc-400">
            Elige un personaje y todo el gym toma sus colores.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Friend } from '@/types/gym';
import { X, UserPlus, Sparkles } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { FriendAvatar } from '@/components/FriendAvatar';
import { addFriendAction } from '@/actions/friends';

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friend: Friend) => void;
}

const COLOR_OPTIONS = ['#facc15', '#38bdf8', '#a78bfa', '#fb7185', '#34d399', '#f59e0b', '#818cf8', '#2dd4bf'];

export function FriendModal({ isOpen, onClose, onAddFriend }: FriendModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#facc15');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newFriend: Friend = {
      id: 'f_' + Date.now(),
      name: name.trim(),
      avatar: getInitials(name),
      color,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onAddFriend(newFriend);
    addFriendAction(newFriend).catch(() => {});
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl relative text-zinc-100 scrollbar-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Nuevo Levantador</h2>
            <p className="text-xs text-zinc-400">Agrega a un amigo para seguir sus progresos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Nombre o Apodo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Nico, Dani, Flaco..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent focus:ring-1 focus:ring-accent text-sm font-semibold text-white placeholder-zinc-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Vista previa del monograma
            </label>
            <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <FriendAvatar
                friend={{ id: 'preview', name: name || 'UM', avatar: getInitials(name || 'Umbra'), color, joinedDate: '' }}
                size="lg"
              />
              <p className="text-xs text-zinc-400">
                El monograma se genera automáticamente a partir del nombre.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Color Distintivo
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent-soft text-zinc-950 font-bold text-sm shadow-lg shadow-accent/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Guardar Levantador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

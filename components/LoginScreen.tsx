'use client';

import React, { useState } from 'react';
import { Friend } from '@/types/gym';
import { loginAction } from '@/actions/auth';
import { BatIcon } from './BatIcon';
import { FriendAvatar } from './FriendAvatar';
import { Lock, Flame, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, RefreshCw, UserCheck } from 'lucide-react';

interface LoginScreenProps {
  friends: Friend[];
  onLoginSuccess: (user: Friend) => void;
  onRefreshFromSupabase?: () => void;
}

export function LoginScreen({ friends, onLoginSuccess, onRefreshFromSupabase }: LoginScreenProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id || '');
  const [manualFriendId, setManualFriendId] = useState<string>('');
  const [pin, setPin] = useState<string>('1234');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeId = selectedFriendId || manualFriendId;
  const selectedFriend = friends.find((f) => f.id === selectedFriendId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetId = activeId.trim();
    if (!targetId) {
      setError('Por favor selecciona o ingresa tu usuario.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAction({ friendId: targetId, pin: pin.trim() });
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Credenciales inválidas. Verifica tu PIN.');
      }
    } catch {
      setError('Error al conectar con el servidor de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accent-secondary text-zinc-950 shadow-2xl shadow-accent/25 border border-white/20">
            <BatIcon className="w-12 h-12" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 inline-block mb-1.5">
              Portal de Atletas
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Umbra Fortis
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Fuerza en la sombra — Acceso exclusivo para el equipo
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Iniciar Sesión
              </h2>
            </div>
            {onRefreshFromSupabase && (
              <button
                type="button"
                onClick={onRefreshFromSupabase}
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-accent transition-colors"
                title="Recargar usuarios desde Supabase"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sincronizar</span>
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                1. Selecciona tu Perfil
              </label>

              {friends.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                  {friends.map((f) => {
                    const isSelected = f.id === selectedFriendId;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => {
                          setSelectedFriendId(f.id);
                          setManualFriendId('');
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                          isSelected
                            ? 'bg-accent/15 border-accent text-white shadow-lg shadow-accent/10'
                            : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FriendAvatar friend={f} size="md" />
                          <div>
                            <span className="text-sm font-black text-white block">{f.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {f.id}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-accent text-zinc-950 flex items-center justify-center shadow-md">
                            <UserCheck className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Ingresa tu ID de usuario (ej: u1 o tu nombre)"
                    value={manualFriendId}
                    onChange={(e) => setManualFriendId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    No se detectaron usuarios precargados. Ingresa el ID correspondiente al usuario creado en la tabla <code>friends</code> de Supabase.
                  </p>
                </div>
              )}
            </div>

            {/* PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent" /> 2. PIN / Contraseña
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Por defecto: 1234</span>
              </div>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  placeholder="Introduce tu PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm font-mono tracking-wider text-white placeholder-zinc-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !activeId}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-accent via-amber-400 to-accent-secondary text-zinc-950 font-black text-sm sm:text-base shadow-xl shadow-accent/20 hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                <>
                  <Flame className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    {selectedFriend ? `Acceder como ${selectedFriend.name}` : 'Acceder al Gimnasio'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Internal policy note */}
          <div className="pt-2 border-t border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-500 leading-relaxed flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent shrink-0" />
              <span>Las cuentas de atleta son creadas y gestionadas internamente en la base de datos de Supabase.</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

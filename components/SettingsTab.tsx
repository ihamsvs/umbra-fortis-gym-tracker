'use client';

import React, { useState } from 'react';
import { Friend, Exercise, WorkoutLog } from '@/types/gym';
import { Settings, Download, Upload, RefreshCcw, Users, Dumbbell, ClipboardList, Trash2, AlertTriangle, CheckCircle2, Lightbulb, LogOut } from 'lucide-react';
import { FriendAvatar } from '@/components/FriendAvatar';
import { CharacterSelector } from '@/components/CharacterSelector';

interface SettingsTabProps {
  friends: Friend[];
  exercises: Exercise[];
  logs: WorkoutLog[];
  onDeleteFriend: (friendId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onDeleteAllLogs: () => void;
  onResetAll: () => void;
  onLogout?: () => void;
}

export function SettingsTab({
  friends,
  exercises,
  logs,
  onDeleteFriend,
  onDeleteExercise,
  onDeleteAllLogs,
  onResetAll,
  onLogout,
}: SettingsTabProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleExport = () => {
    const data = {
      friends,
      exercises,
      logs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umbra-fortis-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados correctamente');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        // For simplicity, we only validate basic structure
        if (data.friends && data.exercises && data.logs) {
          // This handler is only attached via onImportData prop in parent
          window.dispatchEvent(new CustomEvent('gym-tracker:import', { detail: data }));
          showToast('Datos importados correctamente');
        } else {
          showToast('Archivo inválido');
        }
      } catch {
        showToast('Archivo inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmReset = () => {
    setConfirmAction(null);
    onResetAll();
    showToast('Se restablecieron los datos por defecto');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-accent text-zinc-950 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            Ajustes y Datos
          </h2>
          <p className="text-xs text-zinc-400">Gestión de amigos, ejercicios y respaldo de información</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-all"
          >
            <Download className="w-4 h-4 text-accent" />
            Exportar Datos
          </button>
          <label className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-blue-400" />
            Importar Datos
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* Personaje y Tema */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          Personaje y Tema
        </h3>
        <CharacterSelector />
      </div>

      {/* Data Counts */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-blue-400/10 text-blue-400 rounded-xl"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xl font-black text-white block">{friends.length}</span>
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Amigos</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl"><Dumbbell className="w-5 h-5" /></div>
          <div>
            <span className="text-xl font-black text-white block">{exercises.length}</span>
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Ejercicios</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-accent/10 text-accent rounded-xl"><ClipboardList className="w-5 h-5" /></div>
          <div>
            <span className="text-xl font-black text-white block">{logs.length}</span>
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Registros</span>
          </div>
        </div>
      </div>

      {/* Friends Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Amigos del Gym ({friends.length})
        </h3>
        <div className="space-y-2.5">
          {friends.length === 0 ? (
            <p className="text-xs text-zinc-500 py-3 text-center bg-zinc-950 rounded-2xl border border-zinc-800">
              No hay usuarios registrados aún en Supabase.
            </p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <FriendAvatar friend={friend} size="md" />
                  <div>
                    <span className="text-sm font-bold text-white">{friend.name}</span>
                    <span className="text-[11px] text-zinc-500 block">
                      {logs.filter((l) => l.friendId === friend.id).length} registros
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmAction(`friend:${friend.id}`)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <p className="text-[11px] text-zinc-500 mt-3 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-accent" />
          Agrega amigos desde el menú superior o el selector de levantadores.
        </p>
      </div>

      {/* Exercises Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-accent" />
          Ejercicios Creados ({exercises.filter((e) => e.isCustom).length})
        </h3>
        <div className="space-y-2.5">
          {exercises.filter((e) => e.isCustom).map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-sm font-bold text-white">{exercise.name}</span>
                <span className="text-[11px] text-zinc-500 block">[{exercise.category}] • {exercise.equipment}</span>
              </div>
              <button
                onClick={() => setConfirmAction(`exercise:${exercise.id}`)}
                className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {exercises.filter((e) => e.isCustom).length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              Aún no has creado ejercicios personalizados. Puedes hacerlo en la pestaña “Ejercicios”.
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-zinc-900 border border-red-500/20 rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-red-400 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Zona de Peligro
        </h3>
        <p className="text-xs text-zinc-400 mb-4">Estas acciones afectan todos los datos de la aplicación.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setConfirmAction('logs')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            Borrar Todos los Registros
          </button>
          <button
            onClick={() => setConfirmAction('reset')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-all"
          >
            <RefreshCcw className="w-4 h-4 text-accent" />
            Restablecer Datos por Defecto
          </button>
        </div>
      </div>

      {/* Sesión Activa */}
      {onLogout && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-400" />
              Sesión de Atleta
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cierra sesión si deseas cambiar de perfil en este dispositivo
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-bold transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 text-center space-y-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">¿Estás seguro?</h3>
            <p className="text-xs text-zinc-400">
              {confirmAction.startsWith('friend')
                ? 'Se eliminará este amigo y todos sus registros de entrenamiento.'
                : confirmAction.startsWith('exercise')
                ? 'Se eliminará este ejercicio de la biblioteca (no se borran los registros asociados).'
                : confirmAction === 'logs'
                ? 'Se eliminarán TODOS los registros de entrenamiento de todos los amigos.'
                : 'Se restablecerán todos los datos a los valores de fábrica.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const action = confirmAction;
                  setConfirmAction(null);
                  if (action.startsWith('friend')) {
                    onDeleteFriend(action.split(':')[1]);
                    showToast('Amigo eliminado');
                  } else if (action.startsWith('exercise')) {
                    onDeleteExercise(action.split(':')[1]);
                    showToast('Ejercicio eliminado');
                  } else if (action === 'logs') {
                    onDeleteAllLogs();
                    showToast('Todos los registros fueron borrados');
                  } else if (action === 'reset') {
                    confirmReset();
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

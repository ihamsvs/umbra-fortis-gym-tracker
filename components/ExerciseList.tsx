'use client';

import React, { useState } from 'react';
import { Exercise, MuscleGroup, Equipment } from '@/types/gym';
import { Dumbbell, Plus, Search, Sparkles, X, Star } from 'lucide-react';
import { addExerciseAction } from '@/actions/exercises';

interface ExerciseListProps {
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

export function ExerciseList({ exercises, onAddExercise }: ExerciseListProps) {
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'Todos'>('Todos');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New exercise form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MuscleGroup>('Pecho');
  const [newEquipment, setNewEquipment] = useState<Equipment>('Barra');
  const [newDescription, setNewDescription] = useState('');

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: Exercise = {
      id: 'ex_custom_' + Date.now(),
      name: newName.trim(),
      category: newCategory,
      equipment: newEquipment,
      description: newDescription.trim() || undefined,
      isCustom: true,
    };

    onAddExercise(created);
    addExerciseAction(created).catch(() => {});
    setNewName('');
    setNewDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-accent stroke-[2.5]" />
            Catálogo de Ejercicios
          </h2>
          <p className="text-xs text-zinc-400">Directorio de ejercicios disponibles para entrenamiento</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-zinc-950 font-extrabold text-xs shadow-lg shadow-accent/20 hover:bg-accent-soft transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Crear Ejercicio</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
              selectedCategory === 'Todos'
                ? 'bg-accent text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedCategory(group)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                selectedCategory === group
                  ? 'bg-accent text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 rounded-2xl shadow-md flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 uppercase tracking-wider">
                  {ex.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {ex.equipment}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white group-hover:text-accent transition-colors">
                {ex.name}
              </h3>

              {ex.description && (
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                  {ex.description}
                </p>
              )}
            </div>

            {ex.isCustom && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-3">
                <Star className="w-3 h-3" />
                Personalizado
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Custom Exercise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl relative text-zinc-100 scrollbar-none">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Nuevo Ejercicio</h2>
                <p className="text-xs text-zinc-400">Añade un ejercicio a la biblioteca del gym</p>
              </div>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Nombre del Ejercicio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Press Francés con Mancuerna"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-sm font-semibold text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Grupo Muscular
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MuscleGroup)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-semibold text-white outline-none"
                >
                  {MUSCLE_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Equipamiento
                </label>
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value as Equipment)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-semibold text-white outline-none"
                >
                  <option value="Barra">Barra</option>
                  <option value="Mancuernas">Mancuernas</option>
                  <option value="Polea">Polea</option>
                  <option value="Corporal">Peso Corporal</option>
                  <option value="Banca">Banca</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Descripción u Observación (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles técnicos de agarre o enfoque..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-accent text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent-soft text-zinc-950 font-extrabold text-sm shadow-lg shadow-accent/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Guardar Ejercicio</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

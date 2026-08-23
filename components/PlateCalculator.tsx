'use client';

import React, { useState } from 'react';
import { Calculator, RotateCcw, ChevronDown, ChevronUp, Scale, AlertTriangle } from 'lucide-react';
import { calculatePlates } from '@/lib/utils';

interface PlateCalculatorProps {
  barWeight: number;
  setBarWeight: (weight: number) => void;
  plateSizes: number[];
  setPlateSizes: (sizes: number[]) => void;
  onLogWeight: (targetWeight: number) => void;
}

const PLATE_OPTIONS = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

export function PlateCalculator({
  barWeight,
  setBarWeight,
  plateSizes,
  setPlateSizes,
  onLogWeight,
}: PlateCalculatorProps) {
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const result = calculatePlates(targetWeight, barWeight, plateSizes);

  // Preset weights for quick tap
  const presets = [60, 80, 100, 120, 140];

  const handleTogglePlate = (plate: number) => {
    if (plateSizes.includes(plate)) {
      setPlateSizes(plateSizes.filter((p) => p !== plate));
    } else {
      setPlateSizes([...plateSizes, plate].sort((a, b) => b - a));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            Calculadora de Discos
          </h2>
          <p className="text-xs text-zinc-400">Calcula exactamente qué discos cargar en la barra</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Input & Config */}
        <div className="space-y-6">
          
          {/* Target Weight Input */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Peso Objetivo (kg)
            </label>
            
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4">
              <button
                onClick={() => setTargetWeight(Math.max(barWeight + 2.5, targetWeight - 2.5))}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xl font-black flex items-center justify-center transition-all active:scale-90"
              >
                −
              </button>
              <input
                type="number"
                step="0.5"
                min="0"
                value={targetWeight}
                onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                className="w-32 sm:w-40 py-3 text-center bg-zinc-950 border border-zinc-800 rounded-2xl text-3xl font-black text-accent outline-none focus:border-accent"
              />
              <button
                onClick={() => setTargetWeight(targetWeight + 2.5)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-xl font-black flex items-center justify-center transition-all active:scale-90"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setTargetWeight(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    targetWeight === p
                      ? 'bg-accent text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {p} kg
                </button>
              ))}
            </div>
          </div>

          {/* Bar Weight Config */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-accent" />
                <span className="text-sm font-extrabold text-white">Peso de la Barra</span>
              </div>
              <span className="text-sm font-black text-accent">{barWeight} kg</span>
            </div>

            <div className="flex items-center gap-3">
              {[15, 20].map((bw) => (
                <button
                  key={bw}
                  onClick={() => setBarWeight(bw)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    barWeight === bw
                      ? 'bg-accent text-zinc-950 shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Barra {bw} kg
                </button>
              ))}
            </div>

            {/* Plate Sizes Toggle */}
            <div className="pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-zinc-300"
              >
                <span>Discos Disponibles ({plateSizes.length})</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {PLATE_OPTIONS.map((plate) => (
                    <button
                      key={plate}
                      onClick={() => handleTogglePlate(plate)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        plateSizes.includes(plate)
                          ? 'bg-accent/15 text-accent border-accent/40'
                          : 'bg-zinc-950 text-zinc-600 border-zinc-800 opacity-50'
                      }`}
                    >
                      {plate} kg
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Result */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-white">Carga de la Barra</h3>
            <button
              onClick={() => onLogWeight(targetWeight)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-zinc-950 text-xs font-bold hover:bg-accent-soft transition-all"
            >
              Usar en Anotar Peso →
            </button>
          </div>

          {/* Barbell Visual */}
          <div className="relative bg-zinc-950 rounded-2xl border border-zinc-800 p-6 flex flex-col items-center gap-4">
            
            {/* Weight display */}
            <div className="text-center">
              <span className="text-4xl font-black text-white">{result.totalActualWeight} <span className="text-sm text-accent font-bold">kg</span></span>
              {targetWeight !== result.totalActualWeight && (
                <p className="flex items-center justify-center gap-1 text-xs text-amber-400 mt-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  No se logra exactamente. Peso real: {result.totalActualWeight} kg
                </p>
              )}
            </div>

            {/* Barbell drawing */}
            <div className="w-full overflow-x-auto scrollbar-none">
              <div className="min-w-max mx-auto flex items-center justify-center gap-0">
                {/* Left side plates */}
                <div className="flex items-center justify-end gap-0.5">
                  {result.platesPerSide.map((plate) => (
                    <div
                      key={plate.weight}
                      className={`flex flex-col items-center rounded-lg border ${plate.color} px-1.5 sm:px-2 py-4 text-[10px] font-black`}
                    >
                      <span>{plate.weight}</span>
                      <span>×{plate.count}</span>
                    </div>
                  ))}
                </div>

                {/* Center bar */}
                <div className="h-3 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-full w-28 sm:w-40 shadow-inner flex items-center justify-center text-[10px] font-black text-zinc-800 shrink-0">
                  <span className="bg-zinc-300/60 px-2 rounded-full">BARRA {barWeight} kg</span>
                </div>

                {/* Right side plates */}
                <div className="flex items-center justify-start gap-0.5">
                  {result.platesPerSide.map((plate) => (
                    <div
                      key={plate.weight}
                      className={`flex flex-col items-center rounded-lg border ${plate.color} px-1.5 sm:px-2 py-4 text-[10px] font-black`}
                    >
                      <span>{plate.weight}</span>
                      <span>×{plate.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              Discos por lado: {result.platesPerSide.length > 0
                ? result.platesPerSide.map((p) => `${p.count} × ${p.weight} kg`).join(' + ')
                : 'Solo barra'}
            </p>

            {result.remainder > 0 && (
              <p className="text-[11px] text-amber-400/80 text-center">
                Queda sin cubrir: {result.remainder} kg por lado
              </p>
            )}
          </div>

          {/* Plate Inventory Summary */}
          <div className="mt-4 space-y-2">
            {result.platesPerSide.map((plate) => (
              <div key={plate.weight} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-4 rounded-md border ${plate.color}`}></span>
                  <span className="text-xs font-bold text-white">Discos de {plate.weight} kg</span>
                </div>
                <span className="text-sm font-black text-accent">
                  {plate.count} por lado
                  <span className="text-[10px] text-zinc-500 font-normal ml-1.5">
                    ({plate.count * 2} total)
                  </span>
                </span>
              </div>
            ))}

            {result.platesPerSide.length === 0 && (
              <div className="text-center text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 rounded-xl py-4">
                El peso objetivo es menor o igual al de la barra. No se necesitan discos.
              </div>
            )}
          </div>

          <button
            onClick={() => setTargetWeight(100)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </button>
        </div>

      </div>
    </div>
  );
}

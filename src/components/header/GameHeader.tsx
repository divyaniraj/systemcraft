import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Boxes 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { LEVELS } from '../../data/levels';

export const GameHeader: React.FC = () => {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const isSimulating = useGameStore((s) => s.isSimulating);
  const isSurge = useGameStore((s) => s.isSurge);
  const toggleSimulation = useGameStore((s) => s.toggleSimulation);
  const toggleSurge = useGameStore((s) => s.toggleSurge);
  const resetCurrentLevel = useGameStore((s) => s.resetCurrentLevel);
  const loadLevel = useGameStore((s) => s.loadLevel);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-5 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            <Boxes className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            SystemCraft
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        {/* Level Dropdown / Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Round {currentLevel.round}
          </span>
          <select
            value={currentLevel.id}
            onChange={(e) => loadLevel(Number(e.target.value))}
            className="text-sm font-semibold text-slate-200 bg-slate-800/80 border border-slate-700 rounded-md px-2 py-1 outline-none cursor-pointer hover:border-slate-600"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.title} ({lvl.subtitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SLA & Budget Targets */}
      <div className="hidden lg:flex items-center gap-6 text-xs bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Target:</span>
          <span className="font-bold text-emerald-400">
            {currentLevel.targetRPS.toLocaleString()} RPS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">SLA p99:</span>
          <span className="font-bold text-amber-300">&lt; {currentLevel.slaP99Ms} ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Budget:</span>
          <span className="font-bold text-slate-200">&lt; ${currentLevel.budgetLimit} / mo</span>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="flex items-center gap-3">
        {/* Surge Spike Toggle */}
        <button
          onClick={toggleSurge}
          className={`text-xs px-3 py-1.5 rounded-md font-semibold border transition flex items-center gap-1.5 ${
            isSurge
              ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-500/20 animate-pulse'
              : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isSurge ? 'Spike Active! (Revert)' : `Simulate Spike (${currentLevel.surgeRPS.toLocaleString()} RPS)`}</span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={toggleSimulation}
          className={`text-xs px-4 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 shadow-lg ${
            isSimulating
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimulating ? 'Running' : 'Paused'}</span>
        </button>

        {/* Reset */}
        <button
          onClick={resetCurrentLevel}
          title="Reset Level Architecture"
          className="w-8 h-8 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

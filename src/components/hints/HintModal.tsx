import React, { useState } from 'react';
import { 
  Lightbulb, 
  X, 
  Eye, 
  Lock, 
  Sparkles, 
  Network, 
  Calculator, 
  CheckCircle2 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose }) => {
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const currentLevel = useGameStore((s) => s.currentLevel);

  // Track which hints have been revealed for this level in local component state
  const [revealedLevel, setRevealedLevel] = useState<number>(1);

  if (!isOpen) return null;

  const hints = currentLevel.hints || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Architectural Concept':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Wiring & Topology':
        return <Network className="w-4 h-4 text-cyan-400" />;
      case 'Capacity & Math Solution':
        return <Calculator className="w-4 h-4 text-emerald-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div 
        className="w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                Level Hints & Architecture Guide
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Level {currentLevel.levelNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {currentQuestion.title} • {currentLevel.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (HINTS LIST) */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {hints.map((hintItem, idx) => {
            const isRevealed = hintItem.level <= revealedLevel;
            const isNextToReveal = hintItem.level === revealedLevel + 1;

            return (
              <div
                key={idx}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  isRevealed
                    ? 'border-slate-700/80 bg-slate-800/40 shadow-sm'
                    : 'border-slate-800/60 bg-slate-950/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-mono">
                      {idx + 1}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {getCategoryIcon(hintItem.category)}
                      {hintItem.category}
                    </span>
                  </div>

                  {isRevealed ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Revealed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-white mb-1.5">{hintItem.title}</h3>

                {isRevealed ? (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {hintItem.hint}
                  </p>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 italic">
                      Hint locked to prevent spoilers.
                    </span>
                    {isNextToReveal && (
                      <button
                        onClick={() => setRevealedLevel(hintItem.level)}
                        className="text-xs px-3 py-1 rounded-md font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Reveal Hint {idx + 1}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            Target: <b className="text-emerald-400 font-mono">{currentLevel.targetRPS.toLocaleString()} RPS</b> • 
            p99 SLA: <b className="text-amber-300 font-mono">&lt; {currentLevel.slaP99Ms}ms</b>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-xs cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            Got it, back to Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

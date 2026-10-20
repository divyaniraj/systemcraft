import React from 'react';
import { 
  Users, 
  GitFork, 
  Server, 
  Zap, 
  Database, 
  Layers, 
  Lock, 
  Plus, 
  HelpCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { COMPONENT_CATALOG } from '../../data/components';
import { useGameStore } from '../../store/gameStore';
import type { ComponentType } from '../../types/game';

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users className="w-3.5 h-3.5 text-blue-400" />,
  GitFork: <GitFork className="w-3.5 h-3.5 text-purple-400" />,
  Server: <Server className="w-3.5 h-3.5 text-cyan-400" />,
  Zap: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
  Database: <Database className="w-3.5 h-3.5 text-amber-400" />,
  Layers: <Layers className="w-3.5 h-3.5 text-indigo-400" />,
  Globe: <Globe className="w-3.5 h-3.5 text-sky-400" />,
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Medium-Hard': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  Hard: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const ComponentToolbox: React.FC = () => {
  const questions = useGameStore((s) => s.questions);
  const currentQuestionIndex = useGameStore((s) => s.currentQuestionIndex);
  const currentLevelIndex = useGameStore((s) => s.currentLevelIndex);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const selectQuestion = useGameStore((s) => s.selectQuestion);
  const selectLevel = useGameStore((s) => s.selectLevel);
  const addNode = useGameStore((s) => s.addNode);

  const onDragStart = (event: React.DragEvent, nodeType: ComponentType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const diffStyle = DIFFICULTY_COLORS[currentQuestion.difficulty] || DIFFICULTY_COLORS.Easy;

  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between shrink-0 overflow-y-auto select-none">
      <div className="space-y-4">
        
        {/* QUESTION SELECTOR HEADER */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Interview Problem
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <select
            value={currentQuestionIndex}
            onChange={(e) => selectQuestion(Number(e.target.value))}
            className="w-full text-xs font-bold text-slate-100 bg-slate-800/90 border border-slate-700 rounded-lg p-2 outline-none cursor-pointer hover:border-slate-600 transition"
          >
            {questions.map((q, idx) => (
              <option key={q.id} value={idx}>
                {idx + 1}. {q.title} ({q.difficulty})
              </option>
            ))}
          </select>

          {/* Company Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {currentQuestion.companyTags.map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 3-LEVEL STEPPER */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Interview Stage</span>
            <span className="font-mono text-cyan-400 text-xs font-black">
              Round {currentLevel.levelNumber} of 3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            {currentQuestion.levels.map((lvl, idx) => {
              const isActive = idx === currentLevelIndex;
              const isPassed = idx < currentLevelIndex;

              return (
                <button
                  key={lvl.levelNumber}
                  onClick={() => selectLevel(idx)}
                  className={`py-1.5 px-1 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 border ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : isPassed
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {isPassed ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : null}
                  <span>Lvl {lvl.levelNumber}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-200">
            {currentLevel.title}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {currentLevel.subtitle}
          </div>
        </div>

        {/* INTERVIEWER PROMPT CARD */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/30 to-slate-950/70 border border-indigo-500/30">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-indigo-300">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interviewer Prompt:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            "{currentLevel.interviewerPrompt}"
          </p>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">Target</span>
              <span className="font-mono font-bold text-emerald-400">{currentLevel.targetRPS.toLocaleString()} RPS</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">SLA p99</span>
              <span className="font-mono font-bold text-amber-300">&lt; {currentLevel.slaP99Ms}ms</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
              <span className="text-slate-500 block text-[9px]">Budget</span>
              <span className="font-mono font-bold text-slate-200">&lt; ${currentLevel.budgetLimit}</span>
            </div>
          </div>
        </div>

        {/* TOOLBOX PALETTE */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Available Components</span>
            <span className="text-[9px] text-slate-500">Drag to canvas</span>
          </div>

          <div className="space-y-1.5">
            {COMPONENT_CATALOG.map((item) => {
              const isAllowed = currentLevel.allowedComponents.includes(item.type);

              return (
                <div
                  key={item.type}
                  draggable={isAllowed}
                  onDragStart={(e) => onDragStart(e, item.type)}
                  onClick={() => isAllowed && addNode(item.type)}
                  className={`p-2 rounded-lg border transition-all ${
                    isAllowed
                      ? 'border-slate-800 bg-slate-800/40 hover:border-cyan-500/40 hover:bg-slate-800/80 cursor-pointer group'
                      : 'border-slate-800/30 bg-slate-900/40 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-slate-800/90 flex items-center justify-center shrink-0">
                      {ICON_MAP[item.iconName]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate flex items-center justify-between">
                        <span>{item.title}</span>
                        {isAllowed ? (
                          <Plus className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
                        ) : (
                          <Lock className="w-2.5 h-2.5 text-slate-600" />
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        ${item.costPerMonth}/mo • {item.maxRPS.toLocaleString()} max RPS
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FOOTER TIP */}
      <div className="text-[10px] text-slate-400 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/70 mt-3 flex items-center justify-between">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px]">Del</kbd> to remove selected items</span>
        <ChevronRight className="w-3 h-3 text-slate-500" />
      </div>
    </aside>
  );
};

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
  Lightbulb 
} from 'lucide-react';
import { COMPONENT_CATALOG } from '../../data/components';
import { useGameStore } from '../../store/gameStore';
import type { ComponentType } from '../../types/game';

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users className="w-4 h-4 text-blue-400" />,
  GitFork: <GitFork className="w-4 h-4 text-purple-400" />,
  Server: <Server className="w-4 h-4 text-cyan-400" />,
  Zap: <Zap className="w-4 h-4 text-emerald-400" />,
  Database: <Database className="w-4 h-4 text-amber-400" />,
  Layers: <Layers className="w-4 h-4 text-indigo-400" />,
};

export const ComponentToolbox: React.FC = () => {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const addNode = useGameStore((s) => s.addNode);

  const onDragStart = (event: React.DragEvent, nodeType: ComponentType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Component Toolbox</span>
          <span className="text-[10px] text-slate-500">Drag or Click</span>
        </div>

        <div className="space-y-2">
          {COMPONENT_CATALOG.map((item) => {
            const isAllowed = currentLevel.allowedComponents.includes(item.type);

            return (
              <div
                key={item.type}
                draggable={isAllowed}
                onDragStart={(e) => onDragStart(e, item.type)}
                onClick={() => isAllowed && addNode(item.type)}
                className={`p-2.5 rounded-lg border transition-all ${
                  isAllowed
                    ? 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer group'
                    : 'border-slate-800/40 bg-slate-900/40 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                    {ICON_MAP[item.iconName]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate flex items-center justify-between">
                      <span>{item.title}</span>
                      {isAllowed ? (
                        <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${item.costPerMonth}/mo • {item.maxRPS.toLocaleString()} max RPS
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Design Tip */}
      <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 mt-4">
        <div className="font-semibold flex items-center gap-1.5 mb-1 text-indigo-200">
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" /> Level Hint
        </div>
        <p className="leading-relaxed">
          {currentLevel.tips[0] || 'Observe where latency spikes occur in the telemetry dashboard.'}
        </p>
      </div>
    </aside>
  );
};

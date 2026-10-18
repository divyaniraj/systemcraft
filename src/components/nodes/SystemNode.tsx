import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { 
  Users, 
  GitFork, 
  Server, 
  Zap, 
  Database, 
  Layers, 
  Trash2, 
  AlertTriangle,
  Flame
} from 'lucide-react';
import type { SystemNodeData } from '../../types/game';
import { useGameStore } from '../../store/gameStore';

const ICON_MAP: Record<string, React.ReactNode> = {
  client: <Users className="w-4 h-4 text-blue-400" />,
  load_balancer: <GitFork className="w-4 h-4 text-purple-400" />,
  compute: <Server className="w-4 h-4 text-cyan-400" />,
  cache: <Zap className="w-4 h-4 text-emerald-400" />,
  database: <Database className="w-4 h-4 text-amber-400" />,
  queue: <Layers className="w-4 h-4 text-indigo-400" />,
};

const BORDER_MAP: Record<string, string> = {
  client: 'border-blue-500/40 hover:border-blue-400',
  load_balancer: 'border-purple-500/40 hover:border-purple-400',
  compute: 'border-cyan-500/40 hover:border-cyan-400',
  cache: 'border-emerald-500/40 hover:border-emerald-400',
  database: 'border-amber-500/40 hover:border-amber-400',
  queue: 'border-indigo-500/40 hover:border-indigo-400',
};

export const SystemNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const nodeData = data as unknown as SystemNodeData;
  const removeNode = useGameStore((s) => s.removeNode);

  const isCritical = nodeData.status === 'critical';
  const isWarning = nodeData.status === 'warning';

  return (
    <div
      className={`relative w-44 rounded-xl border bg-slate-900/95 p-3 shadow-xl backdrop-blur transition-all duration-200 ${
        isCritical
          ? 'border-rose-500 ring-2 ring-rose-500/40 shadow-rose-500/20'
          : isWarning
          ? 'border-amber-500 ring-1 ring-amber-500/30'
          : selected
          ? 'border-indigo-400 ring-2 ring-indigo-400/40'
          : BORDER_MAP[nodeData.type] || 'border-slate-800'
      }`}
    >
      {/* Target Connection Handle (Inputs) */}
      {nodeData.type !== 'client' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-slate-400 hover:!bg-cyan-400 !border-2 !border-slate-900 cursor-crosshair"
        />
      )}

      {/* Source Connection Handle (Outputs) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-400 hover:!bg-indigo-400 !border-2 !border-slate-900 cursor-crosshair"
      />

      {/* Top Header Tag */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {nodeData.type.replace('_', ' ')}
        </span>

        <div className="flex items-center gap-1.5">
          {isCritical ? (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold animate-pulse">
              <Flame className="w-2.5 h-2.5 text-rose-500" /> Locked
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" /> High Load
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}

          {/* Delete Action (Except Client) */}
          {nodeData.type !== 'client' && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeNode(id);
              }}
              title="Delete this component"
              className="nodrag nopan p-1 rounded-md bg-slate-800/80 hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/50 transition cursor-pointer flex items-center justify-center"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Icon */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded bg-slate-800/80 flex items-center justify-center shrink-0">
          {ICON_MAP[nodeData.type]}
        </div>
        <span className="text-xs font-bold text-white truncate">{nodeData.label}</span>
      </div>

      {/* Load / Capacity Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            isCritical
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-400'
              : nodeData.type === 'cache'
              ? 'bg-emerald-400'
              : 'bg-cyan-400'
          }`}
          style={{ width: `${nodeData.loadPercent}%` }}
        />
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>Load: <b className="text-slate-200 font-mono">{nodeData.loadPercent}%</b></span>
        <span className="font-mono text-slate-300">
          {nodeData.currentRPS.toLocaleString()} req/s
        </span>
      </div>

      {/* Extra Details */}
      {nodeData.type === 'cache' && (
        <div className="text-[9px] text-emerald-400 font-semibold mt-1">
          Hit Rate: 92% • Sub-ms
        </div>
      )}
      {nodeData.type === 'database' && (
        <div className={`text-[9px] mt-1 ${isCritical ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
          Pool: {isCritical ? '100/100 (Saturated)' : '84/100 connections'}
        </div>
      )}
    </div>
  );
};

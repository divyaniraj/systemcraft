import React, { useEffect } from 'react';
import { 
  Activity, 
  DollarSign, 
  AlertCircle, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';

export const TelemetryDashboard: React.FC = () => {
  const telemetry = useGameStore((s) => s.telemetry);
  const interviewerFeedback = useGameStore((s) => s.interviewerFeedback);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const nodes = useGameStore((s) => s.nodes);

  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted]);

  const p99Breached = telemetry.p99LatencyMs > telemetry.slaP99Ms;
  const isPassing = telemetry.status === 'passing' && isCompleted;
  const hasAppServer = nodes.some((n) => n.data.type === 'compute');
  const hasDatabase = nodes.some((n) => n.data.type === 'database');
  const isWithinBudget = telemetry.monthlyCost <= telemetry.budgetLimit;
  const isSlaMet = !p99Breached && telemetry.p99LatencyMs > 0;

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between shrink-0 overflow-y-auto select-none">
      <div className="space-y-3.5">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPassing ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-ping'
              }`}
            />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Live Evaluation
            </h2>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
              isPassing
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {isPassing ? 'SLA PASSED' : 'TESTING'}
          </span>
        </div>

        {/* 1. THROUGHPUT GAUGE */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> System Load
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {telemetry.currentRPS.toLocaleString()} / {telemetry.targetRPS.toLocaleString()}
            </span>
          </div>

          <div className="text-2xl font-black font-mono text-slate-100 mb-2">
            {telemetry.currentRPS.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">req/s</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                telemetry.currentRPS >= telemetry.targetRPS ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
              style={{
                width: `${Math.min(100, (telemetry.currentRPS / Math.max(1, telemetry.targetRPS)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 2. LATENCY PERCENTILES */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>Response Latency</span>
            <span className="text-[10px] text-slate-500 font-mono">
              Limit: &lt; {telemetry.slaP99Ms}ms
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* p50 */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <div className="text-[9px] text-slate-400 font-medium">p50 (Median)</div>
              <div className="text-xs font-black font-mono text-emerald-400">
                {telemetry.p50LatencyMs} ms
              </div>
            </div>

            {/* p95 */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <div className="text-[9px] text-slate-400 font-medium">p95 (Slow)</div>
              <div
                className={`text-xs font-black font-mono ${
                  telemetry.p95LatencyMs > 250 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {telemetry.p95LatencyMs} ms
              </div>
            </div>

            {/* p99 */}
            <div
              className={`p-2 rounded-lg text-center border ${
                p99Breached
                  ? 'bg-rose-500/10 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div
                className={`text-[9px] font-bold ${
                  p99Breached ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                p99 (Worst 1%)
              </div>
              <div
                className={`text-xs font-black font-mono ${
                  p99Breached ? 'text-rose-400' : 'text-amber-300'
                }`}
              >
                {telemetry.p99LatencyMs} ms
              </div>
            </div>
          </div>
        </div>

        {/* 3. ERROR RATE & COST */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-slate-500" /> 5xx Errors
            </div>
            <div
              className={`text-base font-bold font-mono ${
                telemetry.errorRatePercent > 0.1 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {telemetry.errorRatePercent}%
            </div>
            <div className="text-[9px] text-slate-500">Max: 0.1%</div>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-slate-500" /> Cloud Cost
            </div>
            <div
              className={`text-base font-bold font-mono ${
                !isWithinBudget ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              ${telemetry.monthlyCost}
            </div>
            <div className="text-[9px] text-slate-500">
              Budget: ${telemetry.budgetLimit}/mo
            </div>
          </div>
        </div>

        {/* 4. INTERVIEW CRITERIA CHECKLIST */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Interview Rubric
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Compute Layer Connected</span>
            {hasAppServer ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Persistence Layer Connected</span>
            {hasDatabase ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">p99 Latency &lt; {currentLevel.slaP99Ms}ms</span>
            {isSlaMet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Cloud Cost &lt; ${currentLevel.budgetLimit}/mo</span>
            {isWithinBudget ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            )}
          </div>
        </div>

        {/* LEVEL CLEAR / ADVANCE PROMPT */}
        {isPassing && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-indigo-950/90 border border-emerald-500/50 text-center shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Level {currentLevel.levelNumber} Passed!
            </div>
            <p className="text-[10px] text-slate-300 mb-2.5">
              The interviewer approved your architecture. Ready for the next follow-up challenge?
            </p>
            <button
              onClick={nextLevel}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span>
                {currentLevel.levelNumber < 3
                  ? `Proceed to Level ${currentLevel.levelNumber + 1}`
                  : `Completed! Next: Problem #${currentQuestion.id + 1}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* AI INTERVIEWER FEEDBACK BOX */}
      <div className="p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 text-xs shadow-lg mt-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200 text-xs">Interviewer AI</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {interviewerFeedback}
        </p>
      </div>
    </aside>
  );
};

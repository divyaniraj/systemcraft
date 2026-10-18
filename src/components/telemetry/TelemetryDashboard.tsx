import React, { useEffect } from 'react';
import { 
  Activity, 
  DollarSign, 
  AlertCircle, 
  UserCheck, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';

export const TelemetryDashboard: React.FC = () => {
  const telemetry = useGameStore((s) => s.telemetry);
  const interviewerFeedback = useGameStore((s) => s.interviewerFeedback);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const loadLevel = useGameStore((s) => s.loadLevel);

  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted]);

  const p99Breached = telemetry.p99LatencyMs > telemetry.slaP99Ms;
  const isPassing = telemetry.status === 'passing';

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPassing ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-ping'
              }`}
            />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Live Telemetry
            </h2>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isPassing
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {isPassing ? 'HEALTHY' : 'DEGRADED'}
          </span>
        </div>

        {/* 1. Throughput RPS */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Throughput
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
                width: `${Math.min(100, (telemetry.currentRPS / telemetry.targetRPS) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 2. Latency Percentiles (p50, p95, p99) */}
        <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 mb-3">
          <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
            <span>Response Latency</span>
            <span className="text-[10px] text-slate-500 font-mono">
              SLA: &lt; {telemetry.slaP99Ms}ms
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* p50 */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-medium">p50</div>
              <div className="text-sm font-black font-mono text-emerald-400">
                {telemetry.p50LatencyMs} ms
              </div>
              <div className="text-[9px] text-emerald-500/80 mt-0.5">Typical</div>
            </div>

            {/* p95 */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 font-medium">p95</div>
              <div
                className={`text-sm font-black font-mono ${
                  telemetry.p95LatencyMs > 250 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {telemetry.p95LatencyMs} ms
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">95% of users</div>
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
                className={`text-[10px] font-medium ${
                  p99Breached ? 'text-rose-300' : 'text-slate-400'
                }`}
              >
                p99
              </div>
              <div
                className={`text-sm font-black font-mono ${
                  p99Breached ? 'text-rose-400' : 'text-amber-300'
                }`}
              >
                {telemetry.p99LatencyMs} ms
              </div>
              <div
                className={`text-[9px] font-bold mt-0.5 ${
                  p99Breached ? 'text-rose-400' : 'text-slate-500'
                }`}
              >
                {p99Breached ? 'BREACH' : 'Worst 1%'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Error Rate & Monthly Budget */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-slate-500" /> 5xx Errors
            </div>
            <div
              className={`text-lg font-bold font-mono ${
                telemetry.errorRatePercent > 0.1 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {telemetry.errorRatePercent}%
            </div>
            <div className="text-[9px] text-slate-500">Max SLA: 0.1%</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-slate-500" /> Cloud Cost
            </div>
            <div
              className={`text-lg font-bold font-mono ${
                telemetry.monthlyCost > telemetry.budgetLimit ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              ${telemetry.monthlyCost}
            </div>
            <div className="text-[9px] text-slate-500">
              Budget: ${telemetry.budgetLimit}/mo
            </div>
          </div>
        </div>

        {/* Victory Celebration Banner */}
        {isCompleted && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 to-indigo-950 border border-emerald-500/50 mb-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Level Passed!
            </div>
            <p className="text-[10px] text-slate-300 mb-2">
              Your system survived the traffic surge within budget and latency SLA!
            </p>
            {currentLevel.id < 3 && (
              <button
                onClick={() => loadLevel(currentLevel.id + 1)}
                className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                Proceed to Level {currentLevel.id + 1}
              </button>
            )}
          </div>
        )}
      </div>

      {/* AI Interviewer Feedback Box */}
      <div className="p-3.5 rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950 text-xs shadow-lg">
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

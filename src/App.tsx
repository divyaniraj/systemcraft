import React, { useEffect } from 'react';
import { GameHeader } from './components/header/GameHeader';
import { ComponentToolbox } from './components/sidebar/ComponentToolbox';
import { ArchitectureCanvas } from './components/canvas/ArchitectureCanvas';
import { TelemetryDashboard } from './components/telemetry/TelemetryDashboard';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const runSimulationTick = useGameStore((s) => s.runSimulationTick);
  const isSimulating = useGameStore((s) => s.isSimulating);

  // Background ticker to keep metrics and node states responsive
  useEffect(() => {
    runSimulationTick();
    const interval = setInterval(() => {
      if (isSimulating) {
        runSimulationTick();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [runSimulationTick, isSimulating]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <GameHeader />
      <div className="flex-1 flex overflow-hidden">
        <ComponentToolbox />
        <ArchitectureCanvas />
        <TelemetryDashboard />
      </div>
    </div>
  );
};

export default App;

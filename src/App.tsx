import React, { useState, useEffect } from 'react';
import { GameHeader } from './components/header/GameHeader';
import { ComponentToolbox } from './components/sidebar/ComponentToolbox';
import { ArchitectureCanvas } from './components/canvas/ArchitectureCanvas';
import { TelemetryDashboard } from './components/telemetry/TelemetryDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { HintModal } from './components/hints/HintModal';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const runSimulationTick = useGameStore((s) => s.runSimulationTick);
  const isSimulating = useGameStore((s) => s.isSimulating);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);

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
      <GameHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHints={() => setIsHintsOpen(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        <ComponentToolbox />
        <ArchitectureCanvas />
        <TelemetryDashboard />
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <HintModal isOpen={isHintsOpen} onClose={() => setIsHintsOpen(false)} />
    </div>
  );
};

export default App;

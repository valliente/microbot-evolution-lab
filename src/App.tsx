import React, { useState, useEffect, useRef } from 'react';
import { MicrobotEngine } from './simulation/MicrobotEngine';
import { SimulationConfig, SimulationStats } from './simulation/types';
import { loadConfigFromStorage, saveConfigToStorage } from './utils/storage';
import { Header } from './components/UI/Header';
import { ControlPanel } from './components/UI/ControlPanel';
import { InspectorPanel } from './components/UI/InspectorPanel';
import { StatsDashboard } from './components/UI/StatsDashboard';
import { SimulationCanvas } from './components/Canvas/SimulationCanvas';

export const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(loadConfigFromStorage);
  const engineRef = useRef<MicrobotEngine | null>(null);

  // Initialize engine on mount
  if (!engineRef.current) {
    engineRef.current = new MicrobotEngine(1200, 800, config);
  }

  const engine = engineRef.current;

  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [stats, setStats] = useState<SimulationStats>(() => engine.getStats());

  // Log selectedBotId to ensure it is consumed or keep reference
  useEffect(() => {
    if (selectedBotId && engine) {
      engine.selectedMicrobotId = selectedBotId;
    }
  }, [selectedBotId, engine]);

  // Periodically refresh stats for React UI (10 FPS for optimal performance)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(engine.getStats());
    }, 100);

    return () => clearInterval(interval);
  }, [engine]);

  const handleUpdateConfig = (newConfig: Partial<SimulationConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      saveConfigToStorage(updated);
      if (engine) {
        engine.config = updated;
        if ('hazardCount' in newConfig) {
          engine.updateHazardsCount();
        }
      }
      return updated;
    });
  };

  const handleReset = () => {
    if (engine) {
      engine.resetSimulation();
      setSelectedBotId(null);
      setStats(engine.getStats());
    }
  };

  const handleStep = () => {
    if (engine && config.isPaused) {
      engine.update(1.0);
      setStats(engine.getStats());
    }
  };

  const selectedBot = engine.getSelectedMicrobot();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header Bar */}
      <Header
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onReset={handleReset}
        onStep={handleStep}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Controls & Inspector */}
        <div className="lg:col-span-3 flex flex-col space-y-4 order-2 lg:order-1">
          <ControlPanel config={config} onUpdateConfig={handleUpdateConfig} />
          <InspectorPanel bot={selectedBot} onClose={() => setSelectedBotId(null)} />
        </div>

        {/* Right Column: Canvas Viewport & Statistics */}
        <div className="lg:col-span-9 flex flex-col space-y-4 order-1 lg:order-2">
          <div className="flex-1 min-h-[480px]">
            <SimulationCanvas
              engine={engine}
              onSelectBot={(id) => setSelectedBotId(id)}
            />
          </div>

          <StatsDashboard stats={stats} maxPopulation={config.maxPopulation} />
        </div>
      </main>
    </div>
  );
};

export default App;

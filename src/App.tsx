import React, { useState, useEffect, useRef } from 'react';
import { MicrobotEngine } from './simulation/MicrobotEngine';
import { SimulationConfig, SimulationStats, Microbot } from './simulation/types';
import { loadConfigFromStorage, saveConfigToStorage } from './utils/storage';
import { Header } from './components/UI/Header';
import { ControlPanel } from './components/UI/ControlPanel';
import { InspectorPanel } from './components/UI/InspectorPanel';
import { SimulationCanvas } from './components/Canvas/SimulationCanvas';
import { AnalyticsCube3D } from './components/UI/AnalyticsCube3D';
import { GuideModal } from './components/UI/GuideModal';
import { RosterModal } from './components/UI/RosterModal';

export const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(loadConfigFromStorage);
  const engineRef = useRef<MicrobotEngine | null>(null);

  // Initialize engine on mount
  if (!engineRef.current) {
    engineRef.current = new MicrobotEngine(1200, 800, { ...config, isPaused: false });
  }

  const engine = engineRef.current;

  const [selectedBot, setSelectedBot] = useState<Microbot | null>(() => engine.selectRandomMicrobot());
  const [stats, setStats] = useState<SimulationStats>(() => engine.getStats());
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(false);

  // Sync telemetry state on 80ms interval
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(engine.getStats());
      const current = engine.getSelectedMicrobot();
      if (!current && engine.microbots.length > 0) {
        const nextBot = engine.selectRandomMicrobot();
        setSelectedBot(nextBot);
      } else if (current) {
        setSelectedBot({ ...current });
      }
    }, 80);

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
      const bot = engine.selectRandomMicrobot();
      setSelectedBot(bot ? { ...bot } : null);
      setStats(engine.getStats());
    }
  };

  const handleStep = () => {
    if (engine && config.isPaused) {
      engine.update(1.0);
      setStats(engine.getStats());
    }
  };

  const handleSelectBotById = (id: string | null) => {
    if (!engine) return;
    if (id) {
      engine.selectedMicrobotId = id;
      const bot = engine.getSelectedMicrobot();
      setSelectedBot(bot ? { ...bot } : null);
    } else {
      engine.selectedMicrobotId = null;
      setSelectedBot(null);
    }
  };

  const handleSelectRandomBot = () => {
    if (engine) {
      const bot = engine.selectRandomMicrobot();
      setSelectedBot(bot ? { ...bot } : null);
    }
  };

  const handleSpawnFood = () => {
    if (engine) {
      engine.spawnMultipleFood(20);
    }
  };

  const handleSpawnBots = () => {
    if (engine) {
      engine.spawnMultipleBots(10);
      if (!selectedBot) {
        handleSelectRandomBot();
      }
    }
  };

  const handleSpawnHazard = () => {
    if (engine) {
      engine.spawnHazard();
      setConfig((prev) => ({ ...prev, hazardCount: engine.hazards.length }));
    }
  };

  return (
    <div className="app-container">
      {/* Selection Modals */}
      <RosterModal
        isOpen={isRosterOpen}
        microbots={engine.microbots}
        selectedBotId={selectedBot ? selectedBot.id : null}
        onSelectBot={(id) => handleSelectBotById(id)}
        onClose={() => setIsRosterOpen(false)}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Header Bar */}
      <Header
        config={config}
        stats={stats}
        onUpdateConfig={handleUpdateConfig}
        onReset={handleReset}
        onStep={handleStep}
        onOpenRosterMenu={() => setIsRosterOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSpawnFood={handleSpawnFood}
        onSpawnBots={handleSpawnBots}
        onSpawnHazard={handleSpawnHazard}
      />

      {/* Main Workspace Layout */}
      <main className="workspace-grid">
        {/* Left Column: Data Hub & Parameters */}
        <div className="sidebar-col">
          <InspectorPanel bot={selectedBot} stats={stats} onClose={() => handleSelectBotById(null)} />
          <ControlPanel config={config} onUpdateConfig={handleUpdateConfig} />
        </div>

        {/* Right Viewport: Canvas & 3D Analytics Cube */}
        <div className="main-viewport-col">
          <SimulationCanvas
            engine={engine}
            onSelectBot={handleSelectBotById}
            onSelectRandomBot={handleSelectRandomBot}
          />

          {/* Floating 3D Analytics Cube */}
          <AnalyticsCube3D stats={stats} />
        </div>
      </main>
    </div>
  );
};

export default App;

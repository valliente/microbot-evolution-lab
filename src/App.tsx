import React, { useState, useEffect, useRef } from 'react';
import { MicrobotEngine } from './simulation/MicrobotEngine';
import { SimulationConfig, SimulationStats, Microbot } from './simulation/types';
import { loadConfigFromStorage, saveConfigToStorage } from './utils/storage';
import { Header } from './components/UI/Header';
import { ControlPanel } from './components/UI/ControlPanel';
import { InspectorPanel } from './components/UI/InspectorPanel';
import { StatsDashboard } from './components/UI/StatsDashboard';
import { SimulationCanvas } from './components/Canvas/SimulationCanvas';
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
  const [isAutoDemo, setIsAutoDemo] = useState<boolean>(false);

  // Sync selected bot object on every tick for real-time telemetry updates
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

  // Auto Demo Mode loop: automatically switches bot selection every 5 seconds
  useEffect(() => {
    if (!isAutoDemo || !engine) return;

    const demoInterval = setInterval(() => {
      const bot = engine.selectRandomMicrobot();
      setSelectedBot(bot ? { ...bot } : null);
    }, 5000);

    return () => clearInterval(demoInterval);
  }, [isAutoDemo, engine]);

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

  const handleSpawnFood = () => {
    if (engine) {
      engine.spawnMultipleFood(20);
    }
  };

  const handleSpawnBots = () => {
    if (engine) {
      engine.spawnMultipleBots(10);
      if (!selectedBot) {
        const bot = engine.selectRandomMicrobot();
        setSelectedBot(bot ? { ...bot } : null);
      }
    }
  };

  const handleSpawnHazard = () => {
    if (engine) {
      engine.spawnHazard();
      setConfig((prev) => ({ ...prev, hazardCount: engine.hazards.length }));
    }
  };

  const handleClearHazards = () => {
    if (engine) {
      engine.clearHazards();
      setConfig((prev) => ({ ...prev, hazardCount: 0 }));
    }
  };

  return (
    <div className="app-container">
      {/* Microbot Roster Selection Modal */}
      <RosterModal
        isOpen={isRosterOpen}
        microbots={engine.microbots}
        selectedBotId={selectedBot ? selectedBot.id : null}
        onSelectBot={(id) => handleSelectBotById(id)}
        onClose={() => setIsRosterOpen(false)}
      />

      {/* Beginner Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Header Bar */}
      <Header
        config={config}
        isAutoDemo={isAutoDemo}
        onUpdateConfig={handleUpdateConfig}
        onReset={handleReset}
        onStep={handleStep}
        onOpenRosterMenu={() => setIsRosterOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSpawnFood={handleSpawnFood}
        onSpawnBots={handleSpawnBots}
        onSpawnHazard={handleSpawnHazard}
        onClearHazards={handleClearHazards}
        onToggleAutoDemo={() => setIsAutoDemo((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <main className="main-workspace">
        {/* Left Column: Controls & Inspector */}
        <div className="left-sidebar">
          <InspectorPanel bot={selectedBot} onClose={() => handleSelectBotById(null)} />
          <ControlPanel config={config} onUpdateConfig={handleUpdateConfig} />
        </div>

        {/* Right Column: Canvas Viewport & Statistics */}
        <div className="right-viewport">
          <SimulationCanvas
            engine={engine}
            onSelectBot={handleSelectBotById}
            onSelectRandomBot={() => setIsRosterOpen(true)}
          />

          <StatsDashboard stats={stats} maxPopulation={config.maxPopulation} />
        </div>
      </main>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { MicrobotEngine } from './simulation/MicrobotEngine';
import { SimulationConfig, SimulationStats } from './simulation/types';
import { loadConfigFromStorage, saveConfigToStorage } from './utils/storage';
import { Header } from './components/UI/Header';
import { ControlPanel } from './components/UI/ControlPanel';
import { InspectorPanel } from './components/UI/InspectorPanel';
import { StatsDashboard } from './components/UI/StatsDashboard';
import { SimulationCanvas } from './components/Canvas/SimulationCanvas';
import { GuideModal } from './components/UI/GuideModal';
import { StartOverlay } from './components/UI/StartOverlay';

export const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(loadConfigFromStorage);
  const engineRef = useRef<MicrobotEngine | null>(null);

  // Initialize engine on mount
  if (!engineRef.current) {
    engineRef.current = new MicrobotEngine(1200, 800, config);
  }

  const engine = engineRef.current;

  const [selectedBotId, setSelectedBotId] = useState<string | null>(() => {
    const firstBot = engine.selectRandomMicrobot();
    return firstBot ? firstBot.id : null;
  });

  const [stats, setStats] = useState<SimulationStats>(() => engine.getStats());
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAutoDemo, setIsAutoDemo] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);

  // Auto-select a microbot whenever current selected microbot dies or becomes null
  useEffect(() => {
    if (engine) {
      if (!selectedBotId || !engine.getSelectedMicrobot()) {
        const bot = engine.selectRandomMicrobot();
        if (bot) {
          setSelectedBotId(bot.id);
        }
      } else {
        engine.selectedMicrobotId = selectedBotId;
      }
    }
  }, [selectedBotId, engine, stats.currentPopulation]);

  // Auto Demo Mode loop: automatically cycles bot selections every 6 seconds
  useEffect(() => {
    if (!isAutoDemo || !engine) return;

    const demoInterval = setInterval(() => {
      const bot = engine.selectRandomMicrobot();
      setSelectedBotId(bot ? bot.id : null);
    }, 6000);

    return () => clearInterval(demoInterval);
  }, [isAutoDemo, engine]);

  // Periodically refresh stats for React UI (10 FPS for optimal performance)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(engine.getStats());
    }, 100);

    return () => clearInterval(interval);
  }, [engine]);

  const handleStartGame = () => {
    setIsStarted(true);
    if (engine) {
      engine.config.isPaused = false;
      const bot = engine.selectRandomMicrobot();
      if (bot) setSelectedBotId(bot.id);
    }
  };

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
      setSelectedBotId(bot ? bot.id : null);
      setStats(engine.getStats());
    }
  };

  const handleStep = () => {
    if (engine && config.isPaused) {
      engine.update(1.0);
      setStats(engine.getStats());
    }
  };

  const handleSelectRandomBot = () => {
    if (engine) {
      const bot = engine.selectRandomMicrobot();
      setSelectedBotId(bot ? bot.id : null);
    }
  };

  const handleSpawnFood = () => {
    if (engine) {
      engine.spawnMultipleFood(10);
    }
  };

  const handleSpawnBots = () => {
    if (engine) {
      engine.spawnMultipleBots(10);
      if (!selectedBotId) {
        handleSelectRandomBot();
      }
    }
  };

  const selectedBot = engine.getSelectedMicrobot();

  return (
    <div className="app-container">
      {/* Start Game Giant Splash Overlay */}
      <StartOverlay
        isStarted={isStarted}
        onStartGame={handleStartGame}
        onOpenGuide={() => setIsGuideOpen(true)}
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
        onSelectRandomBot={handleSelectRandomBot}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSpawnFood={handleSpawnFood}
        onSpawnBots={handleSpawnBots}
        onToggleAutoDemo={() => setIsAutoDemo((prev) => !prev)}
      />

      {/* Main Workspace Layout */}
      <main className="main-workspace">
        {/* Left Column: Controls & Inspector */}
        <div className="left-sidebar">
          <InspectorPanel bot={selectedBot} onClose={() => setSelectedBotId(null)} />
          <ControlPanel config={config} onUpdateConfig={handleUpdateConfig} />
        </div>

        {/* Right Column: Canvas Viewport & Statistics */}
        <div className="right-viewport">
          <div className="canvas-wrapper">
            <SimulationCanvas
              engine={engine}
              onSelectBot={(id) => setSelectedBotId(id)}
              onSelectRandomBot={handleSelectRandomBot}
            />
          </div>

          <StatsDashboard stats={stats} maxPopulation={config.maxPopulation} />
        </div>
      </main>
    </div>
  );
};

export default App;

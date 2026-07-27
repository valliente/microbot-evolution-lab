import React, { useState, useEffect, useRef } from 'react';
import { MicrobotEngine } from './simulation/MicrobotEngine';
import { SimulationConfig, SimulationStats, Microbot } from './simulation/types';
import { loadConfigFromStorage, saveConfigToStorage } from './utils/storage';
import { Header } from './components/UI/Header';
import { ControlPanel } from './components/UI/ControlPanel';
import { InspectorPanel } from './components/UI/InspectorPanel';
import { GeneticDriftHeatmap } from './components/UI/GeneticDriftHeatmap';
import { SimulationCanvas } from './components/Canvas/SimulationCanvas';
import { AnalyticsCube3D } from './components/UI/AnalyticsCube3D';
import { GuideModal } from './components/UI/GuideModal';
import { RosterModal } from './components/UI/RosterModal';
import { LineageModal } from './components/UI/LineageModal';
import { BlueprintStudioModal } from './components/UI/BlueprintStudioModal';

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
  const [isLineageOpen, setIsLineageOpen] = useState<boolean>(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);

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

  const handleSpawnBlueprint = (blueprint: Partial<Microbot>, count: number) => {
    if (!engine) return;
    for (let i = 0; i < count; i++) {
      const bot = engine.spawnMicrobot();
      engine.overrideMicrobotGenes(bot.id, blueprint);
    }
    setStats(engine.getStats());
  };

  const handleOverrideGenes = (id: string, traits: Partial<Microbot>) => {
    if (engine) {
      engine.overrideMicrobotGenes(id, traits);
      const current = engine.getSelectedMicrobot();
      if (current) setSelectedBot({ ...current });
    }
  };

  const handleExportTelemetryCSV = () => {
    if (!engine) return;
    const header = 'Time (s),Population,Avg Speed,Avg Vision,Total Births,Total Deaths,Predators,Season\n';
    const rows = stats.historyTimeline.map(
      (item) => `${item.time},${item.population},${item.avgSpeed.toFixed(2)},${item.avgVision.toFixed(1)},${stats.totalBirths},${stats.totalDeaths},${stats.predatorCount},${stats.currentSeason}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microbot_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportConfigJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `microbot_preset_config_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportConfigJSON = (jsonConfig: Partial<SimulationConfig>) => {
    handleUpdateConfig(jsonConfig);
    alert('Simulation Preset Loaded Successfully!');
  };

  const lineageData = selectedBot && engine ? engine.getLineageTree(selectedBot.id) : { parent: null, current: null, children: [] };

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

      <LineageModal
        isOpen={isLineageOpen}
        selectedBot={lineageData.current}
        parentBot={lineageData.parent}
        childBots={lineageData.children}
        onSelectBot={(id) => { handleSelectBotById(id); }}
        onClose={() => setIsLineageOpen(false)}
      />

      <BlueprintStudioModal
        isOpen={isBlueprintOpen}
        onSpawnBlueprint={handleSpawnBlueprint}
        onClose={() => setIsBlueprintOpen(false)}
      />

      {/* Header Bar */}
      <Header
        config={config}
        stats={stats}
        onUpdateConfig={handleUpdateConfig}
        onReset={handleReset}
        onStep={handleStep}
        onOpenRosterMenu={() => setIsRosterOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenBlueprintStudio={() => setIsBlueprintOpen(true)}
        onSpawnFood={handleSpawnFood}
        onSpawnBots={handleSpawnBots}
        onSpawnHazard={handleSpawnHazard}
        onTriggerMeteor={() => engine?.triggerMeteorStrike()}
        onTriggerVoidRift={() => engine?.triggerVoidRift()}
        onTriggerOutbreak={() => engine?.triggerOutbreak()}
        onExportTelemetryCSV={handleExportTelemetryCSV}
        onExportConfigJSON={handleExportConfigJSON}
        onImportConfigJSON={handleImportConfigJSON}
      />

      {/* Main Workspace Layout */}
      <main className="workspace-grid">
        {/* Left Column: Data Hub & Parameters */}
        <div className="sidebar-col">
          <InspectorPanel
            bot={selectedBot}
            stats={stats}
            onClose={() => handleSelectBotById(null)}
            onOverrideGenes={handleOverrideGenes}
            onOpenLineageModal={() => setIsLineageOpen(true)}
          />
          <ControlPanel config={config} onUpdateConfig={handleUpdateConfig} />
          <GeneticDriftHeatmap stats={stats} />
        </div>

        {/* Right Viewport: Canvas & 3D Analytics Cube */}
        <div className="main-viewport-col">
          <SimulationCanvas
            engine={engine}
            onSelectBot={handleSelectBotById}
            onSelectRandomBot={handleSelectRandomBot}
            onUpdateConfig={handleUpdateConfig}
          />

          {/* Floating 3D Analytics Cube */}
          <AnalyticsCube3D stats={stats} />
        </div>
      </main>
    </div>
  );
};

export default App;

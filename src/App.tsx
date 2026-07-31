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
import { CrisprModal } from './components/UI/CrisprModal';
import { NeuralBrainVisualizer } from './components/UI/NeuralBrainVisualizer';
import { GeneticConstellation3D } from './components/UI/GeneticConstellation3D';
import { ErrorOverlay } from './components/UI/ErrorOverlay';
import { telemetryManager } from './utils/telemetryManager';
import { spatialAudio } from './audio/SpatialAudioSynth';

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
  const [isCrisprOpen, setIsCrisprOpen] = useState<boolean>(false);
  const [isNeuralOpen, setIsNeuralOpen] = useState<boolean>(false);
  const [simulationError, setSimulationError] = useState<Error | null>(null);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      setSimulationError(event.error || new Error(event.message));
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setSimulationError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      spatialAudio.dispose();
    };
  }, []);

  // Handle tab visibility change recovery to prevent canvas freezes
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && engine) {
        engine.update(0.01);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [engine]);

  useEffect(() => {
    telemetryManager.startPolling(engine, 80);
    const unsubscribe = telemetryManager.subscribe((newStats) => {
      setStats(newStats);
      
      const current = engine.getSelectedMicrobot();
      if (!current && engine.microbots.length > 0) {
        const nextBot = engine.selectRandomMicrobot();
        setSelectedBot(nextBot);
      } else if (current) {
        setSelectedBot({ ...current });
      } else {
        // Fix(ui): resolve state freeze in Bot Data Hub when tracked bot dies during selection
        if (engine.selectedMicrobotId) {
           engine.selectedMicrobotId = null;
        }
        setSelectedBot(null);
      }
    });

    return () => {
      unsubscribe();
      telemetryManager.stopPolling();
    };
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

  const handleTriggerSolarFlare = () => {
    if (engine) engine.triggerSolarFlare();
  };

  const handleTriggerPortal = () => {
    if (engine) engine.spawnPortalPair();
  };

  const handleSpawnSpore = () => {
    if (engine && typeof engine.spawnSpore === 'function') {
      for (let i = 0; i < 5; i++) {
        engine.spawnSpore();
      }
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
    const header = 'Timestamp (ISO 8601),Time (s),Population,Avg Speed,Avg Vision,Total Births,Total Deaths,Predators,Season\n';
    const rows = stats.historyTimeline.map(
      (item) => `${new Date(item.time * 1000).toISOString()},${item.time},${item.population},${item.avgSpeed.toFixed(2)},${item.avgVision.toFixed(1)},${stats.totalBirths},${stats.totalDeaths},${stats.predatorCount},${stats.currentSeason}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microbot_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportRunData = () => {
    if (!engine) return;
    const runData = {
      timestamp: new Date().toISOString(),
      config,
      stats,
      populationHistory: engine.populationHistory,
      birthHistory: engine.birthHistory,
      deathHistory: engine.deathHistory,
      generationCount: engine.generationCount,
      totalDeaths: engine.totalDeaths
    };
    const blob = new Blob([JSON.stringify(runData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microbot_telemetry_${Date.now()}.json`;
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

  const handleExportStateSync = () => {
    if (!engine) return;
    const hash = engine.exportState();
    navigator.clipboard.writeText(hash).then(() => {
      alert('Ecosystem state copied to clipboard as sync hash!');
    }).catch(err => {
      console.error('Failed to copy', err);
      alert('Failed to copy to clipboard.');
    });
  };

  const handleImportStateSync = () => {
    if (!engine) return;
    const hash = prompt('Paste your sync hash here:');
    if (hash) {
      engine.importState(hash);
      setStats(engine.getStats());
      alert('Ecosystem synced successfully!');
    }
  };

  const lineageData = selectedBot && engine ? engine.getLineageTree(selectedBot.id) : { parent: null, current: null, children: [] };

  // Determine dynamic biome/season tint
  let dynamicBgTint = 'radial-gradient(circle at 50% 30%, rgba(15, 30, 45, 0.6) 0%, rgba(8, 14, 20, 0.95) 70%)';
  if (stats.currentSeason === 'WINTER') {
    dynamicBgTint = 'radial-gradient(circle at 50% 30%, rgba(10, 20, 45, 0.6) 0%, rgba(5, 10, 25, 0.95) 70%)';
  } else if (stats.currentSeason === 'SUMMER') {
    dynamicBgTint = 'radial-gradient(circle at 50% 30%, rgba(45, 30, 15, 0.6) 0%, rgba(20, 14, 8, 0.95) 70%)';
  }
  if (engine?.activeDisasters.some(d => d.type === 'RADIATION_STORM' && d.active)) {
    dynamicBgTint = 'radial-gradient(circle at 50% 30%, rgba(20, 45, 15, 0.6) 0%, rgba(10, 25, 5, 0.95) 70%)';
  }

  return (
    <div className="app-container" style={{
      background: `${dynamicBgTint}, radial-gradient(circle at 80% 80%, rgba(224, 64, 251, 0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(0, 229, 255, 0.05) 0%, transparent 50%)`
    }}>
      <ErrorOverlay 
        error={simulationError} 
        onRecover={() => {
          setSimulationError(null);
          handleReset();
        }} 
      />
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
        engine={engine}
        onSelectBot={(id) => { handleSelectBotById(id); }}
        onClose={() => setIsLineageOpen(false)}
      />
      {isBlueprintOpen && (
        <BlueprintStudioModal 
          isOpen={true}
          onClose={() => setIsBlueprintOpen(false)}
          onSpawnBlueprint={handleSpawnBlueprint}
        />
      )}
      
      {isCrisprOpen && (
        <CrisprModal
          bot={selectedBot}
          onClose={() => setIsCrisprOpen(false)}
          onUpdateTraits={handleOverrideGenes}
        />
      )}

      {isNeuralOpen && selectedBot && (
        <NeuralBrainVisualizer
          bot={selectedBot}
          onClose={() => setIsNeuralOpen(false)}
        />
      )}

      {simulationError && <ErrorOverlay error={simulationError} onRecover={() => setSimulationError(null)} />}

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
        onTriggerRadiationStorm={() => engine?.triggerRadiationStorm()}
        onTriggerMagneticInversion={() => engine?.triggerMagneticInversion()}
        onTriggerSolarFlare={handleTriggerSolarFlare}
        onTriggerPortal={handleTriggerPortal}
        onExportTelemetryCSV={handleExportTelemetryCSV}
        onExportConfigJSON={handleExportConfigJSON}
        onImportConfigJSON={handleImportConfigJSON}
      />

      {/* Main Workspace Layout */}
      <main className="workspace-grid">
        {/* Left Column: Data Hub & Parameters */}
        <div className="sidebar-col">
          <div className="inspector-panel-container">
            <InspectorPanel
              bot={selectedBot}
              stats={stats}
              onClose={() => handleSelectBotById(null)}
              onOverrideGenes={handleOverrideGenes}
              onOpenLineageModal={() => setIsLineageOpen(true)}
              onOpenCrisprModal={() => setIsCrisprOpen(true)}
              onOpenNeuralModal={() => setIsNeuralOpen(true)}
            />
          </div>
          <ControlPanel 
            config={config} 
            onUpdateConfig={handleUpdateConfig} 
            onExportStateSync={handleExportStateSync}
            onImportStateSync={handleImportStateSync}
            onRunBenchmark={() => engine?.runBenchmark()}
            onSpawnSpore={handleSpawnSpore}
            onExportRunData={handleExportRunData}
          />
          {/* Dynamic Genetic Drift Heatmap & 3D Constellation */}
          <GeneticConstellation3D bots={engine?.microbots || []} />
          <GeneticDriftHeatmap bots={engine ? engine.microbots : []} />
        </div>

        {/* Right Viewport: Dual-Canvas Split View or Single Viewport */}
        <div className="main-viewport-col">
          {config.isSplitView ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, height: '100%' }}>
              <SimulationCanvas
                engine={engine}
                onSelectBot={handleSelectBotById}
                onSelectRandomBot={handleSelectRandomBot}
                onUpdateConfig={handleUpdateConfig}
              />
              <SimulationCanvas
                engine={engine}
                onSelectBot={handleSelectBotById}
                onSelectRandomBot={handleSelectRandomBot}
                onUpdateConfig={handleUpdateConfig}
              />
            </div>
          ) : (
            <SimulationCanvas
              engine={engine}
              onSelectBot={handleSelectBotById}
              onSelectRandomBot={handleSelectRandomBot}
              onUpdateConfig={handleUpdateConfig}
            />
          )}

          {/* Floating 3D Analytics Cube */}
          <AnalyticsCube3D stats={stats} />
        </div>
      </main>
    </div>
  );
};

export default App;

import React from 'react';
import { Play, Pause, RotateCcw, Cpu, HelpCircle, Target, Sparkles } from 'lucide-react';
import { SimulationConfig } from '../../simulation/types';

interface HeaderProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onReset: () => void;
  onStep: () => void;
  onSelectRandomBot: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  onReset,
  onStep,
  onSelectRandomBot,
  onOpenGuide
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-lg border-b border-cyan-500/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg sticky top-0 z-30">
      {/* Title & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-mono">
            MICROBOT <span className="text-cyan-400">EVOLUTION LAB</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            2D Autonomous Artificial Life Simulation & Genetic Trait Inheritance
          </p>
        </div>
      </div>

      {/* Preset Buttons & Quick Select */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onOpenGuide}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/80 transition"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>HOW TO PLAY</span>
        </button>

        <button
          onClick={onSelectRandomBot}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-300 bg-purple-950/70 border border-purple-500/40 hover:bg-purple-900/80 transition"
          title="Click to auto-select a microbot on canvas!"
        >
          <Target className="w-4 h-4 text-purple-400" />
          <span>🎯 SELECT BOT</span>
        </button>

        {/* Easy Presets */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 px-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400"/> PRESETS:</span>
          <button
            onClick={() => onUpdateConfig({ mutationRate: 0.25, energySpawnRate: 10.0, simSpeed: 2.0 })}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 transition"
          >
            ⚡ Fast Evolution
          </button>
          <button
            onClick={() => onUpdateConfig({ hazardCount: 8, batteryDrainMultiplier: 1.5, mutationRate: 0.20 })}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 transition"
          >
            🛡️ Survival Mode
          </button>
        </div>
      </div>

      {/* Primary Control Action Buttons */}
      <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-cyan-500/20">
        <button
          onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            config.isPaused
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
          }`}
        >
          {config.isPaused ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE</span>
            </>
          )}
        </button>

        <button
          onClick={onStep}
          disabled={!config.isPaused}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          title="Advance simulation by 1 frame"
        >
          STEP
        </button>

        <button
          onClick={onReset}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
          title="Reset Simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Sim Speed Select */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">SPEED:</span>
          <select
            value={config.simSpeed}
            onChange={(e) => onUpdateConfig({ simSpeed: parseFloat(e.target.value) })}
            className="bg-slate-900 text-cyan-400 font-mono font-bold text-xs rounded-lg border border-cyan-500/30 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
          >
            <option value="0.5">0.5x</option>
            <option value="1.0">1.0x</option>
            <option value="2.0">2.0x</option>
            <option value="3.5">3.5x</option>
            <option value="5.0">5.0x</option>
          </select>
        </div>
      </div>
    </header>
  );
};

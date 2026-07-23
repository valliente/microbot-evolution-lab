import React from 'react';
import { Sliders, Eye, Activity, ShieldAlert, Zap, Users, Dna } from 'lucide-react';
import { SimulationConfig } from '../../simulation/types';

interface ControlPanelProps {
  config: SimulationConfig;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onUpdateConfig }) => {
  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-xl border border-cyan-900/30 p-4 text-slate-200 flex flex-col space-y-4 shadow-xl">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-cyan-400">
        <Sliders className="w-4 h-4" />
        <h2 className="text-sm font-semibold tracking-wider font-mono uppercase">PARAMETERS & CONTROLS</h2>
      </div>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
        {/* Population Sliders */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-400"/> Start Population</span>
            <span className="text-cyan-400 font-bold">{config.startPopulation}</span>
          </div>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={config.startPopulation}
            onChange={(e) => onUpdateConfig({ startPopulation: parseInt(e.target.value) })}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400"/> Max Population</span>
            <span className="text-blue-400 font-bold">{config.maxPopulation}</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="25"
            value={config.maxPopulation}
            onChange={(e) => onUpdateConfig({ maxPopulation: parseInt(e.target.value) })}
            className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Mutation Rate Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><Dna className="w-3.5 h-3.5 text-purple-400"/> Mutation Rate</span>
            <span className="text-purple-400 font-bold">{(config.mutationRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.50"
            step="0.01"
            value={config.mutationRate}
            onChange={(e) => onUpdateConfig({ mutationRate: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Energy Spawn Rate Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400"/> Energy Spawn Rate</span>
            <span className="text-emerald-400 font-bold">{config.energySpawnRate.toFixed(1)}/s</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="15.0"
            step="0.5"
            value={config.energySpawnRate}
            onChange={(e) => onUpdateConfig({ energySpawnRate: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Battery Drain Rate Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-amber-400"/> Battery Drain Rate</span>
            <span className="text-amber-400 font-bold">{config.batteryDrainMultiplier.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={config.batteryDrainMultiplier}
            onChange={(e) => onUpdateConfig({ batteryDrainMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Hazard Count Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex justify-between font-mono text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-400"/> Hazard Zones</span>
            <span className="text-rose-400 font-bold">{config.hazardCount}</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={config.hazardCount}
            onChange={(e) => onUpdateConfig({ hazardCount: parseInt(e.target.value) })}
            className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Visual Toggles */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition">
            <span className="flex items-center gap-2 text-slate-300 text-xs">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Show Vision Radii
            </span>
            <input
              type="checkbox"
              checked={config.showVision}
              onChange={(e) => onUpdateConfig({ showVision: e.target.checked })}
              className="rounded accent-cyan-400 w-4 h-4 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition">
            <span className="flex items-center gap-2 text-slate-300 text-xs">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Show Movement Trails
            </span>
            <input
              type="checkbox"
              checked={config.showTrails}
              onChange={(e) => onUpdateConfig({ showTrails: e.target.checked })}
              className="rounded accent-cyan-400 w-4 h-4 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

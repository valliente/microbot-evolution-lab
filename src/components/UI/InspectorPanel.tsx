import React from 'react';
import { Crosshair, BatteryCharging, Zap, Gauge, Eye, Award, X } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface InspectorPanelProps {
  bot: Microbot | null;
  onClose: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ bot, onClose }) => {
  if (!bot) {
    return (
      <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-xl border border-cyan-900/30 p-4 text-slate-400 text-xs flex flex-col items-center justify-center text-center space-y-2 min-h-[220px]">
        <Crosshair className="w-8 h-8 text-slate-600 animate-spin-slow" />
        <p className="font-mono text-slate-300">NO MICROBOT SELECTED</p>
        <p className="text-[11px] text-slate-500 max-w-[200px]">
          Click any active microbot on the simulation canvas to inspect its traits and lineage.
        </p>
      </div>
    );
  }

  const batteryPct = Math.max(0, Math.min(100, (bot.battery / bot.maxBattery) * 100));

  const stateColors: Record<string, { bg: string; text: string; label: string }> = {
    WANDERING: { bg: 'bg-slate-800 border-slate-700', text: 'text-slate-300', label: 'WANDERING' },
    SEEKING_ENERGY: { bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400', label: 'SEEKING ENERGY' },
    EVADING_HAZARD: { bg: 'bg-rose-500/20 border-rose-500/40', text: 'text-rose-400', label: 'EVADING HAZARD' },
    REPRODUCING: { bg: 'bg-purple-500/20 border-purple-500/40', text: 'text-purple-400', label: 'REPRODUCING' }
  };

  const stateBadge = stateColors[bot.behaviorState] || stateColors.WANDERING;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 text-slate-200 flex flex-col space-y-3.5 shadow-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        title="Deselect"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header Badge */}
      <div className="flex items-center space-x-3 pr-6">
        <div
          className="w-5 h-5 rounded-full border border-white/40 shadow-md flex-shrink-0"
          style={{ backgroundColor: bot.color }}
        />
        <div>
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-cyan-300">
            {bot.id}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">GEN #{bot.generation} • PARENT: {bot.parentId || 'ORIGIN'}</div>
        </div>
      </div>

      {/* Current Behavior State */}
      <div className={`px-3 py-1.5 rounded-lg border ${stateBadge.bg} ${stateBadge.text} text-xs font-mono font-bold flex items-center justify-between`}>
        <span>BEHAVIOR STATE:</span>
        <span>{stateBadge.label}</span>
      </div>

      {/* Battery Gauge */}
      <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" /> Battery Level
          </span>
          <span className="text-cyan-400 font-bold">
            {bot.battery.toFixed(1)} / {bot.maxBattery.toFixed(0)} ({batteryPct.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              batteryPct > 40 ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : batteryPct > 20 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${batteryPct}%` }}
          />
        </div>
      </div>

      {/* Trait Matrix */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Max Speed
          </div>
          <div className="text-cyan-300 font-bold text-sm mt-0.5">{bot.speed.toFixed(2)} px/f</div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-400" /> Vision Radius
          </div>
          <div className="text-blue-300 font-bold text-sm mt-0.5">{bot.visionRadius.toFixed(0)} px</div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Efficiency
          </div>
          <div className="text-emerald-300 font-bold text-sm mt-0.5">{bot.energyEfficiency.toFixed(2)}x</div>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" /> Offspring
          </div>
          <div className="text-amber-300 font-bold text-sm mt-0.5">{bot.offspringCount}</div>
        </div>
      </div>

      {/* Age & Metrics */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
        <span>AGE: {Math.floor(bot.age / 60)}s ({bot.age} frames)</span>
        <span>ENERGY COLLECTED: {Math.floor(bot.energyCollected)}</span>
      </div>
    </div>
  );
};

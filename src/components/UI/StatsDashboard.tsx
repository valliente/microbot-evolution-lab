import React from 'react';
import { Users, Dna, PlusCircle, Skull, Gauge, Eye, Zap } from 'lucide-react';
import { SimulationStats } from '../../simulation/types';
import { PopulationChart } from '../Canvas/PopulationChart';

interface StatsDashboardProps {
  stats: SimulationStats;
  maxPopulation: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, maxPopulation }) => {
  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md rounded-xl border border-cyan-900/30 p-4 text-slate-200 flex flex-col space-y-4 shadow-xl">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> POPULATION
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{stats.currentPopulation}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-purple-500/20 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Dna className="w-3.5 h-3.5 text-purple-400" /> PEAK GEN
          </div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">#{stats.highestGen}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-emerald-500/20 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> TOTAL BIRTHS
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats.totalBirths}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-500/20 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Skull className="w-3.5 h-3.5 text-rose-400" /> TOTAL DEATHS
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">{stats.totalDeaths}</div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-300" /> AVG SPEED
          </div>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-1">{stats.avgSpeed} <span className="text-[10px] text-slate-500">px/f</span></div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-300" /> AVG VISION
          </div>
          <div className="text-lg font-bold font-mono text-blue-300 mt-1">{stats.avgVisionRadius} <span className="text-[10px] text-slate-500">px</span></div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-300" /> AVG EFFICIENCY
          </div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-1">{stats.avgEnergyEfficiency}x</div>
        </div>
      </div>

      {/* Population History Chart */}
      <PopulationChart history={stats.history} maxPopulation={maxPopulation} />
    </div>
  );
};

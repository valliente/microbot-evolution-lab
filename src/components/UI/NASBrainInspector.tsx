import React from 'react';
import { Microbot } from '../../simulation/types';
import { Cpu, RefreshCw, Zap } from 'lucide-react';

interface NASBrainInspectorProps {
  bot: Microbot | null;
}

export const NASBrainInspector: React.FC<NASBrainInspectorProps> = ({ bot }) => {
  if (!bot || !bot.nasBrain) {
    return (
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-slate-400 text-xs font-mono">
        No NAS Brain Architecture Detected
      </div>
    );
  }

  const { nodes, connections, layerDepth, passiveEnergyCost } = bot.nasBrain;
  const recurrentConnections = connections.filter(c => c.isRecurrent);

  return (
    <div className="p-4 bg-slate-900/80 rounded-xl border border-purple-500/40 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-purple-500/30 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-xs font-bold text-purple-300">
            NAS RECURRENT BRAIN INSPECTOR
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">
          DEPTH: L{layerDepth}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-800/50 border border-slate-700/40">
          <span className="text-slate-400 block text-[10px]">TOTAL NODES</span>
          <span className="text-purple-300 font-bold">{nodes.length}</span>
        </div>
        <div className="p-2 rounded bg-slate-800/50 border border-slate-700/40">
          <span className="text-slate-400 block text-[10px]">RECURRENT LOOPS</span>
          <span className="text-cyan-400 font-bold">{recurrentConnections.length}</span>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-[11px] font-mono text-slate-300 font-semibold mb-1 flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-cyan-400" /> RECURRENT MEMORY NODES
        </span>
        <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
          {nodes.map((node) => (
            <div key={node.id} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">{node.id} (L{node.layer})</span>
              <span className="text-emerald-400">[{node.activation}]</span>
              <span className="text-cyan-300">MEM: {node.recurrentMemory.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> PASSIVE DRAIN:
        </span>
        <span className="text-amber-300 font-bold">-{passiveEnergyCost.toFixed(3)} E/sec</span>
      </div>
    </div>
  );
};

import React from 'react';
import { HelpCircle, X, Zap, ShieldAlert, Dna, MousePointer, Play } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 text-cyan-400">
          <HelpCircle className="w-6 h-6 animate-pulse" />
          <h2 className="text-lg font-bold font-mono">HOW TO PLAY - QUICK GUIDE</h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-start space-x-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-400 text-sm">1. GREEN ENERGY PARTICLES</h3>
              <p className="text-slate-300 mt-0.5">
                Microbots search for glowing green dots. Eating them restores battery power!
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-rose-400 text-sm">2. RED HAZARD ZONES</h3>
              <p className="text-slate-300 mt-0.5">
                Red pulsing circles drain battery fast. Microbots learn to steer away from them.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 flex-shrink-0">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-purple-400 text-sm">3. EVOLUTION & MUTATION</h3>
              <p className="text-slate-300 mt-0.5">
                When a microbot collects enough energy, it reproduces! Children inherit mutated speed, vision, and efficiency.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 flex-shrink-0">
              <MousePointer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 text-sm">4. EASY SELECT & TRACK</h3>
              <p className="text-slate-300 mt-0.5">
                Click any microbot on the screen or press <span className="text-cyan-300 font-mono font-bold">"🎯 SELECT BOT"</span> to inspect its battery, age, traits, and offspring!
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>LET'S PLAY!</span>
          </button>
        </div>
      </div>
    </div>
  );
};

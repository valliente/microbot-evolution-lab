import React, { useEffect, useState, useRef } from 'react';
import { Brain, X, Activity } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface NeuralBrainVisualizerProps {
  bot: Microbot;
  onClose: () => void;
}

export const NeuralBrainVisualizer: React.FC<NeuralBrainVisualizerProps> = ({ bot, onClose }) => {
  const [pulsePhase, setPulsePhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animate the neural pulses
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const inputs = [
      { label: 'ENERGY', val: bot.battery / bot.maxBattery },
      { label: 'VISION', val: bot.visionRadius / 300 },
      { label: 'PANIC', val: bot.panicTimer && bot.panicTimer > 0 ? 1 : 0 },
      { label: 'AGE', val: Math.min(bot.age / 5000, 1) }
    ];

    const hiddenNodes = [
      { val: Math.sin(pulsePhase + 0) * 0.5 + 0.5 },
      { val: Math.sin(pulsePhase + 1) * 0.5 + 0.5 },
      { val: Math.sin(pulsePhase + 2) * 0.5 + 0.5 },
      { val: Math.sin(pulsePhase + 3) * 0.5 + 0.5 },
      { val: Math.sin(pulsePhase + 4) * 0.5 + 0.5 }
    ];

    const outputs = [
      { label: 'SPEED', val: bot.speed / bot.maxSpeed },
      { label: 'TURN', val: bot.turnRate / 0.5 },
      { label: 'ADHESION', val: bot.genome?.adhesionGene?.baseValue || 0 }
    ];

    const layers = [inputs, hiddenNodes, outputs];
    const width = canvas.width;
    const height = canvas.height;
    
    const layerXs = [50, width / 2, width - 50];

    // Draw Connections
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayer = layers[l];
      const nextLayer = layers[l + 1];
      const currX = layerXs[l];
      const nextX = layerXs[l + 1];

      currentLayer.forEach((node, i) => {
        const currY = (height / (currentLayer.length + 1)) * (i + 1);
        nextLayer.forEach((_, j) => {
          const nextY = (height / (nextLayer.length + 1)) * (j + 1);
          
          const pseudoWeight = ((i * 3 + j * 7 + bot.id.charCodeAt(0)) % 10) / 10;
          const activity = node.val * pseudoWeight;
          
          ctx.beginPath();
          ctx.moveTo(currX, currY);
          ctx.lineTo(nextX, nextY);
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 + activity * 0.4})`;
          ctx.lineWidth = 1 + activity * 2;
          ctx.stroke();

          // Pulse particle
          const p = (Math.sin(pulsePhase + pseudoWeight * 5) + 1) / 2;
          const px = currX + (nextX - currX) * p;
          const py = currY + (nextY - currY) * p;
          
          if (activity > 0.3) {
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${activity})`;
            ctx.fill();
          }
        });
      });
    }

    // Draw Nodes
    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      const x = layerXs[l];
      layer.forEach((node, i) => {
        const y = (height / (layer.length + 1)) * (i + 1);
        
        ctx.beginPath();
        ctx.arc(x, y, 8 + node.val * 4, 0, Math.PI * 2);
        ctx.fillStyle = l === 1 ? '#E040FB' : '#00E5FF';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if ((node as any).label) {
          ctx.fillStyle = '#8B949E';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = l === 0 ? 'right' : 'left';
          const lx = l === 0 ? x - 20 : x + 20;
          ctx.fillText((node as any).label, lx, y + 4);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText((node.val * 100).toFixed(0) + '%', lx, y + 16);
        }
      });
    }

  }, [bot, pulsePhase]);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(5, 8, 12, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="glass-panel" style={{
        width: '600px', height: '450px', position: 'relative',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 50px rgba(0, 229, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(0, 229, 255, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain style={{ width: 20, height: 20, color: '#E040FB' }} />
            <h2 style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff', fontSize: '1.1rem', margin: 0 }}>
              LIVE NEURAL BRAIN VISUALIZER
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 24, height: 24 }} />
          </button>
        </div>

        <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(0,0,0,0.2)' }}>
           <div>
             <span style={{ fontSize: '0.7rem', color: '#8B949E', fontFamily: "'JetBrains Mono', monospace" }}>BOT ID</span>
             <div style={{ color: '#00E5FF', fontWeight: 700 }}>{bot.id}</div>
           </div>
           <div>
             <span style={{ fontSize: '0.7rem', color: '#8B949E', fontFamily: "'JetBrains Mono', monospace" }}>BEHAVIOR STATE</span>
             <div style={{ color: '#E040FB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity style={{ width: 14, height: 14 }} /> {bot.behaviorState}
             </div>
           </div>
        </div>

        <div style={{ flex: 1, padding: 20, position: 'relative' }}>
          <canvas ref={canvasRef} width={560} height={320} style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.4))' }} />
        </div>
      </div>
    </div>
  );
};

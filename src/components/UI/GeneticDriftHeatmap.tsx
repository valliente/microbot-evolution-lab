import React, { useRef, useEffect } from 'react';
import { SimulationStats, Microbot } from '../../simulation/types';
import { Activity } from 'lucide-react';

interface GeneticDriftHeatmapProps {
  stats: SimulationStats;
  bots: Microbot[];
}

export const GeneticDriftHeatmap: React.FC<GeneticDriftHeatmapProps> = ({ stats, bots }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Clear background
      ctx.fillStyle = '#060A10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      ctx.globalCompositeOperation = 'screen';
      
      // Plot bots: X = Speed (1..5), Y = Efficiency (0.6..2.5)
      bots.forEach(bot => {
        // Map speed [1, 5] to X [10, canvas.width - 10]
        const speedNorm = Math.max(0, Math.min(1, (bot.speed - 1) / 4));
        const px = 10 + speedNorm * (canvas.width - 20);

        // Map efficiency [0.6, 2.5] to Y [canvas.height - 10, 10] (inverted)
        const effNorm = Math.max(0, Math.min(1, (bot.energyEfficiency - 0.6) / 1.9));
        const py = canvas.height - 10 - effNorm * (canvas.height - 20);

        // Draw soft glowing dot
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 6);
        grad.addColorStop(0, bot.color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';

      // Axis Labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = "8px 'JetBrains Mono'";
      ctx.fillText('SPEED →', canvas.width / 2 - 15, canvas.height - 4);
      
      ctx.save();
      ctx.translate(8, canvas.height / 2 + 25);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('EFFICIENCY →', 0, 0);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [bots]);

  return (
    <div style={{
      background: 'rgba(8, 14, 20, 0.75)',
      borderRadius: 10,
      border: '1px solid rgba(0, 229, 255, 0.25)',
      padding: '10px',
      marginTop: 8
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem',
        fontWeight: 800,
        color: '#00E5FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity style={{ width: 13, height: 13 }} /> 2D GENETIC DRIFT
        </span>
        <span style={{ color: '#8B949E', fontSize: '0.65rem' }}>Speed vs Efficiency</span>
      </div>

      <canvas ref={canvasRef} width={180} height={140} style={{ borderRadius: 8, border: '1px solid rgba(0,229,255,0.1)' }} />
    </div>
  );
};

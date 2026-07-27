import React, { useRef, useEffect } from 'react';
import { Microbot } from '../../simulation/types';

interface GeneticConstellation3DProps {
  bots: Microbot[];
}

export const GeneticConstellation3D: React.FC<GeneticConstellation3DProps> = ({ bots }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      angle += 0.015;
      ctx.fillStyle = '#060A10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const rad = 80;

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;

      // Project 3D constellation nodes
      bots.slice(0, 40).forEach((bot, i) => {
        const theta = (i / Math.min(40, bots.length)) * Math.PI * 2 + angle;
        const phi = (bot.hue / 360) * Math.PI;
        const x3d = rad * Math.sin(phi) * Math.cos(theta);
        const y3d = rad * Math.sin(phi) * Math.sin(theta);
        const z3d = rad * Math.cos(phi);

        const scale = 180 / (180 + z3d);
        const px = cx + x3d * scale;
        const py = cy + y3d * scale;

        ctx.fillStyle = bot.color || '#00E5FF';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, 4 * scale), 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [bots]);

  return (
    <div style={{ background: 'rgba(11, 15, 25, 0.85)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 12, padding: 8 }}>
      <div style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E5FF', fontWeight: 800, marginBottom: 4 }}>
        3D GENETIC CONSTELLATION MAP
      </div>
      <canvas ref={canvasRef} width={180} height={130} style={{ borderRadius: 8 }} />
    </div>
  );
};

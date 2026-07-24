import React, { useRef, useEffect } from 'react';
import { SimulationStats } from '../../simulation/types';

interface PopulationChartProps {
  history: SimulationStats['historyTimeline'];
  maxPopulation: number;
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ history, maxPopulation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (history.length < 2) return;

    // Draw sparkline curve for population over time
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const stepX = w / (history.length - 1);
    for (let i = 0; i < history.length; i++) {
      const x = i * stepX;
      const y = h - (history[i].population / Math.max(1, maxPopulation)) * h * 0.85 - 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Fill gradient area below line
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fill();
  }, [history, maxPopulation]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={36}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
};

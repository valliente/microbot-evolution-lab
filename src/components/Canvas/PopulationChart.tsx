import React, { useRef, useEffect } from 'react';
import { HistoryDataPoint } from '../../simulation/types';

interface PopulationChartProps {
  history: HistoryDataPoint[];
  maxPopulation: number;
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ history, maxPopulation }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    if (history.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Accumulating simulation history...', w / 2, h / 2);
      ctx.restore();
      return;
    }

    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 12;
    const paddingBottom = 20;

    const graphW = w - paddingLeft - paddingRight;
    const graphH = h - paddingTop - paddingBottom;

    const maxVal = Math.max(maxPopulation * 1.1, Math.max(...history.map((h) => h.population)) + 10);

    // Horizontal gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const steps = 3;
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxVal / steps) * i);
      const y = h - paddingBottom - (graphH / steps) * i;

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w - paddingRight, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), paddingLeft - 4, y + 3);
    }

    // Render Population Line & Area Fill
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const pt = history[i];
      const x = paddingLeft + (i / (history.length - 1)) * graphW;
      const y = h - paddingBottom - (pt.population / maxVal) * graphH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    // Line gradient
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Area fill gradient
    const fillGrad = ctx.createLinearGradient(0, paddingTop, 0, h - paddingBottom);
    fillGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    fillGrad.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

    ctx.lineTo(paddingLeft + graphW, h - paddingBottom);
    ctx.lineTo(paddingLeft, h - paddingBottom);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // X-Axis Label
    ctx.fillStyle = '#64748b';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (seconds)', paddingLeft + graphW / 2, h - 4);

    ctx.restore();
  }, [history, maxPopulation]);

  return (
    <div className="w-full h-full min-h-[110px] relative rounded-lg border border-slate-800 bg-[#0b0f19] p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1 px-1">
        <span>POPULATION HISTORY</span>
        <span className="text-cyan-400 font-mono text-[10px]">LIVE SNAPSHOT</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[75px] block" />
    </div>
  );
};

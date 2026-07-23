import React, { useRef, useEffect } from 'react';
import { MicrobotEngine } from '../../simulation/MicrobotEngine';

interface SimulationCanvasProps {
  engine: MicrobotEngine;
  onSelectBot: (botId: string | null) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ engine, onSelectBot }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      engine.resize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    const render = () => {
      // Step simulation update
      engine.update();

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.scale(dpr, dpr);

        const w = engine.width;
        const h = engine.height;

        // 1. Clear background
        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, w, h);

        // Subtle background sci-fi grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.035)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        ctx.beginPath();
        for (let x = 0; x < w; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();

        // 2. Render Hazard Zones
        for (let i = 0; i < engine.hazards.length; i++) {
          const hz = engine.hazards[i];
          const pulse = Math.sin(hz.pulsePhase) * 0.15 + 1.0;
          const currentRadius = hz.radius * pulse;

          // Outer glowing radial gradient
          const grad = ctx.createRadialGradient(hz.x, hz.y, hz.radius * 0.2, hz.x, hz.y, currentRadius);
          grad.addColorStop(0, 'rgba(255, 45, 85, 0.25)');
          grad.addColorStop(0.7, 'rgba(255, 45, 85, 0.10)');
          grad.addColorStop(1, 'rgba(255, 45, 85, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(hz.x, hz.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // Border ring
          ctx.strokeStyle = 'rgba(255, 45, 85, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 3. Render Energy Particles
        for (let i = 0; i < engine.energyParticles.length; i++) {
          const ep = engine.energyParticles[i];

          // Particle glow
          const epGrad = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, ep.radius * 2.8);
          epGrad.addColorStop(0, 'rgba(57, 255, 20, 0.9)');
          epGrad.addColorStop(0.5, 'rgba(57, 255, 20, 0.4)');
          epGrad.addColorStop(1, 'rgba(57, 255, 20, 0)');

          ctx.fillStyle = epGrad;
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          // Core dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Render Movement Trails (if enabled)
        if (engine.config.showTrails) {
          for (let i = 0; i < engine.microbots.length; i++) {
            const bot = engine.microbots[i];
            if (bot.trail.length > 1) {
              ctx.beginPath();
              ctx.moveTo(bot.trail[0].x, bot.trail[0].y);
              for (let t = 1; t < bot.trail.length; t++) {
                ctx.lineTo(bot.trail[t].x, bot.trail[t].y);
              }
              ctx.strokeStyle = bot.color;
              ctx.globalAlpha = 0.25;
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }
          }
        }

        // 5. Render Vision Circles (if enabled)
        if (engine.config.showVision) {
          for (let i = 0; i < engine.microbots.length; i++) {
            const bot = engine.microbots[i];
            ctx.strokeStyle = bot.color;
            ctx.globalAlpha = 0.12;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bot.x, bot.y, bot.visionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }

        // 6. Render Microbots
        const selectedBotId = engine.selectedMicrobotId;

        for (let i = 0; i < engine.microbots.length; i++) {
          const bot = engine.microbots[i];
          const isSelected = bot.id === selectedBotId;

          ctx.save();
          ctx.translate(bot.x, bot.y);

          // Selection highlight crosshair ring
          if (isSelected) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.stroke();

            // Corner ticks
            const tLen = 6;
            ctx.beginPath();
            ctx.moveTo(-22, 0); ctx.lineTo(-22 + tLen, 0);
            ctx.moveTo(22, 0); ctx.lineTo(22 - tLen, 0);
            ctx.moveTo(0, -22); ctx.lineTo(0, -22 + tLen);
            ctx.moveTo(0, 22); ctx.lineTo(0, 22 - tLen);
            ctx.stroke();

            // Vision highlight for selected bot
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, bot.visionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Orient canvas towards microbot heading
          ctx.rotate(bot.heading);

          // Microbot body (Futuristic triangle/pod shape)
          const botSize = 9;
          ctx.fillStyle = bot.color;
          ctx.beginPath();
          ctx.moveTo(botSize + 2, 0); // Nose tip
          ctx.lineTo(-botSize + 1, -botSize + 2); // Rear left
          ctx.lineTo(-botSize * 0.4, 0); // Rear center notch
          ctx.lineTo(-botSize + 1, botSize - 2); // Rear right
          ctx.closePath();
          ctx.fill();

          // Outer outline
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Nose sensor light
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(botSize, 0, 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Battery indicator bar above microbot
          const barW = 16;
          const barH = 3;
          const pct = Math.max(0, Math.min(1, bot.battery / bot.maxBattery));

          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(bot.x - barW / 2, bot.y - 14, barW, barH);

          ctx.fillStyle = pct > 0.4 ? '#00f0ff' : pct > 0.2 ? '#ffb000' : '#ff2d55';
          ctx.fillRect(bot.x - barW / 2, bot.y - 14, barW * pct, barH);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [engine]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bot = engine.selectMicrobotAt(x, y);
    onSelectBot(bot ? bot.id : null);
  };

  return (
    <div ref={containerRef} className="canvas-container relative w-full h-full min-h-[450px] overflow-hidden rounded-xl border border-cyan-900/30 bg-[#080c14] shadow-2xl">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />
      <div className="absolute top-3 left-3 pointer-events-none text-xs font-mono text-cyan-400/70 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-500/20">
        CANVAS VIEWPORT: {engine.width}x{engine.height}
      </div>
    </div>
  );
};

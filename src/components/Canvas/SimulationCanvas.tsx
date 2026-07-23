import React, { useRef, useEffect } from 'react';
import { MicrobotEngine } from '../../simulation/MicrobotEngine';
import { Target } from 'lucide-react';

interface SimulationCanvasProps {
  engine: MicrobotEngine;
  onSelectBot: (botId: string | null) => void;
  onSelectRandomBot: () => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ engine, onSelectBot, onSelectRandomBot }) => {
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
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();

            // Corner ticks
            const tLen = 7;
            ctx.beginPath();
            ctx.moveTo(-24, 0); ctx.lineTo(-24 + tLen, 0);
            ctx.moveTo(24, 0); ctx.lineTo(24 - tLen, 0);
            ctx.moveTo(0, -24); ctx.lineTo(0, -24 + tLen);
            ctx.moveTo(0, 24); ctx.lineTo(0, 24 - tLen);
            ctx.stroke();

            // Floating ID Label above bot
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(bot.id, 0, -28);

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

  const selectedBot = engine.getSelectedMicrobot();

  return (
    <div ref={containerRef} className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="canvas-element"
      />

      {/* Floating Auto-Tracking Banner at Top Center */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: 20,
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: '0.75rem',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#ffffff',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00f0ff' }}>
          <Target style={{ width: 14, height: 14 }} />
          <span>TRACKING: <strong style={{ color: '#ffffff' }}>{selectedBot ? selectedBot.id : 'SEARCHING...'}</strong></span>
        </div>
        <button
          onClick={onSelectRandomBot}
          className="btn btn-purple"
          style={{ padding: '2px 8px', fontSize: '0.65rem' }}
        >
          SWITCH BOT
        </button>
      </div>
    </div>
  );
};

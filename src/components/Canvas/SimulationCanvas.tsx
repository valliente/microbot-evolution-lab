import React, { useRef, useEffect } from 'react';
import { MicrobotEngine } from '../../simulation/MicrobotEngine';
import { Target, MousePointerClick } from 'lucide-react';

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
      const w = Math.max(600, Math.floor(container.clientWidth || rect.width || 1000));
      const h = Math.max(450, Math.floor(container.clientHeight || rect.height || 600));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
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
      // Execute engine step frame
      engine.update();

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.scale(dpr, dpr);

        const w = engine.width;
        const h = engine.height;

        // 1. Clear background & draw rich grid
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, w, h);

        // Tech grid lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 45;
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

        // 2. Render Hazard Zones (Pulsing Red Energy Disks)
        for (let i = 0; i < engine.hazards.length; i++) {
          const hz = engine.hazards[i];
          const pulse = Math.sin(hz.pulsePhase) * 0.15 + 1.0;
          const currentRadius = hz.radius * pulse;

          // Glowing radial gradient
          const grad = ctx.createRadialGradient(hz.x, hz.y, hz.radius * 0.1, hz.x, hz.y, currentRadius);
          grad.addColorStop(0, 'rgba(255, 45, 85, 0.35)');
          grad.addColorStop(0.7, 'rgba(255, 45, 85, 0.15)');
          grad.addColorStop(1, 'rgba(255, 45, 85, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(hz.x, hz.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // Border ring & label
          ctx.strokeStyle = '#ff2d55';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([8, 5]);
          ctx.beginPath();
          ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(255, 45, 85, 0.7)';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('HAZARD ZONE', hz.x, hz.y + 3);
        }

        // 3. Render Green Energy Particles (Glowing Food Orbs)
        for (let i = 0; i < engine.energyParticles.length; i++) {
          const ep = engine.energyParticles[i];

          // Soft green radial aura
          const epGrad = ctx.createRadialGradient(ep.x, ep.y, 0, ep.x, ep.y, ep.radius * 3.5);
          epGrad.addColorStop(0, 'rgba(57, 255, 20, 1.0)');
          epGrad.addColorStop(0.5, 'rgba(57, 255, 20, 0.4)');
          epGrad.addColorStop(1, 'rgba(57, 255, 20, 0)');

          ctx.fillStyle = epGrad;
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Bright white center core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Render Movement Trails
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
              ctx.globalAlpha = 0.35;
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }
          }
        }

        // 5. Render Vision Circles
        if (engine.config.showVision) {
          for (let i = 0; i < engine.microbots.length; i++) {
            const bot = engine.microbots[i];
            ctx.strokeStyle = bot.color;
            ctx.globalAlpha = 0.15;
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

          // Selection Reticle & Crosshair
          if (isSelected) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.stroke();

            // Corner ticks
            const tLen = 8;
            ctx.beginPath();
            ctx.moveTo(-28, 0); ctx.lineTo(-28 + tLen, 0);
            ctx.moveTo(28, 0); ctx.lineTo(28 - tLen, 0);
            ctx.moveTo(0, -28); ctx.lineTo(0, -28 + tLen);
            ctx.moveTo(0, 28); ctx.lineTo(0, 28 - tLen);
            ctx.stroke();

            // Floating Label above microbot
            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`★ ${bot.id} (${bot.behaviorState.replace('_', ' ')})`, 0, -32);

            // Vision highlight for selected bot
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, bot.visionRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Orient canvas towards microbot heading
          ctx.rotate(bot.heading);

          // Microbot body (Large triangular pod)
          const botSize = 11;
          ctx.fillStyle = bot.color;
          ctx.beginPath();
          ctx.moveTo(botSize + 3, 0); // Nose tip
          ctx.lineTo(-botSize, -botSize + 2); // Rear left
          ctx.lineTo(-botSize * 0.4, 0); // Notch
          ctx.lineTo(-botSize, botSize - 2); // Rear right
          ctx.closePath();
          ctx.fill();

          // Outer glowing outline
          ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Sensor headlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(botSize + 1, 0, 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Battery gauge bar above microbot
          const barW = 20;
          const barH = 4;
          const pct = Math.max(0, Math.min(1, bot.battery / bot.maxBattery));

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(bot.x - barW / 2, bot.y - 16, barW, barH);

          ctx.fillStyle = pct > 0.4 ? '#00f0ff' : pct > 0.2 ? '#ffb000' : '#ff2d55';
          ctx.fillRect(bot.x - barW / 2, bot.y - 16, barW * pct, barH);
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

    // Check microbot selection click
    const bot = engine.selectMicrobotAt(x, y);
    if (bot) {
      onSelectBot(bot.id);
    } else {
      // Spawn 5 food particles at click location!
      for (let i = 0; i < 5; i++) {
        engine.energyParticles.push({
          id: `E-${Math.random().toString(36).substr(2, 6)}`,
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          value: 40,
          radius: 5
        });
      }
    }
  };

  const selectedBot = engine.getSelectedMicrobot();

  return (
    <div ref={containerRef} className="canvas-wrapper" style={{ height: '560px', minHeight: '480px' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="canvas-element"
      />

      {/* Floating Auto-Tracking Banner at Top Center */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        borderRadius: 24,
        padding: '6px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: '0.8rem',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00f0ff', fontWeight: 700 }}>
          <Target style={{ width: 16, height: 16 }} />
          <span>TRACKING: <strong style={{ color: '#ffffff' }}>{selectedBot ? `${selectedBot.id}` : 'ACTIVE'}</strong></span>
        </div>
        <button
          onClick={onSelectRandomBot}
          className="btn btn-purple"
          style={{ padding: '3px 10px', fontSize: '0.7rem' }}
        >
          SWITCH BOT
        </button>
      </div>

      {/* Click Canvas Helper Hint */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 14,
        background: 'rgba(3, 7, 18, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: '4px 10px',
        fontSize: '0.7rem',
        fontFamily: "'JetBrains Mono', monospace",
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none'
      }}>
        <MousePointerClick style={{ width: 14, height: 14, color: '#34d399' }} />
        <span>Click anywhere on canvas to drop food!</span>
      </div>
    </div>
  );
};

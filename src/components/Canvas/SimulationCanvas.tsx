import React, { useRef, useEffect } from 'react';
import { MicrobotEngine } from '../../simulation/MicrobotEngine';
import { Target, MousePointerClick } from 'lucide-react';

interface SimulationCanvasProps {
  engine: MicrobotEngine;
  onSelectBot: (botId: string | null) => void;
  onSelectRandomBot: () => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  engine,
  onSelectBot,
  onSelectRandomBot
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resize Observer for pixel-perfect dynamic canvas viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCanvasDimensions = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(600, Math.floor(container.clientWidth || rect.width || 1000));
      const height = Math.max(400, Math.floor(container.clientHeight || rect.height || 650));

      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
        engine.resize(width, height);
      }
    };

    updateCanvasDimensions();
    const resizeObserver = new ResizeObserver(updateCanvasDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [engine]);

  // Main 60 FPS RequestAnimationFrame Canvas Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Update physics & simulation state
          engine.update(1.0);

          // Clear Canvas
          ctx.fillStyle = '#030712';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Subtle Tech Grid Background Pattern
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          const gridSize = 40;
          for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // 1. Draw Hazard Zones (Pulsing Red Warning Rings)
          for (const hazard of engine.hazards) {
            const pulse = Math.sin(Date.now() / 300) * 4;
            const r = Math.max(10, hazard.radius + pulse);

            const grad = ctx.createRadialGradient(hazard.x, hazard.y, 5, hazard.x, hazard.y, r);
            grad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
            grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.15)');
            grad.addColorStop(1, 'rgba(244, 63, 94, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // 2. Draw Energy Particles (Glowing Emerald Dots)
          for (const food of engine.energyParticles) {
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // 3. Draw Microbots
          const selectedBot = engine.getSelectedMicrobot();

          for (const bot of engine.microbots) {
            const isSelected = selectedBot && selectedBot.id === bot.id;

            // Movement Trail
            if (engine.config.showMovementTrails && bot.trail.length > 1) {
              ctx.strokeStyle = bot.color;
              ctx.lineWidth = 1.5;
              ctx.globalAlpha = 0.25;
              ctx.beginPath();
              ctx.moveTo(bot.trail[0].x, bot.trail[0].y);
              for (let i = 1; i < bot.trail.length; i++) {
                ctx.lineTo(bot.trail[i].x, bot.trail[i].y);
              }
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }

            // Vision Ring (for selected bot or toggle)
            if (isSelected || engine.config.showSensoryRings) {
              ctx.strokeStyle = isSelected ? '#00f0ff' : 'rgba(255, 255, 255, 0.08)';
              ctx.lineWidth = isSelected ? 1.5 : 0.8;
              ctx.beginPath();
              ctx.arc(bot.x, bot.y, bot.visionRadius, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Target Vector Line
            if (isSelected && engine.config.showTargetVectors) {
              ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
              ctx.lineWidth = 1;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(bot.x, bot.y);
              ctx.lineTo(bot.x + Math.cos(bot.heading) * bot.visionRadius * 0.8, bot.y + Math.sin(bot.heading) * bot.visionRadius * 0.8);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Microbot Body Capsule / Pod Shape
            ctx.save();
            ctx.translate(bot.x, bot.y);
            ctx.rotate(bot.heading);

            // Glow Effect
            ctx.shadowColor = bot.color;
            ctx.shadowBlur = isSelected ? 18 : 8;

            // Outer Body Shell
            ctx.fillStyle = bot.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Headlight / Eye Nose Cone
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();

            // Battery Health Indicator Bar
            const batteryRatio = Math.max(0, Math.min(1, bot.battery / bot.maxBattery));
            const barW = 20;
            const barH = 3;
            const barX = bot.x - barW / 2;
            const barY = bot.y - 14;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barW, barH);

            ctx.fillStyle = batteryRatio > 0.4 ? '#34d399' : batteryRatio > 0.2 ? '#fbbf24' : '#f43f5e';
            ctx.fillRect(barX, barY, barW * batteryRatio, barH);

            // Selected Target Crosshair Indicator
            if (isSelected) {
              const reticlePulse = Math.sin(Date.now() / 200) * 3;
              const reticleR = 18 + reticlePulse;

              ctx.strokeStyle = '#00f0ff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bot.x, bot.y, reticleR, 0, Math.PI * 2);
              ctx.stroke();

              // Crosshair Tick Marks
              ctx.beginPath();
              ctx.moveTo(bot.x - reticleR - 4, bot.y); ctx.lineTo(bot.x - reticleR + 2, bot.y);
              ctx.moveTo(bot.x + reticleR + 4, bot.y); ctx.lineTo(bot.x + reticleR - 2, bot.y);
              ctx.moveTo(bot.x, bot.y - reticleR - 4); ctx.lineTo(bot.x, bot.y - reticleR + 2);
              ctx.moveTo(bot.x, bot.y + reticleR + 4); ctx.lineTo(bot.x, bot.y + reticleR - 2);
              ctx.stroke();

              // Text Badge Label
              ctx.font = "800 11px 'JetBrains Mono', monospace";
              ctx.fillStyle = '#00f0ff';
              ctx.textAlign = 'center';
              ctx.fillText(`★ ${bot.id} (${bot.behaviorState.replace('_', ' ')})`, bot.x, bot.y - 22);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [engine]);

  // Handle Canvas Clicks: Select microbot or spawn food dot directly at cursor
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked near an existing microbot (expanded hit radius = 28px)
    let clickedBot = null;
    let minDist = 28;

    for (const bot of engine.microbots) {
      const dist = Math.hypot(bot.x - clickX, bot.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        clickedBot = bot;
      }
    }

    if (clickedBot) {
      onSelectBot(clickedBot.id);
    } else {
      // Spawn 5 energy dots at click location
      for (let i = 0; i < 5; i++) {
        engine.spawnFood(
          clickX + (Math.random() - 0.5) * 20,
          clickY + (Math.random() - 0.5) * 20
        );
      }
    }
  };

  const selectedBot = engine.getSelectedMicrobot();

  return (
    <div ref={containerRef} className="canvas-container" style={{ width: '100%', height: '100%' }}>
      {/* Top Banner showing live auto-tracked Microbot */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(3, 7, 18, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: selectedBot ? selectedBot.color : '#00f0ff',
            boxShadow: '0 0 10px ' + (selectedBot ? selectedBot.color : '#00f0ff')
          }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
            TRACKING: {selectedBot ? selectedBot.id : 'SEARCHING...'}
          </span>
          {selectedBot && (
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
              (GEN #{selectedBot.generation} • {selectedBot.behaviorState.replace('_', ' ')})
            </span>
          )}
        </div>

        <button onClick={onSelectRandomBot} className="btn btn-cyan" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
          <Target style={{ width: 12, height: 12 }} />
          <span>SWITCH BOT</span>
        </button>
      </div>

      {/* Main Simulation Viewport Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
      />

      {/* Click Tip Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 10,
        background: 'rgba(3, 7, 18, 0.75)',
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.68rem',
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

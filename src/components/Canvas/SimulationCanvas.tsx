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

  // Resize Observer for dynamic canvas viewport
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

  // Main 60 FPS Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Update physics
          engine.update(1.0);

          // Clear Canvas Void
          ctx.fillStyle = '#060B10';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw Glowing Grid Pattern
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
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

          // 1. Draw Hazard Zones (Orange Wireframe Mesh & Glow)
          for (const hazard of engine.hazards) {
            const pulse = Math.sin(Date.now() / 350) * 4;
            const r = Math.max(10, hazard.radius + pulse);

            // Outer Radial Glow
            const grad = ctx.createRadialGradient(hazard.x, hazard.y, 5, hazard.x, hazard.y, r);
            grad.addColorStop(0, 'rgba(255, 107, 0, 0.35)');
            grad.addColorStop(0.7, 'rgba(255, 107, 0, 0.15)');
            grad.addColorStop(1, 'rgba(255, 107, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Hazard Mesh Wireframe Circles
            ctx.strokeStyle = 'rgba(255, 107, 0, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Inner Wireframe Cross
            ctx.strokeStyle = 'rgba(255, 107, 0, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(hazard.x - hazard.radius * 0.7, hazard.y);
            ctx.lineTo(hazard.x + hazard.radius * 0.7, hazard.y);
            ctx.moveTo(hazard.x, hazard.y - hazard.radius * 0.7);
            ctx.lineTo(hazard.x, hazard.y + hazard.radius * 0.7);
            ctx.stroke();

            // Label
            ctx.font = "800 9px 'JetBrains Mono', monospace";
            ctx.fillStyle = 'rgba(255, 107, 0, 0.8)';
            ctx.textAlign = 'center';
            ctx.fillText(hazard.id, hazard.x, hazard.y + 3);
          }

          // 2. Draw Energy Particles (Glowing Bio-Green Dots)
          for (const food of engine.energyParticles) {
            ctx.shadowColor = '#00E676';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#00E676';
            ctx.beginPath();
            ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // 3. Draw Energy Force Lines (connecting microbots to food & hazard boundaries)
          if (engine.config.showEnergyForceLines) {
            ctx.lineWidth = 1;
            for (const bot of engine.microbots) {
              // Food Force Lines
              const nearbyFood = engine.spatialGrid.getNearby(bot.x, bot.y, bot.visionRadius);
              for (const food of nearbyFood) {
                const dist = Math.hypot(bot.x - food.x, bot.y - food.y);
                if (dist <= bot.visionRadius) {
                  const alpha = (1 - dist / bot.visionRadius) * 0.45;
                  ctx.strokeStyle = `rgba(0, 230, 118, ${alpha})`;
                  ctx.beginPath();
                  ctx.moveTo(bot.x, bot.y);
                  ctx.quadraticCurveTo(
                    (bot.x + food.x) / 2 + Math.sin(Date.now() / 200 + bot.x) * 10,
                    (bot.y + food.y) / 2 + Math.cos(Date.now() / 200 + bot.y) * 10,
                    food.x,
                    food.y
                  );
                  ctx.stroke();
                }
              }

              // Hazard Force Tendrils
              for (const hazard of engine.hazards) {
                const dist = Math.hypot(bot.x - hazard.x, bot.y - hazard.y);
                if (dist <= bot.visionRadius + hazard.radius) {
                  const alpha = (1 - dist / (bot.visionRadius + hazard.radius)) * 0.5;
                  ctx.strokeStyle = `rgba(255, 107, 0, ${alpha})`;
                  ctx.setLineDash([3, 3]);
                  ctx.beginPath();
                  ctx.moveTo(bot.x, bot.y);
                  ctx.lineTo(hazard.x, hazard.y);
                  ctx.stroke();
                  ctx.setLineDash([]);
                }
              }
            }
          }

          // 4. Draw Microbots
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

            // Sensory Vision Ring
            if (isSelected || engine.config.showSensoryRings) {
              ctx.strokeStyle = isSelected ? '#00E5FF' : 'rgba(0, 229, 255, 0.12)';
              ctx.lineWidth = isSelected ? 1.5 : 0.8;
              ctx.beginPath();
              ctx.arc(bot.x, bot.y, bot.visionRadius, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Target Vector Arrow
            if (isSelected && engine.config.showTargetVectors) {
              ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
              ctx.lineWidth = 1.2;
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.moveTo(bot.x, bot.y);
              ctx.lineTo(bot.x + Math.cos(bot.heading) * bot.visionRadius * 0.8, bot.y + Math.sin(bot.heading) * bot.visionRadius * 0.8);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Microbot Triangular Vector Pod Shape
            ctx.save();
            ctx.translate(bot.x, bot.y);
            ctx.rotate(bot.heading);

            // Glow Effect
            ctx.shadowColor = bot.color;
            ctx.shadowBlur = isSelected ? 20 : 10;

            // Triangular Body Concept
            ctx.fillStyle = bot.color;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-8, -6);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-8, 6);
            ctx.closePath();
            ctx.fill();

            // Headlight / Eye Nose Cone
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();

            // Battery Health Indicator Bar
            const batteryRatio = Math.max(0, Math.min(1, bot.battery / bot.maxBattery));
            const barW = 20;
            const barH = 3;
            const barX = bot.x - barW / 2;
            const barY = bot.y - 14;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barW, barH);

            ctx.fillStyle = batteryRatio > 0.4 ? '#00E676' : batteryRatio > 0.2 ? '#FF6B00' : '#f43f5e';
            ctx.fillRect(barX, barY, barW * batteryRatio, barH);

            // Selected Target Reticle Indicator
            if (isSelected) {
              const reticlePulse = Math.sin(Date.now() / 200) * 3;
              const reticleR = 18 + reticlePulse;

              ctx.strokeStyle = '#00E5FF';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bot.x, bot.y, reticleR, 0, Math.PI * 2);
              ctx.stroke();

              // Crosshair Ticks
              ctx.beginPath();
              ctx.moveTo(bot.x - reticleR - 4, bot.y); ctx.lineTo(bot.x - reticleR + 2, bot.y);
              ctx.moveTo(bot.x + reticleR + 4, bot.y); ctx.lineTo(bot.x + reticleR - 2, bot.y);
              ctx.moveTo(bot.x, bot.y - reticleR - 4); ctx.lineTo(bot.x, bot.y - reticleR + 2);
              ctx.moveTo(bot.x, bot.y + reticleR + 4); ctx.lineTo(bot.x, bot.y + reticleR - 2);
              ctx.stroke();

              // ID Tag
              ctx.font = "800 11px 'JetBrains Mono', monospace";
              ctx.fillStyle = '#00E5FF';
              ctx.textAlign = 'center';
              ctx.fillText(`★ ${bot.id}`, bot.x, bot.y - 22);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [engine]);

  // Handle Canvas Clicks: Select bot or spawn 5 food dots
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

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
    <div ref={containerRef} className="canvas-viewport-card" style={{ width: '100%', height: '100%' }}>
      {/* Floating Center Top Tracking Banner Pill */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 16px',
        background: 'rgba(15, 26, 36, 0.85)',
        border: '1px solid rgba(0, 229, 255, 0.35)',
        borderRadius: 20,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        pointerEvents: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: selectedBot ? selectedBot.color : '#00E5FF',
            boxShadow: '0 0 10px ' + (selectedBot ? selectedBot.color : '#00E5FF')
          }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
            TRACKING: {selectedBot ? selectedBot.id : 'SEARCHING...'}
          </span>
        </div>

        <button onClick={onSelectRandomBot} className="btn-holo btn-holo-cyan" style={{ padding: '4px 10px', fontSize: '0.68rem' }}>
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
        bottom: 14,
        left: 14,
        zIndex: 20,
        background: 'rgba(15, 26, 36, 0.75)',
        padding: '5px 12px',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '0.7rem',
        color: '#8B949E',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <MousePointerClick style={{ width: 14, height: 14, color: '#00E676' }} />
        <span>Click anywhere on canvas to drop food!</span>
      </div>
    </div>
  );
};

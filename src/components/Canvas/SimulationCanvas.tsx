import React, { useRef, useEffect } from 'react';
import { MicrobotEngine } from '../../simulation/MicrobotEngine';
import { BrushMode, HeatmapOverlayMode } from '../../simulation/types';
import { Target, MousePointerClick, Zap, ShieldAlert, Sparkles, Dna, AlertTriangle, Layers } from 'lucide-react';

interface SimulationCanvasProps {
  engine: MicrobotEngine;
  onSelectBot: (botId: string | null) => void;
  onSelectRandomBot: () => void;
  onUpdateConfig: (newConfig: any) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  engine,
  onSelectBot,
  onSelectRandomBot,
  onUpdateConfig
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgLayerRef = useRef<HTMLCanvasElement | null>(null);
  const trailLayerRef = useRef<HTMLCanvasElement | null>(null);
  const bgDirtyRef = useRef<boolean>(true);
  const bgDirtyRef = useRef<boolean>(true);
  const isMouseDownRef = useRef<boolean>(false);
  const resolutionScaleRef = useRef<number>(window.devicePixelRatio || 1.0);
  const frameCountRef = useRef<number>(0);

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
        // Dynamic Resolution Scaling
        const scale = resolutionScaleRef.current;
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(scale, scale);

        engine.resize(width, height);
        bgDirtyRef.current = true; // Mark background layer for redraw
      }
    };

    // Frame-rate monitor for dynamic downscaling
    let lastTime = performance.now();
    const monitorInterval = setInterval(() => {
        const now = performance.now();
        if (now - lastTime >= 1000) {
           const fps = frameCountRef.current;
           frameCountRef.current = 0;
           lastTime = now;
           
           if (fps < 30 && resolutionScaleRef.current > 0.5) {
               resolutionScaleRef.current = Math.max(0.5, resolutionScaleRef.current - 0.25);
               updateCanvasDimensions();
           } else if (fps > 55 && resolutionScaleRef.current < (window.devicePixelRatio || 1)) {
               resolutionScaleRef.current = Math.min((window.devicePixelRatio || 1), resolutionScaleRef.current + 0.1);
               updateCanvasDimensions();
           }
        }
    }, 1000);

    updateCanvasDimensions();
    const resizeObserver = new ResizeObserver(updateCanvasDimensions);
    resizeObserver.observe(container);

    return () => {
       resizeObserver.disconnect();
       clearInterval(monitorInterval);
    };
  }, [engine]);

  // Fix(memory): properly unbind window-level event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Render cached background grid layer (only on resize / first paint)
  const renderBgLayer = (width: number, height: number): HTMLCanvasElement => {
    if (!bgLayerRef.current) {
      bgLayerRef.current = document.createElement('canvas');
    }
    const bg = bgLayerRef.current;
    bg.width = width;
    bg.height = height;
    const bctx = bg.getContext('2d');
    if (!bctx) return bg;

    bctx.fillStyle = '#080E14';
    bctx.fillRect(0, 0, width, height);

    // Energy grid
    bctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    bctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      bctx.beginPath(); bctx.moveTo(x, 0); bctx.lineTo(x, height); bctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(width, y); bctx.stroke();
    }

    // Spatial hash overlay
    bctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    const cellSize = 60;
    for (let cx = 0; cx < width; cx += cellSize) {
      bctx.beginPath(); bctx.moveTo(cx, 0); bctx.lineTo(cx, height); bctx.stroke();
    }
    for (let cy = 0; cy < height; cy += cellSize) {
      bctx.beginPath(); bctx.moveTo(0, cy); bctx.lineTo(width, cy); bctx.stroke();
    }

    // Biome boundary grid overlays
    if (engine && engine.biomes) {
       for (const biome of engine.biomes) {
          if (biome.color !== 'rgba(255,255,255,0)') {
             bctx.fillStyle = biome.color;
             bctx.fillRect(biome.x, biome.y, biome.width, biome.height);
          }
          
          // Draw Biome border and Label
          bctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
          bctx.lineWidth = 1;
          bctx.strokeRect(biome.x, biome.y, biome.width, biome.height);

          bctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          bctx.font = "8px 'JetBrains Mono', monospace";
          bctx.fillText(biome.type.replace(/_/g, ' '), biome.x + 8, biome.y + 16);
       }
    }

    bgDirtyRef.current = false;
    return bg;
  };

  // Main Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          frameCountRef.current++; // Increment for FPS monitor
          
          // Skip heavy rendering if document tab is hidden in background
          if (document.hidden) {
            animationFrameId = requestAnimationFrame(render);
            return;
          }

          // Update physics with clamped delta-time to prevent tab-resume jumps
          const now = performance.now();
          let dt = (now - lastTime) / (1000 / (engine.config.targetFPS || 60));
          if (dt > 3.0) dt = 3.0; // clamp max 3 frames of time
          lastTime = now;

          engine.update(dt);

          // Blit cached background layer (only rebuild on resize)
          if (bgDirtyRef.current || !bgLayerRef.current) {
            renderBgLayer(canvas.width, canvas.height);
          }
          
          if (!trailLayerRef.current) {
             trailLayerRef.current = document.createElement('canvas');
             trailLayerRef.current.width = canvas.width;
             trailLayerRef.current.height = canvas.height;
          } else if (trailLayerRef.current.width !== canvas.width || trailLayerRef.current.height !== canvas.height) {
             trailLayerRef.current.width = canvas.width;
             trailLayerRef.current.height = canvas.height;
          }
          
          const tctx = trailLayerRef.current.getContext('2d');
          if (tctx) {
             tctx.fillStyle = 'rgba(8, 14, 20, 0.25)'; // Fading color for interpolation buffer
             tctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Main canvas clearing
          ctx.drawImage(bgLayerRef.current!, 0, 0);
          
          if (engine.config.enableFrameInterpolation) {
             ctx.drawImage(trailLayerRef.current, 0, 0);
          }

          // We swap ctx for tctx so all entities are drawn to the trail buffer for interpolation
          // However, to keep it simple and avoid refactoring all draw calls, we will draw entities directly to ctx, 
          // and then copy ctx to trailLayerRef for the NEXT frame.
          // This way, next frame we fade trailLayerRef and draw it on top of background.

          const heatmapMode: HeatmapOverlayMode = engine.config.heatmapMode || 'OFF';
          if (heatmapMode !== 'OFF') {
            const cols = 20;
            const rows = 15;
            const cellW = canvas.width / cols;
            const cellH = canvas.height / rows;

            for (let c = 0; c < cols; c++) {
              for (let r = 0; r < rows; r++) {
                const cx = c * cellW + cellW / 2;
                const cy = r * cellH + cellH / 2;
                let intensity = 0;
                let color = '255, 107, 0'; // Default orange

                if (heatmapMode === 'MORTALITY') {
                  color = '244, 63, 94'; // Red mortality
                  for (const h of engine.hazards) {
                    const dist = Math.hypot(cx - h.x, cy - h.y);
                    if (dist < h.radius * 1.5) intensity += 0.35;
                  }
                } else if (heatmapMode === 'FOOD_DENSITY') {
                  color = '0, 230, 118'; // Green food density
                  for (const f of engine.energyParticles) {
                    const dist = Math.hypot(cx - f.x, cy - f.y);
                    if (dist < 100) intensity += 0.25;
                  }
                } else if (heatmapMode === 'TRAFFIC') {
                  color = '0, 229, 255'; // Blue traffic pathing
                  for (const b of engine.microbots) {
                    const dist = Math.hypot(cx - b.x, cy - b.y);
                    if (dist < 120) intensity += 0.2;
                  }
                }

                intensity = Math.min(0.65, intensity);
                if (intensity > 0.05) {
                  ctx.fillStyle = `rgba(${color}, ${intensity})`;
                  ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
                }
              }
            }
          }

          // Render Fluid Resistance Water Currents & Viscous Hazard Fields
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
          ctx.lineWidth = 1.5;
          for (let y = 50; y < canvas.height; y += 120) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y + Math.sin(y + Date.now() * 0.002) * 15);
            ctx.stroke();
          }
          for (const field of engine.speedFields) {
            const grad = ctx.createRadialGradient(field.x, field.y, 5, field.x, field.y, field.radius);
            grad.addColorStop(0, 'rgba(0, 229, 255, 0.3)');
            grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Copy current frame to trail buffer for the next frame's interpolation
          if (tctx && engine.config.enableFrameInterpolation) {
             // To prevent infinite smearing of static UI, we only copy the canvas state before UI overlays
             tctx.drawImage(canvas, 0, 0);
          }

          // 9. Draw Tool Overlays (Brush)
          for (const hazard of engine.hazards) {
            const pulse = Math.sin(Date.now() / 350) * 4;
            const r = Math.max(10, hazard.radius + pulse);

            const grad = ctx.createRadialGradient(hazard.x, hazard.y, 5, hazard.x, hazard.y, r);
            grad.addColorStop(0, 'rgba(255, 107, 0, 0.35)');
            grad.addColorStop(0.7, 'rgba(255, 107, 0, 0.15)');
            grad.addColorStop(1, 'rgba(255, 107, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 107, 0, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = "800 9px 'JetBrains Mono', monospace";
            ctx.fillStyle = 'rgba(255, 107, 0, 0.8)';
            ctx.textAlign = 'center';
            ctx.fillText(hazard.id, hazard.x, hazard.y + 3);
          }

          // 3. Draw Multi-Type Energy Particles
          for (const food of engine.energyParticles) {
            ctx.shadowColor = food.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = food.color;
            ctx.beginPath();
            ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
            ctx.fill();

            if (food.type === 'SUPER_CHARGER') {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();
            } else if (food.type === 'MUTAGEN_ORB') {
              const pulseR = food.radius + Math.sin(Date.now() / 150) * 2;
              ctx.strokeStyle = '#E040FB';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.arc(food.x, food.y, pulseR, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.shadowBlur = 0;
          }

          // 3.5 Draw Disaster Particles
          for (const p of engine.disasterParticles) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 150;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 + (p.life / 50), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;

          // 4. Draw Energy Force Lines
          if (engine.config.showEnergyForceLines) {
            ctx.lineWidth = 1;
            for (const bot of engine.microbots) {
              const nearbyFood = engine.spatialGrid.getNearby(bot.x, bot.y, bot.visionRadius);
              for (const food of nearbyFood) {
                const dist = Math.hypot(bot.x - food.x, bot.y - food.y);
                if (dist <= bot.visionRadius) {
                  const alpha = (1 - dist / bot.visionRadius) * 0.45;
                  ctx.strokeStyle = food.type === 'MUTAGEN_ORB' ? `rgba(224, 64, 251, ${alpha})` : food.type === 'SUPER_CHARGER' ? `rgba(0, 229, 255, ${alpha})` : `rgba(0, 230, 118, ${alpha})`;
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
            }
          }

          // 5. Draw Microbots & Sensory Raycast Lines
          const selectedBot = engine.getSelectedMicrobot();

          for (const bot of engine.microbots) {
            const isSelected = selectedBot && selectedBot.id === bot.id;

            // Sensory Raycasting Lines
            if (engine.config.showSensoryRaycasts || isSelected) {
              const numRays = 8;
              const angleSpread = Math.PI * 0.8;
              const startAngle = bot.heading - angleSpread / 2;

              for (let i = 0; i < numRays; i++) {
                const rayAngle = startAngle + (i / (numRays - 1)) * angleSpread;
                let rayColor = 'rgba(0, 229, 255, 0.15)';
                let endDist = bot.visionRadius;

                for (const food of engine.energyParticles) {
                  const dist = Math.hypot(bot.x - food.x, bot.y - food.y);
                  if (dist < bot.visionRadius) {
                    const foodAngle = Math.atan2(food.y - bot.y, food.x - bot.x);
                    if (Math.abs(foodAngle - rayAngle) < 0.25) {
                      rayColor = food.color;
                      endDist = Math.min(endDist, dist);
                    }
                  }
                }

                for (const hazard of engine.hazards) {
                  const dist = Math.hypot(bot.x - hazard.x, bot.y - hazard.y);
                  if (dist < bot.visionRadius + hazard.radius) {
                    const hazAngle = Math.atan2(hazard.y - bot.y, hazard.x - bot.x);
                    if (Math.abs(hazAngle - rayAngle) < 0.3) {
                      rayColor = 'rgba(255, 107, 0, 0.7)';
                      endDist = Math.min(endDist, dist);
                    }
                  }
                }

                const hitX = bot.x + Math.cos(rayAngle) * endDist;
                const hitY = bot.y + Math.sin(rayAngle) * endDist;

                ctx.strokeStyle = rayColor;
                ctx.lineWidth = isSelected ? 1.5 : 1;
                ctx.beginPath();
                ctx.moveTo(bot.x, bot.y);
                ctx.lineTo(hitX, hitY);
                ctx.stroke();
              }
            }

            // Bioluminescent Movement Trail with fading alpha and Quantum State overrides
            if (engine.config.showMovementTrails && bot.trail.length > 1) {
              const isDecaying = bot.genome && Object.values(bot.genome).some((a: any) => a.state === 'DECAYING');
              const isEntangled = bot.genome && Object.values(bot.genome).some((a: any) => a.state === 'ENTANGLED');
              
              const trailLen = bot.trail.length;
              for (let i = 1; i < trailLen; i++) {
                const alpha = (i / trailLen) * 0.35;
                
                if (isDecaying) {
                  ctx.strokeStyle = i % 2 === 0 ? '#f43f5e' : bot.color;
                  ctx.lineWidth = 1 + (i / trailLen) * 2;
                  ctx.setLineDash([2, 4]);
                } else if (isEntangled) {
                  ctx.strokeStyle = '#E040FB';
                  ctx.lineWidth = 1 + (i / trailLen) * 1.5;
                  ctx.setLineDash([4, 2]);
                } else {
                  ctx.strokeStyle = bot.color;
                  ctx.lineWidth = 1 + (i / trailLen) * 1.5;
                  ctx.setLineDash([]);
                }
                
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.moveTo(bot.trail[i - 1].x, bot.trail[i - 1].y);
                ctx.lineTo(bot.trail[i].x, bot.trail[i].y);
                ctx.stroke();
              }
              ctx.setLineDash([]);
              ctx.globalAlpha = 1.0;
            }

            // Directional heading vector line
            const headLen = 14;
            ctx.strokeStyle = bot.color;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(bot.x, bot.y);
            ctx.lineTo(bot.x + Math.cos(bot.heading) * headLen, bot.y + Math.sin(bot.heading) * headLen);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Sensory Vision Ring
            if (isSelected || engine.config.showSensoryRings) {
              ctx.strokeStyle = isSelected ? (bot.isPredator ? '#f43f5e' : '#00E5FF') : 'rgba(0, 229, 255, 0.12)';
              ctx.lineWidth = isSelected ? 1.5 : 0.8;
              ctx.beginPath();
              ctx.arc(bot.x, bot.y, bot.visionRadius, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Triangular Vector Body (Predators get red glowing claws)
            ctx.save();
            ctx.translate(bot.x, bot.y);
            ctx.rotate(bot.heading);

            ctx.shadowColor = bot.color;
            ctx.shadowBlur = isSelected ? 20 : 10;

            ctx.fillStyle = bot.color;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-8, -6);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-8, 6);
            ctx.closePath();
            ctx.fill();

            // Predator Claws
            if (bot.isPredator) {
              ctx.strokeStyle = '#f43f5e';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(8, -4); ctx.lineTo(14, -7);
              ctx.moveTo(8, 4); ctx.lineTo(14, 7);
              ctx.stroke();
            }

            // Headlight Cone
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();

            // Health Bar
            const batteryRatio = Math.max(0, Math.min(1, bot.battery / bot.maxBattery));
            const barW = 20;
            const barH = 3;
            const barX = bot.x - barW / 2;
            const barY = bot.y - 14;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = batteryRatio > 0.4 ? '#00E676' : batteryRatio > 0.2 ? '#FF6B00' : '#f43f5e';
            ctx.fillRect(barX, barY, barW * batteryRatio, barH);

            // Selected Target Reticle
            if (isSelected) {
              const reticlePulse = Math.sin(Date.now() / 200) * 3;
              const reticleR = 18 + reticlePulse;

              ctx.strokeStyle = bot.isPredator ? '#f43f5e' : '#00E5FF';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(bot.x, bot.y, reticleR, 0, Math.PI * 2);
              ctx.stroke();

              const cueLabel = bot.behaviorState === 'HUNTING_PREY' ? 'Predator Hunting ⚔️' : bot.behaviorState === 'SEEKING_ENERGY' ? 'Hunting Food 🍏' : bot.behaviorState === 'EVADING_HAZARD' ? 'Fleeing Hazard 💥' : bot.behaviorState === 'REPRODUCING' ? 'Seeking Mate 🧬' : 'Wandering 🧭';

              ctx.font = "800 11px 'JetBrains Mono', monospace";
              ctx.fillStyle = bot.isPredator ? '#f43f5e' : '#00E5FF';
              ctx.textAlign = 'center';
              ctx.fillText(`★ ${bot.id} (${cueLabel})`, bot.x, bot.y - 22);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [engine]);

  // Handle Canvas Painting / Clicks
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const mode: BrushMode = engine.config.brushMode || 'NONE';

    if (mode === 'PAINT_FOOD') {
      engine.spawnFood(clickX, clickY);
    } else if (mode === 'PAINT_HAZARD') {
      engine.spawnHazard(clickX, clickY);
    } else if (mode === 'PAINT_SPEED_FIELD') {
      engine.spawnSpeedField(clickX, clickY);
    } else {
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
    }
  };

  const selectedBot = engine.getSelectedMicrobot();
  const currentBrush = engine.config.brushMode || 'NONE';
  const currentHeatmap = engine.config.heatmapMode || 'OFF';
  const isExtinctionRisk = engine.microbots.length < 15;
  const isRadiationStorm = engine.activeDisasters.some(d => d.type === 'RADIATION_STORM');
  const isMagneticInversion = engine.activeDisasters.some(d => d.type === 'MAGNETIC_INVERSION');

  return (
    <div ref={containerRef} className="canvas-viewport-card" style={{ width: '100%', height: '100%' }}>
      {/* Extinction Crisis Alert Banner */}
      {isExtinctionRisk && (
        <div style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 18px',
          background: 'rgba(244, 63, 94, 0.85)',
          border: '1px solid #f43f5e',
          borderRadius: 12,
          color: '#ffffff',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          fontWeight: 800,
          boxShadow: '0 0 25px rgba(244, 63, 94, 0.5)',
          pointerEvents: 'none'
        }}>
          <AlertTriangle style={{ width: 14, height: 14 }} />
          <span>⚠️ EXTINCTION CRISIS ALERT: POPULATION BELOW 15 BOTS! RECOVERY INITIATED</span>
        </div>
      )}

      {/* Radiation Storm Alert Banner */}
      {isRadiationStorm && (
        <div style={{
          position: 'absolute',
          top: 96,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 18px',
          background: 'rgba(245, 158, 11, 0.85)',
          border: '1px solid #f59e0b',
          borderRadius: 12,
          color: '#ffffff',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          fontWeight: 800,
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.5)',
          pointerEvents: 'none'
        }}>
          <AlertTriangle style={{ width: 14, height: 14 }} />
          <span>☢️ GLOBAL RADIATION STORM ACTIVE: MUTATION RATES INCREASED</span>
        </div>
      )}

      {/* Magnetic Inversion Alert Banner */}
      {isMagneticInversion && (
        <div style={{
          position: 'absolute',
          top: 132,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 18px',
          background: 'rgba(217, 70, 239, 0.85)',
          border: '1px solid #d946ef',
          borderRadius: 12,
          color: '#ffffff',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          fontWeight: 800,
          boxShadow: '0 0 25px rgba(217, 70, 239, 0.5)',
          pointerEvents: 'none'
        }}>
          <AlertTriangle style={{ width: 14, height: 14 }} />
          <span>🧲 POLARITY INVERSION: ALL HEADINGS REVERSED</span>
        </div>
      )}

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

      {/* Heatmap Layer Picker Bar */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        background: 'rgba(15, 26, 36, 0.85)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: 10,
        backdropFilter: 'blur(12px)'
      }}>
        <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Layers style={{ width: 12, height: 12 }} /> HEATMAP:
        </span>
        <select
          value={currentHeatmap}
          onChange={(e) => onUpdateConfig({ heatmapMode: e.target.value as HeatmapOverlayMode })}
          style={{ background: '#080E14', color: '#00E5FF', fontWeight: 800, border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: 6, padding: '2px 6px', fontSize: '0.65rem', cursor: 'pointer' }}
        >
          <option value="OFF">Off</option>
          <option value="MORTALITY">🔴 Mortality</option>
          <option value="FOOD_DENSITY">🟢 Food Density</option>
          <option value="TRAFFIC">🔵 Traffic Pathing</option>
        </select>
      </div>

      {/* Canvas Brush Tool Picker Bar */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: 14,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        background: 'rgba(15, 26, 36, 0.85)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: 10,
        backdropFilter: 'blur(12px)'
      }}>
        <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#8B949E' }}>BRUSH:</span>
        <button
          onClick={() => onUpdateConfig({ brushMode: currentBrush === 'PAINT_FOOD' ? 'NONE' : 'PAINT_FOOD' })}
          className={currentBrush === 'PAINT_FOOD' ? 'btn-holo btn-holo-green' : 'btn-holo btn-holo-dark'}
          style={{ padding: '3px 6px', fontSize: '0.65rem' }}
        >
          <Zap style={{ width: 10, height: 10 }} /> FOOD
        </button>

        <button
          onClick={() => engine.spawnFood(undefined, undefined, 'MUTAGEN_ORB')}
          className="btn-holo btn-holo-magenta"
          style={{ padding: '3px 6px', fontSize: '0.65rem' }}
          title="Spawn Mutagen Orb"
        >
          <Dna style={{ width: 10, height: 10 }} /> MUTAGEN
        </button>

        <button
          onClick={() => onUpdateConfig({ brushMode: currentBrush === 'PAINT_HAZARD' ? 'NONE' : 'PAINT_HAZARD' })}
          className={currentBrush === 'PAINT_HAZARD' ? 'btn-holo btn-holo-orange' : 'btn-holo btn-holo-dark'}
          style={{ padding: '3px 6px', fontSize: '0.65rem' }}
        >
          <ShieldAlert style={{ width: 10, height: 10 }} /> HAZARD
        </button>
        <button
          onClick={() => onUpdateConfig({ brushMode: currentBrush === 'PAINT_SPEED_FIELD' ? 'NONE' : 'PAINT_SPEED_FIELD' })}
          className={currentBrush === 'PAINT_SPEED_FIELD' ? 'btn-holo btn-holo-cyan' : 'btn-holo btn-holo-dark'}
          style={{ padding: '3px 6px', fontSize: '0.65rem' }}
        >
          <Sparkles style={{ width: 10, height: 10 }} /> SPEED FIELD
        </button>
      </div>

      {/* Main Simulation Viewport Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => { isMouseDownRef.current = true; handleCanvasInteraction(e); }}
        onMouseMove={(e) => { if (isMouseDownRef.current) handleCanvasInteraction(e); }}
        onMouseUp={() => { isMouseDownRef.current = false; }}
        style={{ display: 'block', width: '100%', height: '100%', cursor: currentBrush !== 'NONE' ? 'cell' : 'crosshair' }}
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
        <span>
          {currentBrush === 'PAINT_FOOD' ? 'Click or drag to paint food clusters!' : currentBrush === 'PAINT_HAZARD' ? 'Click to paint hazard zones!' : currentBrush === 'PAINT_SPEED_FIELD' ? 'Click to paint speed fields!' : 'Click anywhere on canvas to drop food!'}
        </span>
      </div>
    </div>
  );
};

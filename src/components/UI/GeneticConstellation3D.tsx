import React, { useRef, useEffect, useState } from 'react';
import { Microbot } from '../../simulation/types';

interface GeneticConstellation3DProps {
  bots: Microbot[];
}

export const GeneticConstellation3D: React.FC<GeneticConstellation3DProps> = ({ bots }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let autoRotate = 0;

    const render = () => {
      autoRotate += 0.005;
      ctx.fillStyle = '#060A10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2 + pan.x;
      const cy = canvas.height / 2 + pan.y;
      const rad = 80 * zoom;

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;

      // Group bots by color (species approximation)
      const clusters: Record<string, { count: number, hue: number }> = {};
      bots.forEach(bot => {
         if (!clusters[bot.color]) {
            clusters[bot.color] = { count: 0, hue: bot.hue };
         }
         clusters[bot.color].count++;
      });

      // Project 3D constellation nodes
      Object.keys(clusters).forEach((color, i) => {
        const cluster = clusters[color];
        const theta = (i / Object.keys(clusters).length) * Math.PI * 2 + autoRotate + rotation.y;
        const phi = (cluster.hue / 360) * Math.PI + rotation.x;
        const x3d = rad * Math.sin(phi) * Math.cos(theta);
        const y3d = rad * Math.cos(phi);
        const z3d = rad * Math.sin(phi) * Math.sin(theta);

        const scale = 180 / (180 + z3d);
        const px = cx + x3d * scale;
        const py = cy + y3d * scale;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(2, (2 + Math.log2(cluster.count)) * scale), 0, Math.PI * 2);
        ctx.fill();

        if (cluster.count > 5) {
          ctx.font = "600 8px 'JetBrains Mono'";
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillText(`n:${cluster.count}`, px + 5, py);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [bots]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    
    if (e.shiftKey) {
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    } else {
      setRotation(r => ({ x: r.x - dy * 0.01, y: r.y + dx * 0.01 }));
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.1, Math.min(5, z - e.deltaY * 0.001)));
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `genetic_constellation_${Date.now()}.png`;
    a.click();
  };

  return (
    <div style={{ background: 'rgba(11, 15, 25, 0.85)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 12, padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", color: '#00E5FF', fontWeight: 800 }}>
          3D GENETIC CONSTELLATION MAP
        </span>
        <button onClick={handleExportPNG} style={{ background: 'transparent', border: 'none', color: '#00E5FF', fontSize: '0.6rem', cursor: 'pointer' }} title="Export 3D Snapshot PNG">
          📸 PNG
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        width={180} 
        height={130} 
        style={{ borderRadius: 8, cursor: 'grab' }} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
};

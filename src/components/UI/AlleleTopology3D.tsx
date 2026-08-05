import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Microbot } from '../../simulation/types';

export const AlleleTopology3D: React.FC<{ microbots: Microbot[] }> = ({ microbots }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(15, 20, 25);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.6;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Dynamic 3D Trait Surface Mesh
    const gridSegs = 24;
    const geometry = new THREE.PlaneGeometry(20, 20, gridSegs, gridSegs);
    const material = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: false,
      flatShading: true,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    let animationFrameId: number;

    const updateMeshHeights = () => {
      const posAttr = geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        const u = (i % (gridSegs + 1)) / gridSegs;
        const v = Math.floor(i / (gridSegs + 1)) / gridSegs;
        let heightVal = 0;

        if (microbots.length > 0) {
          microbots.forEach(bot => {
            const bSpeedNorm = (bot.speed - 1.0) / 4.0;
            const bEffNorm = (bot.energyEfficiency - 0.6) / 1.9;
            const dist = Math.hypot(u - bSpeedNorm, v - bEffNorm);
            if (dist < 0.2) {
              heightVal += (0.2 - dist) * 15;
            }
          });
        }
        posAttr.setZ(i, Math.min(8.0, heightVal));
      }
      posAttr.needsUpdate = true;
      geometry.computeVertexNormals();
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      setContextLost(false);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      updateMeshHeights();
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-64 bg-slate-900/60 rounded-xl overflow-hidden border border-slate-700/50 backdrop-blur-md">
      <div ref={mountRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-amber-400 font-mono text-sm">
          WebGL Context Lost - Restoring...
        </div>
      )}
      <div className="absolute top-2 left-2 text-xs font-mono text-cyan-400 bg-slate-950/70 px-2 py-1 rounded border border-cyan-500/30">
        3D Allele Topology Visualizer
      </div>
    </div>
  );
};

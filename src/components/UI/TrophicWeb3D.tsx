import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Microbot } from '../../simulation/types';
import { Network } from 'lucide-react';

interface TrophicWeb3DProps {
  microbots: Microbot[];
  onClose?: () => void;
}

export const TrophicWeb3D: React.FC<TrophicWeb3DProps> = ({ microbots, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    camera.position.set(0, 0, 15);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Build 3D Trophic Nodes & Energy Transfer Lines
    const nodeGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 });

    const renderedNodes: THREE.Mesh[] = [];

    microbots.forEach((bot, index) => {
      let color = 0x34d399; // Producer (emerald green)
      if (bot.isPredator) {
        color = 0xf43f5e; // Predator (crimson red)
      } else if (bot.carnivoreGene && bot.carnivoreGene > 0.5) {
        color = 0xa855f7; // Decomposer / Scavenger (purple)
      }

      const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.4 });
      const mesh = new THREE.Mesh(nodeGeometry, mat);

      const phi = Math.acos(-1 + (2 * index) / Math.max(1, microbots.length));
      const theta = Math.sqrt(microbots.length * Math.PI) * phi;
      const radius = 6;

      mesh.position.set(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );

      networkGroup.add(mesh);
      renderedNodes.push(mesh);
    });

    // Draw trophic connection lines
    for (let i = 0; i < renderedNodes.length; i++) {
      for (let j = i + 1; j < renderedNodes.length; j++) {
        if (renderedNodes[i].position.distanceTo(renderedNodes[j].position) < 4.5) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            renderedNodes[i].position,
            renderedNodes[j].position
          ]);
          const line = new THREE.Line(geometry, lineMaterial);
          networkGroup.add(line);
        }
      }
    }

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      networkGroup.rotation.y += 0.003;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
      cancelAnimationFrame(animationFrameId);
    };

    const handleContextRestored = () => {
      setContextLost(false);
      animate();
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      cancelAnimationFrame(animationFrameId);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [microbots]);

  return (
    <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Network style={{ width: 16, height: 16, color: '#00E5FF' }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 800, color: '#00E5FF' }}>
            3D TROPHIC WEB VISUALIZER
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        )}
      </div>

      {contextLost && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-lg">
          <span style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '8px' }}>WebGL Context Lost</span>
          <button className="btn-holo btn-holo-cyan" onClick={() => window.location.reload()}>Reload Interface</button>
        </div>
      )}

      <div ref={mountRef} className="w-full h-72 bg-slate-900/40 rounded-lg overflow-hidden border border-slate-700/50 backdrop-blur-sm" />
    </div>
  );
};

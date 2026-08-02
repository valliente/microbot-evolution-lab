import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Microbot } from '../../simulation/types';

export const GenomicTopology3D: React.FC<{ activeBot: Microbot | null }> = ({ activeBot }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [contextLost, setContextLost] = useState(false);
  
  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 10;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Add ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4ade80, 1.5); // Neon green tint
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    // Build DNA Helix
    const numPairs = 10;
    const radius = 1.5;
    const heightSpacing = 0.8;
    const angleStep = Math.PI / 4;

    const createNode = (color: number, emissive: number, intensity: number) => {
      const geo = new THREE.SphereGeometry(0.3, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive,
        emissiveIntensity: intensity
      });
      return new THREE.Mesh(geo, mat);
    };

    const speedVal = activeBot?.genome?.speedAllele.baseValue || 1.0;
    const visionVal = activeBot?.genome?.visionAllele.baseValue || 40.0;
    const effVal = activeBot?.genome?.efficiencyAllele.baseValue || 1.0;

    for (let i = 0; i < numPairs; i++) {
      const y = (i - numPairs / 2) * heightSpacing;
      const angle = i * angleStep;

      // Map values to node intensity
      const nodeA = createNode(0x3b82f6, 0x1d4ed8, speedVal / 5.0);
      const nodeB = createNode(0xf43f5e, 0xbe123c, visionVal / 260.0);
      
      nodeA.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      nodeB.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);

      // Connecting bridge
      const bridgeGeo = new THREE.CylinderGeometry(0.05, 0.05, radius * 2, 8);
      const bridgeMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.5 });
      const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      
      bridge.position.set(0, y, 0);
      bridge.rotation.x = Math.PI / 2;
      bridge.rotation.z = -angle;

      helixGroup.add(nodeA);
      helixGroup.add(nodeB);
      helixGroup.add(bridge);
    }

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (helixGroup) {
        helixGroup.rotation.y += 0.01;
      }
      controls.update(); // required if controls.enableDamping or controls.autoRotate are set
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
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [activeBot]);

  return (
    <div style={{ position: 'relative' }}>
      {contextLost && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-lg" style={{ top: '35px' }}>
          <span style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '8px' }}>WebGL Context Lost</span>
          <button 
            className="btn-holo btn-holo-cyan" 
            onClick={() => window.location.reload()}
          >
            Reload Interface
          </button>
        </div>
      )}
      <div 
        ref={mountRef} 
        className="w-full h-64 bg-slate-900/40 rounded-lg overflow-hidden border border-slate-700/50 backdrop-blur-sm"
      />
    </div>
  );
};


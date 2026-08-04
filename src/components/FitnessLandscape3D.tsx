import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SimulationStats } from '../simulation/types';

interface Props {
  stats: SimulationStats;
}

export const FitnessLandscape3D: React.FC<Props> = ({ stats }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Initialize scene, camera, renderer
    const width = mountRef.current.clientWidth;
    const height = 300;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Create surface mesh
    const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88, wireframe: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Update mesh vertices based on stats (dummy density mapping for now)
      if (stats.speedHistogram.length > 0) {
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const z = positions.getZ(i);
          // Modulate Y based on some pseudo-random density function based on stats
          const y = Math.sin(x + performance.now() * 0.001) * Math.cos(z + performance.now() * 0.001) * (stats.speedHistogram[0] / 50 || 1);
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }
      
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();
    
    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationId);
      controls.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="bg-gray-800/70 backdrop-blur-md p-4 rounded-xl flex flex-col h-full border border-gray-700/50 shadow-2xl">
      <h3 className="text-sm font-semibold text-gray-300 mb-2 tracking-wide">3D Fitness Landscape</h3>
      <div ref={mountRef} className="w-full flex-grow relative rounded overflow-hidden bg-gray-900/50 border border-gray-700/50">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-white text-xs font-mono">WebGL Initialized</span>
        </div>
      </div>
    </div>
  );
};

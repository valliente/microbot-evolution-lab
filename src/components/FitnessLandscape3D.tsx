import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
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
    
    // Cleanup on unmount
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col h-full border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">3D Fitness Landscape</h3>
      <div ref={mountRef} className="w-full flex-grow relative rounded overflow-hidden bg-gray-900 border border-gray-700">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <span className="text-white text-xs">WebGL Initialized</span>
        </div>
      </div>
    </div>
  );
};

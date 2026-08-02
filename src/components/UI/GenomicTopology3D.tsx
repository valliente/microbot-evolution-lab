import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const GenomicTopology3D: React.FC<{ activeBotId: string | null }> = ({ activeBotId }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
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

    // Add ambient and directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4ade80, 1.5); // Neon green tint
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Initial placeholder mesh
    const geometry = new THREE.CylinderGeometry(0.2, 0.2, 10, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6, wireframe: true });
    const spine = new THREE.Mesh(geometry, material);
    scene.add(spine);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      spine.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [activeBotId]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-64 bg-slate-900/40 rounded-lg overflow-hidden border border-slate-700/50 backdrop-blur-sm"
    />
  );
};

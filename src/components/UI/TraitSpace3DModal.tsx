import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, Layers } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface TraitSpace3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const TraitSpace3DModal: React.FC<TraitSpace3DModalProps> = ({ isOpen, onClose, microbots }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c14);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const group = new THREE.Group();
    const count = Math.min(microbots.length, 80);

    for (let i = 0; i < count; i++) {
      const bot = microbots[i];
      const speed = bot.genome?.speedAllele?.baseValue || 2.0;
      const vision = bot.genome?.visionAllele?.baseValue || 80.0;
      const efficiency = bot.genome?.efficiencyAllele?.baseValue || 1.0;

      const geometry = new THREE.SphereGeometry(bot.isPredator ? 2.8 : 2.0, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: bot.color || '#00E676',
        wireframe: false
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (speed - 3.0) * 15,
        (vision / 40.0 - 2.0) * 15,
        (efficiency - 1.0) * 20
      );
      group.add(mesh);
    }
    scene.add(group);

    const gridHelper = new THREE.GridHelper(100, 10, 0x00E676, 0x1E293B);
    gridHelper.position.y = -30;
    scene.add(gridHelper);

    let animationFrameId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const domElement = renderer.domElement;
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      group.rotation.y += deltaX * 0.008;
      group.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDragging = false; };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(30, Math.min(300, camera.position.z + e.deltaY * 0.1));
    };

    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        group.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, microbots]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 16, 0.82)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 540,
        background: 'rgba(15, 26, 38, 0.95)',
        border: '1px solid rgba(0, 230, 118, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(0, 230, 118, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers style={{ color: '#00E676', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#00E676' }}>
              3D Phenotypic Trait Space
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div ref={mountRef} style={{ width: '100%', height: 360, borderRadius: 8, overflow: 'hidden' }} />
      </div>
    </div>
  );
};

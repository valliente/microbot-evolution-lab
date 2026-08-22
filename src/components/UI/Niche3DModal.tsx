import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, Globe } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface Niche3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const Niche3DModal: React.FC<Niche3DModalProps> = ({ isOpen, onClose, microbots }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060e18);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 125);

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
      const geometry = new THREE.OctahedronGeometry(bot.isPredator ? 3.2 : 2.2);
      const material = new THREE.MeshBasicMaterial({
        color: bot.color || '#38BDF8',
        wireframe: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        ((i % 9) - 4) * 15,
        (Math.floor(i / 9) - 4) * 15,
        Math.sin(i * 1.5) * 20
      );
      group.add(mesh);
    }
    scene.add(group);

    const gridHelper = new THREE.GridHelper(120, 12, 0x38BDF8, 0x1E293B);
    gridHelper.position.y = -35;
    scene.add(gridHelper);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe style={{ color: '#38BDF8', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#38BDF8' }}>
              3D Niche Differentiation Space
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

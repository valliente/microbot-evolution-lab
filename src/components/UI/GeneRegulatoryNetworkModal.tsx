import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Microbot } from '../../simulation/types';
import { X, Dna } from 'lucide-react';

interface GeneRegulatoryNetworkModalProps {
  bot: Microbot | null;
  onClose: () => void;
}

export const GeneRegulatoryNetworkModal: React.FC<GeneRegulatoryNetworkModalProps> = ({ bot, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b14);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Transcription factor nodes
    const nodeGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const nodes: THREE.Mesh[] = [];
    const colors = [0x00e5ff, 0xe040fb, 0x00e676, 0xff6b00, 0xffd600];

    for (let i = 0; i < 5; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.4,
        roughness: 0.2
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      const angle = (i / 5) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
      scene.add(mesh);
      nodes.push(mesh);
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      scene.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [bot]);

  if (!bot) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justify: 'center'
    }}>
      <div style={{
        width: 540,
        background: '#080E14',
        border: '1px solid rgba(0,229,255,0.4)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        boxShadow: '0 0 30px rgba(0,229,255,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            <Dna size={18} /> 3D Gene Regulatory Network Inspector
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8B949E', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div ref={mountRef} style={{ width: '100%', height: 350, borderRadius: 8, overflow: 'hidden' }} />
      </div>
    </div>
  );
};

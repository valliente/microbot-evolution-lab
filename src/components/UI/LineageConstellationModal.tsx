import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, Network, RotateCcw } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface LineageConstellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const LineageConstellationModal: React.FC<LineageConstellationModalProps> = ({ isOpen, onClose, microbots }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c14);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Create 3D nodes for species / bots
    const nodesGroup = new THREE.Group();
    const count = Math.min(microbots.length, 60);

    for (let i = 0; i < count; i++) {
      const bot = microbots[i];
      const geometry = new THREE.SphereGeometry(bot.generation > 5 ? 2.5 : 1.8, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: bot.color || '#00E5FF',
        wireframe: false
      });
      const sphere = new THREE.Mesh(geometry, material);
      const angle = (i / count) * Math.PI * 2;
      const radius = 25 + (bot.generation % 5) * 6;
      sphere.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 30
      );
      nodesGroup.add(sphere);
    }
    scene.add(nodesGroup);

    // Create extinct/active 3D branch lines between parent and child nodes
    const linesMaterial = new THREE.LineBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.35 });
    const linesGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    const children = nodesGroup.children;
    for (let i = 0; i < children.length - 1; i++) {
      const p1 = children[i].position;
      const p2 = children[i + 1].position;
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const lineSegments = new THREE.LineSegments(linesGeometry, linesMaterial);
    nodesGroup.add(lineSegments);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      nodesGroup.rotation.y += 0.005;
      nodesGroup.rotation.x += 0.002;
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
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network style={{ color: '#00E5FF', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#00E5FF' }}>
              3D Lineage Constellation
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

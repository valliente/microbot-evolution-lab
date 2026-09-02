import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, GitFork } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface Cladogram3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const Cladogram3DModal: React.FC<Cladogram3DModalProps> = ({ isOpen, onClose, microbots }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 25, 65);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00E5FF, 1.2);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(80, 20, 0x00E5FF, 0x1E293B);
    gridHelper.position.y = -19;
    scene.add(gridHelper);

    // Root ancestral node
    const treeGroup = new THREE.Group();
    const rootGeo = new THREE.SphereGeometry(2.0, 16, 16);
    const rootMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
    const rootMesh = new THREE.Mesh(rootGeo, rootMat);
    rootMesh.position.set(0, -18, 0);
    treeGroup.add(rootMesh);

    // Cladogenesis branches and leaf species nodes
    const cladeCount = Math.min(microbots.length, 30);
    for (let i = 0; i < cladeCount; i++) {
      const angle = (i / cladeCount) * Math.PI * 2;
      const radius = 18 + (i % 3) * 6;
      const targetX = Math.cos(angle) * radius;
      const targetY = 10 + ((i % 5) - 2) * 4;
      const targetZ = Math.sin(angle) * radius;

      // Line branch
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -18, 0),
        new THREE.Vector3(targetX * 0.4, -4, targetZ * 0.4),
        new THREE.Vector3(targetX, targetY, targetZ)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.6 });
      const branchLine = new THREE.Line(lineGeo, lineMat);
      treeGroup.add(branchLine);

      // Node sphere
      const nodeGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const nodeMat = new THREE.MeshBasicMaterial({ color: microbots[i]?.color || '#00E5FF' });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(targetX, targetY, targetZ);
      treeGroup.add(nodeMesh);
    }

    scene.add(treeGroup);

    let animationFrameId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      treeGroup.rotation.y += deltaX * 0.005;
      treeGroup.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(20, Math.min(150, camera.position.z + e.deltaY * 0.08));
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        treeGroup.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
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
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 540,
        background: 'rgba(10, 18, 28, 0.95)',
        border: '1px solid rgba(0, 229, 255, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitFork style={{ color: '#00E5FF', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#00E5FF' }}>
              3D Cladistic Phylogeny Tree
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

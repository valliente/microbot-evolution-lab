import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, Mountain } from 'lucide-react';
import { Microbot } from '../../simulation/types';

interface Waddington3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  microbots: Microbot[];
}

export const Waddington3DModal: React.FC<Waddington3DModalProps> = ({ isOpen, onClose, microbots }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 35, 75);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // Dynamic Topographical Plane for Waddington Valleys
    const planeGeo = new THREE.PlaneGeometry(80, 80, 24, 24);
    const pos = planeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      // Valley carving function
      const z = Math.sin(u * 0.12) * Math.cos(v * 0.12) * 8.0 - (v * 0.15);
      pos.setZ(i, z);
    }
    planeGeo.computeVertexNormals();

    const planeMat = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x2e1065,
      wireframe: true,
      shininess: 60
    });
    const landscapeMesh = new THREE.Mesh(planeGeo, planeMat);
    landscapeMesh.rotation.x = -Math.PI / 2.5;
    scene.add(landscapeMesh);

    // Microbot Cell Balls rolling in Waddington Valleys
    const count = Math.min(microbots.length, 40);
    const botGroup = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const bot = microbots[i];
      const sphereGeo = new THREE.SphereGeometry(1.4, 8, 8);
      const sphereMat = new THREE.MeshBasicMaterial({ color: bot.color || '#A855F7' });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(((i % 7) - 3) * 8, 5, (Math.floor(i / 7) - 2) * 8);
      botGroup.add(sphere);
    }
    scene.add(botGroup);

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
      landscapeMesh.rotation.z += deltaX * 0.005;
      landscapeMesh.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(25, Math.min(180, camera.position.z + e.deltaY * 0.08));
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        landscapeMesh.rotation.z += 0.0015;
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
        background: 'rgba(18, 14, 30, 0.95)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)',
        color: '#E6EDF3',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mountain style={{ color: '#C084FC', width: 20, height: 20 }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#C084FC' }}>
              3D Epigenetic Waddington Landscape
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

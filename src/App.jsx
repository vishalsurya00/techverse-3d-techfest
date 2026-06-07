import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Lenis from 'lenis';

import CustomLoader from './components/CustomLoader';
import Navbar from './components/Navbar';
import HudOverlay from './components/HudOverlay';
import CyberWormhole from './components/CyberWormhole';
import TechNodes from './components/TechNodes';
import Effects from './components/Effects';
import audioEngine from './utils/AudioEngine';

// Camera controller to fly through the wormhole based on scroll
function CameraController({ currentScrollY, activeSector }) {
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Map scrollY progress to Z flight position
    const totalHeight = window.innerHeight * 3;
    const progress = Math.min(1, Math.max(0, currentScrollY / totalHeight));

    // Target Z position: Starts at +4 (Sector 1) and flies down to -56 (Sector 4)
    const targetZ = 4 - progress * 65;

    // Smoothly interpolate camera position Z
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);

    // Target panning coordinates (X, Y) and focal look-at targets based on active sector
    let targetX = 0;
    let targetY = 0;
    let targetLookX = 0;
    let targetLookY = 0;
    let targetLookZ = camera.position.z - 4; // look slightly ahead by default

    if (activeSector === 0) {
      targetX = 0.8;
      targetY = 0.2;
      targetLookX = -2.2;
      targetLookY = 0.5;
      targetLookZ = 0; // Focus on Core Node
    } else if (activeSector === 1) {
      targetX = -0.8;
      targetY = -0.2;
      targetLookX = 2.2;
      targetLookY = -0.5;
      targetLookZ = -20; // Focus on Synapse Net Node
    } else if (activeSector === 2) {
      targetX = 0.8;
      targetY = 0.2;
      targetLookX = -2.2;
      targetLookY = 0.5;
      targetLookZ = -40; // Focus on Quantum Cell Node
    } else if (activeSector === 3) {
      targetX = -0.8;
      targetY = -0.2;
      targetLookX = 2.2;
      targetLookY = -0.5;
      targetLookZ = -60; // Focus on Portal Node
    }

    // Smoothly interpolate camera X & Y
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);

    // Smoothly interpolate look-at point coordinate
    lookAtRef.current.x = THREE.MathUtils.lerp(lookAtRef.current.x, targetLookX, 0.08);
    lookAtRef.current.y = THREE.MathUtils.lerp(lookAtRef.current.y, targetLookY, 0.08);
    lookAtRef.current.z = THREE.MathUtils.lerp(lookAtRef.current.z, targetLookZ, 0.08);

    camera.lookAt(lookAtRef.current);
  });

  return null;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSector, setActiveSector] = useState(0);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const lenisRef = useRef(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential out
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Bind scroll event to update React scroll positions
    lenis.on('scroll', (e) => {
      const scrollY = e.animatedScroll;
      setCurrentScrollY(scrollY);

      // Determine active sector based on scroll threshold (50% midpoint transition)
      const viewportHeight = window.innerHeight;
      const sector = Math.min(
        3,
        Math.max(0, Math.floor((scrollY + viewportHeight * 0.5) / viewportHeight))
      );
      setActiveSector(sector);
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleNavigate = (sectorId) => {
    if (lenisRef.current) {
      audioEngine.playWarp();
      lenisRef.current.scrollTo(sectorId * window.innerHeight, { duration: 1.6 });
    }
  };

  const handleNodeClick = (nodeId) => {
    handleNavigate(nodeId);
  };

  return (
    <div className="app-container">
      {/* 3D Scene Layer */}
      <div className="canvas-container">
        <Canvas camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 4] }}>
          <ambientLight intensity={0.15} />
          
          <CyberWormhole currentScrollY={currentScrollY} />
          
          <TechNodes 
            activeSector={activeSector} 
            onNodeClick={handleNodeClick} 
          />
          
          <Effects />
          
          <CameraController 
            currentScrollY={currentScrollY} 
            activeSector={activeSector} 
          />
        </Canvas>
      </div>

      {/* Futuristic Cinematic Boot Loader */}
      <CustomLoader onLoaded={() => setIsLoaded(true)} />

      {/* HUD overlays, navigation, indicators */}
      {isLoaded && (
        <>
          <div className="hud-grid" />
          <div className="hud-vignette" />
          <div className="hud-scanlines" />

          <Navbar 
            activeSector={activeSector} 
            currentScrollY={currentScrollY} 
            onNavigate={handleNavigate} 
          />
          
          <HudOverlay activeSector={activeSector} />
        </>
      )}

      {/* Invisible Scroll Anchors to structure the page scrolling height */}
      <div style={{ height: '100vh' }} id="sector-0" />
      <div style={{ height: '100vh' }} id="sector-1" />
      <div style={{ height: '100vh' }} id="sector-2" />
      <div style={{ height: '100vh' }} id="sector-3" />
    </div>
  );
}

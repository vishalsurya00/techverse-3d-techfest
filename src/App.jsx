import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Lenis from 'lenis';

import CustomLoader from './components/CustomLoader';
import Navbar from './components/Navbar';
import HudOverlay from './components/HudOverlay';
import SpaceHero from './components/SpaceHero';
import CyberWormhole from './components/CyberWormhole';
import TechNodes from './components/TechNodes';
import Effects from './components/Effects';
import audioEngine from './utils/AudioEngine';

// Camera controller with mouse parallax, forward drift, and scroll zoom
function CameraController({ currentScrollY, activeSector, mouseCoords }) {
  const { camera } = useThree();
  const lookAtTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Calculate base camera Z position from scroll progress
    // Total scroll height is 4 viewports (5 sectors = 4 * viewportHeight)
    const totalHeight = window.innerHeight * 4;
    const progress = Math.min(1, Math.max(0, currentScrollY / totalHeight));

    // Travel from space landing (Z = 20) down through the wormhole (Z = -60)
    const baseZ = 20 - progress * 80;

    // 2. Slow continuous float drift (makes the camera feel active)
    const driftX = Math.sin(time * 0.4) * 0.08;
    const driftY = Math.cos(time * 0.3) * 0.08;
    const driftZ = Math.sin(time * 0.6) * 0.12;

    // 3. Mouse Parallax Offsets
    const parallaxX = mouseCoords.current.x * 0.7;
    const parallaxY = -mouseCoords.current.y * 0.5;

    // 4. Determine base sector targets (positions & focal points)
    let targetX = 0;
    let targetY = 0;
    let targetLookX = 0;
    let targetLookY = 0;
    let targetLookZ = baseZ - 4; // look slightly ahead by default

    if (activeSector === 0) {
      // Hero screen: centered, look directly at floating Techfest logo (at Z = 15)
      targetX = 0;
      targetY = 0.1;
      targetLookX = 0;
      targetLookY = 0;
      targetLookZ = 15;
    } else if (activeSector === 1) {
      // Sector 1: Nexus Core (focus left)
      targetX = 0.8;
      targetY = 0.2;
      targetLookX = -2.2;
      targetLookY = 0.5;
      targetLookZ = 0;
    } else if (activeSector === 2) {
      // Sector 2: Synapse Net (focus right)
      targetX = -0.8;
      targetY = -0.2;
      targetLookX = 2.2;
      targetLookY = -0.5;
      targetLookZ = -20;
    } else if (activeSector === 3) {
      // Sector 3: Quantum Cell (focus left)
      targetX = 0.8;
      targetY = 0.2;
      targetLookX = -2.2;
      targetLookY = 0.5;
      targetLookZ = -40;
    } else if (activeSector === 4) {
      // Sector 4: Portal (focus right)
      targetX = -0.8;
      targetY = -0.2;
      targetLookX = 2.2;
      targetLookY = -0.5;
      targetLookZ = -60;
    }

    // 5. Interpolate Camera Coordinates (applying scroll, drift, and parallax)
    const finalTargetX = targetX + parallaxX + driftX;
    const finalTargetY = targetY + parallaxY + driftY;
    const finalTargetZ = baseZ + driftZ;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, finalTargetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, finalTargetY, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, finalTargetZ, 0.08);

    // 6. Interpolate Camera Look-At Target Coordinate
    lookAtTargetRef.current.x = THREE.MathUtils.lerp(lookAtTargetRef.current.x, targetLookX, 0.08);
    lookAtTargetRef.current.y = THREE.MathUtils.lerp(lookAtTargetRef.current.y, targetLookY, 0.08);
    lookAtTargetRef.current.z = THREE.MathUtils.lerp(lookAtTargetRef.current.z, targetLookZ, 0.08);

    camera.lookAt(lookAtTargetRef.current);
  });

  return null;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSector, setActiveSector] = useState(0);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  
  const mouseCoords = useRef({ x: 0, y: 0 });
  const lenisRef = useRef(null);

  // Capture mouse movement coordinates mapped from -1 to +1
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseCoords.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseCoords.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Bind scroll listener
    lenis.on('scroll', (e) => {
      const scrollY = e.animatedScroll;
      setCurrentScrollY(scrollY);

      // Map scroll location to 5 sectors (0 to 4)
      const viewportHeight = window.innerHeight;
      const sector = Math.min(
        4,
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

  return (
    <div className="app-container">
      {/* 3D Cinematic Universe Layer */}
      <div className="canvas-container">
        <Canvas camera={{ fov: 60, near: 0.1, far: 150, position: [0, 0.1, 20] }}>
          <ambientLight intensity={0.12} />
          
          {/* Space Hero landing assets (stars, planets, nebula, galaxies, meteors, logo) */}
          <SpaceHero />

          {/* Core wormhole flight tunnel particles and rings */}
          <CyberWormhole currentScrollY={currentScrollY} />
          
          {/* Detailed Sector Nodes (shifted downwards along Z) */}
          <TechNodes 
            activeSector={activeSector - 1} // maps activeSector [1..4] to nodes [0..3]
            onNodeClick={(id) => handleNavigate(id + 1)} 
          />
          
          <Effects />
          
          <CameraController 
            currentScrollY={currentScrollY} 
            activeSector={activeSector} 
            mouseCoords={mouseCoords}
          />
        </Canvas>
      </div>

      {/* Futuristic Cinematic Boot Loader */}
      <CustomLoader onLoaded={() => setIsLoaded(true)} />

      {/* Cyber overlay HUDs */}
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
          
          <HudOverlay 
            activeSector={activeSector} 
            onBeginJourney={() => handleNavigate(1)} 
          />
        </>
      )}

      {/* 5 scroll anchors of 100vh height each */}
      <div style={{ height: '100vh' }} id="sector-0" />
      <div style={{ height: '100vh' }} id="sector-1" />
      <div style={{ height: '100vh' }} id="sector-2" />
      <div style={{ height: '100vh' }} id="sector-3" />
      <div style={{ height: '100vh' }} id="sector-4" />
    </div>
  );
}

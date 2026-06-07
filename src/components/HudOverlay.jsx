import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, Orbit, Waypoints, Compass, Building, X } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

const SECTOR_DATA = [
  {
    title: "GALAXY OVERVIEW",
    subtitle: "Launch Sector 00",
    description: "Welcome to Techverse. You are floating in the cosmic gateway of Techfest IIT Bombay. Calibrate your sensors, charge the warp matrix, and engage hyperdrive to descend through the cybernetic sectors.",
    metrics: { efficiency: "100.0%", nodes: "STANDBY", power: "INIT" },
    icon: Compass
  },
  {
    title: "NEXUS CORE",
    subtitle: "Central Intelligence Hub",
    description: "The primary administrative center of the Techverse. Operating at sub-atomic speeds, the Nexus Core acts as the neural bridge connecting interstellar datasets and stabilizing local warp fields.",
    metrics: { efficiency: "99.98%", nodes: 4096, power: "4.2 GW" },
    icon: Orbit
  },
  {
    title: "SYNAPSE NET",
    subtitle: "Distributed Neural Web",
    description: "A living grid of bio-luminescent fiber nodes. Synapse Net manages deep learning neural relays, mirroring organic brains to dynamically route exabytes of neural streams across dimensions.",
    metrics: { efficiency: "97.42%", nodes: 16384, power: "8.9 GW" },
    icon: Waypoints
  },
  {
    title: "QUANTUM CELL",
    subtitle: "Sub-Atomic Multi-Processor",
    description: "A mathematical lattice harnessing the superposition of quantum particles. The Quantum Cell computes hyper-dimensional algorithms and models cosmic anomalies in real time.",
    metrics: { efficiency: "100.0%", nodes: 1024, power: "1.1 GW" },
    icon: Cpu
  },
  {
    title: "NEXUS PORTAL",
    subtitle: "Dimensional Bridge Gateway",
    description: "The event horizon tunnel for interstellar data projection. Operating at negative gravitational density, the Nexus Portal enables seamless transfer of digital matter.",
    metrics: { efficiency: "95.12%", nodes: 256, power: "24.6 GW" },
    icon: Activity
  },
  {
    title: "AI CYBER CITY",
    subtitle: "Cyber-Avenue Sector 05",
    description: "Welcome to the capital sector of the Techverse. Emerge from the warp portal and float down avenues lined with neon skyscrapers, falling matrix code, animated highway traffic, and drone patrols. Click buildings to query Techfest events.",
    metrics: { efficiency: "98.92%", nodes: 32768, power: "55.8 GW" },
    icon: Building
  }
];

export default function HudOverlay({ activeSector, onBeginJourney, selectedEvent, onCloseEvent }) {
  const [hovering, setHovering] = useState(false);
  const [systemLoad, setSystemLoad] = useState(12.4);

  // Custom Cursor Position Motion Values
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring physics for lag-free cursor tracking
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Check if mouse is hovering over interactive elements
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('.cyber-btn') || 
        target.closest('.nav-link') ||
        target.style.cursor === 'pointer' ||
        target.closest('.event-modal-close');
        
      setHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  // Simulate dynamically updating telemetry metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const delta = (Math.random() - 0.5) * 0.8;
        return Math.max(8.0, Math.min(18.0, Number((prev + delta).toFixed(1))));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeData = SECTOR_DATA[activeSector];
  const IconComponent = activeData ? activeData.icon : Compass;

  const handleHover = () => {
    audioEngine.playHover();
  };

  return (
    <div className="hud-layer">
      {/* Custom Neon Cursor */}
      <motion.div
        className={`custom-cursor ${hovering ? 'hovering' : ''}`}
        style={{
          left: smoothX,
          top: smoothY,
        }}
      />

      {/* Futuristic Event Dialog Modal Backdrop */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="event-modal-backdrop" onClick={onCloseEvent}>
            <motion.div
              className="event-modal glass-panel-purple"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="event-modal-header">
                <span className="text-hud text-neon-purple animate-pulse" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  // TECHFEST TRANSMISSION // {selectedEvent.type}
                </span>
                <button
                  className="event-modal-close"
                  onClick={onCloseEvent}
                  onMouseEnter={handleHover}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Title & Info */}
              <h2 className="text-hud text-neon-blue glitch" data-text={selectedEvent.title} style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '10px' }}>
                {selectedEvent.title}
              </h2>
              
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {selectedEvent.desc}
              </p>

              {/* Matrix Telemetry Details */}
              <div className="event-modal-info">
                {selectedEvent.details}
              </div>

              {/* Confirm / Action button */}
              <button
                className="cyber-btn"
                style={{ marginTop: '24px', width: '100%' }}
                onClick={() => {
                  audioEngine.playClick();
                  alert(`Connecting portal connection to ${selectedEvent.title} registration database...`);
                }}
                onMouseEnter={handleHover}
              >
                CONNECT DATAPATH
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic Central Hero Card (Only visible in Sector 0) */}
      <AnimatePresence>
        {activeSector === 0 && (
          <motion.div
            className="hero-center-panel"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 60,
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <h1 
              className="text-hud text-neon-blue glitch" 
              data-text="TECHVERSE"
              style={{
                fontSize: '84px',
                fontWeight: '900',
                letterSpacing: '14px',
                lineHeight: 1.1,
                marginBottom: '8px'
              }}
            >
              TECHVERSE
            </h1>
            <p 
              className="text-hud text-neon-purple"
              style={{
                fontSize: '18px',
                letterSpacing: '6px',
                marginBottom: '40px',
                fontWeight: '500'
              }}
            >
              Journey Through Innovation
            </p>
            <button
              className="cyber-btn"
              style={{
                padding: '16px 44px',
                fontSize: '15px',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
                borderRadius: '4px'
              }}
              onClick={() => {
                audioEngine.playClick();
                onBeginJourney();
              }}
              onMouseEnter={handleHover}
            >
              Begin Journey
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left HUD Panel - Diagnostics & Radar */}
      <div className="hud-panel-left glass-panel">
        <div>
          <div className="hud-title text-hud text-neon-blue">DIAGNOSTICS</div>
          <div className="hud-data-row" style={{ marginTop: '12px' }}>
            <span className="hud-data-label">CORE TEMP:</span>
            <span className="hud-data-val">41.2 K</span>
          </div>
          <div className="hud-data-row">
            <span className="hud-data-label">SYS CAPACITY:</span>
            <span className="hud-data-val">{systemLoad}%</span>
          </div>
          <div className="hud-data-row">
            <span className="hud-data-label">SHIELD FIELD:</span>
            <span className="hud-data-val">STABLE</span>
          </div>
        </div>

        {/* Radar Visualizer */}
        <div style={{ padding: '10px 0' }}>
          <div className="radar-container">
            <div className="radar-sweep" />
            <div className="radar-dot" />
            <span className="text-hud text-neon-pink" style={{ fontSize: '9px', position: 'absolute', bottom: '6px' }}>
              SCANNING
            </span>
          </div>
        </div>

        {/* Warning Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff007c', fontSize: '12px' }}>
          <ShieldAlert size={14} className="animate-pulse" />
          <span className="text-hud" style={{ fontSize: '10px', letterSpacing: '1px' }}>
            {activeSector === 0 ? "HYPERDRIVE STANDBY" : "SECTOR BOUNDARY ACTIVE"}
          </span>
        </div>
      </div>

      {/* Right HUD Panel - Active Sector Information */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSector}
          className="hud-panel-right glass-panel-purple"
          initial={{ opacity: 0, x: 50, filter: 'blur(5px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -50, filter: 'blur(5px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sector-info-card">
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(189, 0, 255, 0.1)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(189, 0, 255, 0.3)' }}>
                <IconComponent size={20} className="text-neon-purple" />
              </div>
              <div>
                <span className="text-hud text-neon-purple" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  LOCATION TELEMETRY
                </span>
                <h2 className="text-hud text-neon-purple" style={{ fontSize: '22px', fontWeight: 'bold' }}>
                  {activeData?.title}
                </h2>
              </div>
            </div>

            {/* Description */}
            <div className="sector-description" style={{ marginTop: '10px' }}>
              {activeData?.description}
            </div>

            {/* Stats matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(189, 0, 255, 0.15)', paddingTop: '16px', marginTop: '10px' }}>
              <div className="hud-data-row">
                <span className="hud-data-label">INDEX RATIO:</span>
                <span className="hud-data-val purple">{activeData?.metrics.efficiency}</span>
              </div>
              <div className="hud-data-row">
                <span className="hud-data-label">ACTIVE SUB-NODES:</span>
                <span className="hud-data-val purple">{activeData?.metrics.nodes}</span>
              </div>
              <div className="hud-data-row">
                <span className="hud-data-label">ENERGY OUTPUT:</span>
                <span className="hud-data-val purple">{activeData?.metrics.power}</span>
              </div>
            </div>

            {/* Micro-interaction Action */}
            <button 
              className="cyber-btn cyber-btn-purple"
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => {
                audioEngine.playClick();
                if (activeSector === 0) {
                  onBeginJourney();
                } else {
                  alert(`Initiating query payload into ${activeData?.title}...`);
                }
              }}
              onMouseEnter={handleHover}
            >
              {activeSector === 0 ? "LAUNCH MISSION" : "QUERY DATAPATH"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom HUD bar */}
      <div className="hud-panel-bottom glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span className="pulse-node" />
          <span className="text-hud" style={{ fontSize: '10px' }}>
            {activeSector === 0 ? "GATEWAY ESTABLISHED" : "SYSTEM READY [CORE ONLINE]"}
          </span>
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
          {activeSector === 5 
            ? "CLICK ON SKYSCRAPERS OR ROBOTS TO OPEN EVENT TELEMETRY FILES" 
            : activeSector === 0 
              ? "CLICK BEGIN JOURNEY TO WARP DOWN OR USE MOUSE WHEEL" 
              : "SCROLL MOUSE WHEEL TO TRAVEL THROUGH WARP HIGHWAY"
          }
        </div>
      </div>
    </div>
  );
}

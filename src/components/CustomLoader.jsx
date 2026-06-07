import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../utils/AudioEngine';

const BOOT_LOGS = [
  "INITIALIZING SYSTEM BOOT SEQUENCE...",
  "ESTABLISHING SECURE HYPER-LINK TO PORTAL 0x98F...",
  "LOADING QUANTUM GEOMETRIES...",
  "STABILIZING PARTICLE ACCELERATOR...",
  "ACTIVATING NEURAL NET CONNECTIONS...",
  "SYNCING COORDINATES WITH SECTOR ALPHA...",
  "WARP CORES FULLY CHARGED.",
  "READY FOR HYPERDRIVE ENGAGEMENT."
];

export default function CustomLoader({ onLoaded }) {
  const [progress, setProgress] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Simulate progress loading with terminal output logs
  useEffect(() => {
    const duration = 2500; // 2.5 seconds load
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Cycle through boot logs as progress increases
  useEffect(() => {
    const index = Math.min(
      Math.floor((progress / 100) * BOOT_LOGS.length),
      BOOT_LOGS.length - 1
    );
    setActiveLogIndex(index);
  }, [progress]);

  const handleEnter = () => {
    audioEngine.playClick();
    audioEngine.startDrone();
    setIsDismissed(true);
    // Let the fade-out animation play before triggering onLoaded
    setTimeout(() => {
      onLoaded();
    }, 1000);
  };

  const handleHover = () => {
    audioEngine.playHover();
  };

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          className="loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(15px)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Cyber HUD elements */}
          <div className="hud-grid" style={{ opacity: 0.25 }} />
          <div className="hud-scanlines" />

          {/* Loader Box */}
          <div className="loader-container glass-panel">
            {/* Header */}
            <div className="loader-header">
              <h2 className="text-hud text-neon-blue glitch" data-text="TECHVERSE SYSTEM" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                TECHVERSE SYSTEM
              </h2>
              <span className="loader-version animate-pulse">
                v4.0.98-ALPHA
              </span>
            </div>

            {/* Terminal logs */}
            <div className="terminal-panel">
              <div className="terminal-list">
                {BOOT_LOGS.slice(0, activeLogIndex + 1).map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={i === activeLogIndex ? "terminal-active-line" : ""}
                  >
                    &gt; {log}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress info */}
            <div className="progress-info">
              <span>LOADING NEURAL GATEWAYS...</span>
              <span className="text-neon-blue" style={{ fontWeight: 'bold' }}>{Math.round(progress)}%</span>
            </div>

            {/* Progress bar */}
            <div className="progress-track">
              <motion.div
                className="progress-bar"
                style={{ width: `${progress}%` }}
                layout
              />
            </div>

            {/* Enter Button panel */}
            <div className="loader-footer">
              <AnimatePresence mode="wait">
                {isReady ? (
                  <motion.button
                    key="enter-btn"
                    className="cyber-btn"
                    style={{ width: '100%' }}
                    onClick={handleEnter}
                    onMouseEnter={handleHover}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    INITIALIZE HYPERDRIVE
                  </motion.button>
                ) : (
                  <motion.div
                    key="syncing"
                    className="loader-status-text animate-pulse"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Synchronizing warp fields...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Decorative Corner Borders */}
          <div className="corner-tl" />
          <div className="corner-tr" />
          <div className="corner-bl" />
          <div className="corner-br" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

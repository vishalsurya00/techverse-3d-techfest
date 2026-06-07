import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

export default function Navbar({ activeSector, currentScrollY, onNavigate }) {
  const [isMuted, setIsMuted] = useState(audioEngine.isMuted);

  const handleMuteToggle = () => {
    const muteState = audioEngine.toggleMute();
    setIsMuted(muteState);
    audioEngine.playClick();
  };

  const handleHover = () => {
    audioEngine.playHover();
  };

  // Coordinates calculated from current scroll position
  const calcCoords = () => {
    // Scroll progress maps Z from +20 (Cosmic start) down to -105 (Cyber City center)
    const viewportHeight = window.innerHeight || 800;
    const progress = currentScrollY / (viewportHeight * 5); // 5 sectors of scroll height
    
    const x = Math.sin(currentScrollY * 0.002) * 16.42;
    const y = Math.cos(currentScrollY * 0.0015) * 10.84;
    const z = (20 - progress * 125).toFixed(2);
    return {
      x: x.toFixed(2),
      y: y.toFixed(2),
      z: z
    };
  };

  const coords = calcCoords();

  const navSectors = [
    { id: 0, label: 'COSMIC ENTRY' },
    { id: 1, label: 'NEXUS CORE' },
    { id: 2, label: 'SYNAPSE NET' },
    { id: 3, label: 'QUANTUM CELL' },
    { id: 4, label: 'NEXUS PORTAL' },
    { id: 5, label: 'AI CYBER CITY' }
  ];

  return (
    <header className="nav-header">
      {/* Logo */}
      <div 
        className="nav-logo text-hud text-neon-blue glitch" 
        data-text="TECHVERSE"
        style={{ cursor: 'pointer' }}
        onClick={() => onNavigate(0)}
        onMouseEnter={handleHover}
      >
        TECHVERSE
      </div>

      {/* Nav links */}
      <nav className="nav-links">
        {navSectors.map((sector) => (
          <button
            key={sector.id}
            className={`nav-link ${activeSector === sector.id ? 'active' : ''}`}
            onClick={() => {
              audioEngine.playClick();
              onNavigate(sector.id);
            }}
            onMouseEnter={handleHover}
          >
            {sector.label}
          </button>
        ))}
      </nav>

      {/* Telemetry and sound toggles */}
      <div className="nav-telemetry">
        <div className="telemetry-item">
          SEC: <span>0{activeSector}</span>
        </div>
        <div className="telemetry-item" style={{ width: '185px' }}>
          WARP COORDS: [X: <span>{coords.x}</span>, Y: <span>{coords.y}</span>, Z: <span>{coords.z}</span>]
        </div>
        
        {/* Audio Toggle button */}
        <button
          className="audio-toggle"
          onClick={handleMuteToggle}
          onMouseEnter={handleHover}
        >
          {isMuted ? (
            <>
              <VolumeX size={12} className="text-neon-pink" />
              <span>MUTED</span>
            </>
          ) : (
            <>
              <Volume2 size={12} className="text-neon-blue" />
              <span>AUDIO ON</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

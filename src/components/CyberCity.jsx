import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import audioEngine from '../utils/AudioEngine';

// Techfest Events mapped to individual skyscrapers
const CITY_EVENTS = [
  { id: 0, title: "ROBOWARS", type: "COMPETITION", desc: "India's largest combat robotics grid. Top international teams battle in an enclosed steel arena for ultimate supremacy.", details: "Date: Jan 3-5 | Arena: Sector 7 | Prize: ₹10,00,000" },
  { id: 1, title: "CODEFT", type: "HACKATHON", desc: "Elite 36-hour competitive programming and AI hackathon solving real-world global security bottlenecks.", details: "Date: Jan 3-4 | Lab: Cyber-Grid 2 | Prize: ₹5,00,000" },
  { id: 2, title: "TECHFEST EXHIBITIONS", type: "SHOWCASE", desc: "Global technology showcase featuring state-of-the-art robots, bionics, and space-exploration crafts from 20+ nations.", details: "Date: Jan 3-5 | Hall: Nexus Dome | Entry: Free" },
  { id: 3, title: "AEROMODELLING", type: "COMPETITION", desc: "International aerial maneuvers conflict. Custom drones and aircraft take flight in speed, durability, and obstacle drills.", details: "Date: Jan 4 | Field: Astro-Link | Prize: ₹4,00,000" },
  { id: 4, title: "QUANTUM MASTERCLASS", type: "WORKSHOP", desc: "Practical hands-on training sessions in quantum cryptography and distributed ledger structures led by industry pioneers.", details: "Date: Jan 5 | Center: Synapse Hall | Registration: Required" },
  { id: 5, title: "KEYNOTE LECTURES", type: "SUMMIT", desc: "Thought leadership presentations from Nobel Laureates, field medalists, and directors of global science agencies.", details: "Date: Jan 3-5 | Theater: Quantum Stage | Schedule: Live on HUD" },
  { id: 6, title: "INTERNATIONAL CODING", type: "COMPETITION", desc: "Global coding duel. Speed-running algorithmic debugging and system stress-testing challenges against global leaders.", details: "Date: Jan 4-5 | Platform: Cloud Nexus | Prize: ₹6,00,000" },
  { id: 7, title: "BIO-TECH MATRIX", type: "SHOWCASE", desc: "Showcasing micro-bionic implants, neural prosthetics, and organ regeneration matrices.", details: "Date: Jan 3-5 | Arena: Bio-Nexus | Entry: Free" },
  { id: 8, title: "FINTECH SUMMIT", type: "SUMMIT", desc: "Exploring decentralized financial networks, smart cyber-assets, and high-frequency algorithms.", details: "Date: Jan 5 | Center: Block Room 8 | Entry: Open" },
  { id: 9, title: "CYBER SECURITY NEXUS", type: "COMPETITION", desc: "CTF (Capture The Flag) cyber-warfare tournament testing penetration, system defense, and decryptions.", details: "Date: Jan 3 | Lab: Matrix Sandbox | Prize: ₹3,50,000" }
];

// Sub-component: Bounding-box and rotating scanlines hologram on hover
function HoverHologram({ size, color }) {
  const scanRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Smooth scanning plane animation up and down
    if (scanRef.current) {
      const height = size[1];
      scanRef.current.position.y = Math.sin(time * 3.5) * (height / 2);
    }
    
    // Counter-rotating tech rings
    if (ringRef1.current) {
      ringRef1.current.rotation.z = time * 2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -time * 1.5;
    }
  });

  const height = size[1];
  const width = size[0];
  const depth = size[2];

  return (
    <group>
      {/* Horizontal Scanning Plane */}
      <mesh ref={scanRef}>
        <boxGeometry args={[width + 0.16, 0.08, depth + 0.16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.8} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Expanded Holographic Wireframe Envelope */}
      <mesh>
        <boxGeometry args={[width + 0.3, height + 0.3, depth + 0.3]} />
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.18} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting rings at top of the building */}
      <group position={[0, height / 2 + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={ringRef1}>
          <ringGeometry args={[width / 2 + 0.1, width / 2 + 0.22, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} wireframe />
        </mesh>
        <mesh ref={ringRef2}>
          <ringGeometry args={[width / 2 + 0.28, width / 2 + 0.32, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} wireframe />
        </mesh>
      </group>
    </group>
  );
}

// Single Skyscraper Component
function Skyscraper({ data, position, size, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const buildingRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (hovered && buildingRef.current) {
      // Gentle scale pulse when hovered
      const scale = 1.0 + Math.sin(time * 8) * 0.01;
      buildingRef.current.scale.set(scale, scale, scale);
    } else if (buildingRef.current) {
      buildingRef.current.scale.set(1, 1, 1);
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    audioEngine.playHover();
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    audioEngine.playClick();
    onSelect(data);
  };

  // Determine neon theme color based on event type
  const neonColor = useMemo(() => {
    if (data.type === "COMPETITION") return "#ff007c"; // neon pink
    if (data.type === "HACKATHON") return "#bd00ff"; // purple
    if (data.type === "SHOWCASE") return "#00f0ff"; // blue
    return "#39ff14"; // green for summits/workshops
  }, [data.type]);

  const buildingHeight = size[1];

  return (
    <group position={position} ref={buildingRef}>
      {/* Base Solid Core */}
      <mesh 
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={size} />
        <meshBasicMaterial 
          color="#060613" 
          transparent 
          opacity={0.88} 
        />
      </mesh>

      {/* Wireframe Neon Boundary Grid */}
      <mesh>
        <boxGeometry args={[size[0] + 0.04, size[1] + 0.04, size[2] + 0.04]} />
        <meshBasicMaterial 
          color={hovered ? "#ffffff" : neonColor} 
          wireframe 
          transparent 
          opacity={hovered ? 0.85 : 0.45} 
        />
      </mesh>

      {/* Internal Core Glowing Grid */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size[0] - 0.05, size[1] - 0.1, size[2] - 0.05]} />
        <meshBasicMaterial 
          color={neonColor} 
          wireframe 
          transparent 
          opacity={hovered ? 0.3 : 0.14} 
        />
      </mesh>

      {/* Building Vertical Beacon Strip */}
      <mesh position={[0, buildingHeight / 2 + 0.3, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>

      {/* Hover-triggered holographic scan effect */}
      {hovered && <HoverHologram size={size} color={neonColor} />}
      
      {/* Interactive Tag overlay on hover */}
      <Html distanceFactor={10} position={[0, buildingHeight / 2 + 0.8, 0]} center>
        <div
          className="text-hud"
          style={{
            background: hovered ? neonColor : 'rgba(3, 3, 12, 0.85)',
            border: `1px solid ${hovered ? '#ffffff' : neonColor}`,
            color: hovered ? '#000000' : '#ffffff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '8px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            transition: 'all 0.2s',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: hovered ? `0 0 15px ${neonColor}` : 'none'
          }}
        >
          {hovered ? `[SELECT] ${data.title}` : data.title}
        </div>
      </Html>
    </group>
  );
}

// 3D Floating Holographic Billboard
function HolographicBillboard({ position, size = [2.6, 1.3], text, color = "#00f0ff" }) {
  const boardRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Floating bounce offset
    if (boardRef.current) {
      boardRef.current.position.y = position[1] + Math.sin(time * 1.6 + position[2]) * 0.12;
      boardRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
    }
  });

  return (
    <group ref={boardRef} position={position}>
      {/* Main frame border */}
      <mesh>
        <planeGeometry args={[size[0] + 0.08, size[1] + 0.08]} />
        <meshBasicMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.35} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Screen Mesh */}
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial 
          color="#03030c" 
          transparent 
          opacity={0.7} 
        />
      </mesh>

      {/* Embedded grid overlay */}
      <gridHelper 
        args={[size[0] * 2, 6, color, color]} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, 0.005]}
        opacity={0.12}
        transparent
      />

      {/* Text element projected inside 3D space */}
      <Html 
        distanceFactor={8} 
        position={[0, 0, 0.01]} 
        center
        transform
        sprite
      >
        <div
          className="glitch font-bold"
          data-text={text}
          style={{
            fontFamily: "'Courier New', monospace",
            color: color,
            fontSize: '20px',
            letterSpacing: '2px',
            textAlign: 'center',
            textShadow: `0 0 8px ${color}`,
            userSelect: 'none',
            whiteSpace: 'nowrap',
            padding: '5px 12px',
            border: `1px solid ${color}`,
            background: 'rgba(3, 3, 12, 0.9)',
            boxShadow: `0 0 10px ${color}33, inset 0 0 10px ${color}22`
          }}
        >
          {text}
        </div>
      </Html>
    </group>
  );
}

// Falling green matrix digital rain stream
function EnhancedDigitalRain() {
  const rainRef = useRef();
  const count = 100; // number of rain streams

  const streams = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() > 0.5;
      const x = isLeft ? -4.3 - Math.random() * 0.8 : 4.3 + Math.random() * 0.8;
      const startY = 5 + Math.random() * 10;
      const z = -90 - Math.random() * 90;
      const length = 0.6 + Math.random() * 1.4;
      const speed = 0.08 + Math.random() * 0.15;
      arr.push({ x, y: startY, z, length, speed });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (rainRef.current) {
      rainRef.current.children.forEach((stream, idx) => {
        const data = streams[idx];
        data.y -= data.speed;
        
        // Wrap around when it hits pavement level
        if (data.y < -3.2) {
          data.y = 8 + Math.random() * 6;
        }

        stream.position.y = data.y;
      });
    }
  });

  return (
    <group ref={rainRef}>
      {streams.map((stream, idx) => (
        <mesh key={idx} position={[stream.x, stream.y, stream.z]}>
          <cylinderGeometry args={[0.012, 0.012, stream.length, 4]} />
          <meshBasicMaterial 
            color="#39ff14" 
            transparent 
            opacity={0.4 + Math.random() * 0.4} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Detailed Hover Vehicle (Hover Car)
function HoverCar({ positionY, isLeftLane, speed, startZ, colorTheme }) {
  const carRef = useRef();
  const laneX = isLeftLane ? -1.35 : 1.35;
  const direction = isLeftLane ? 1 : -1; // 1: approaches camera, -1: retreats camera
  
  const zRef = useRef(startZ);

  useFrame((state) => {
    zRef.current += speed * direction;
    
    // Wrap around boundaries (extended street goes to -180)
    if (direction === 1 && zRef.current > -90) {
      zRef.current = -180;
    } else if (direction === -1 && zRef.current < -180) {
      zRef.current = -90;
    }
    
    if (carRef.current) {
      carRef.current.position.z = zRef.current;
      // Hover bobbing
      carRef.current.position.y = positionY + Math.sin(state.clock.getElapsedTime() * 5 + startZ) * 0.04;
    }
  });

  const bodyColor = colorTheme === "cyan" ? "#00f0ff" : "#ff007c";

  return (
    <group ref={carRef} position={[laneX, positionY, startZ]}>
      {/* Car Chassis */}
      <mesh>
        <boxGeometry args={[0.3, 0.12, 0.65]} />
        <meshBasicMaterial color="#0c0c1e" />
      </mesh>
      
      {/* Glow Cockpit Glass */}
      <mesh position={[0, 0.08, -0.05]}>
        <boxGeometry args={[0.22, 0.08, 0.3]} />
        <meshBasicMaterial color={bodyColor} transparent opacity={0.65} />
      </mesh>

      {/* Side Neon Stripes */}
      <mesh position={[0.155, 0, 0]}>
        <boxGeometry args={[0.01, 0.03, 0.45]} />
        <meshBasicMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.155, 0, 0]}>
        <boxGeometry args={[0.01, 0.03, 0.45]} />
        <meshBasicMaterial color={bodyColor} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.1, -0.02, isLeftLane ? 0.33 : -0.33]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      <mesh position={[0.1, -0.02, isLeftLane ? 0.33 : -0.33]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Taillights */}
      <mesh position={[-0.1, -0.02, isLeftLane ? -0.33 : 0.33]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#ff0044" />
      </mesh>
      <mesh position={[0.1, -0.02, isLeftLane ? -0.33 : 0.33]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#ff0044" />
      </mesh>

      {/* Thruster Flame Core */}
      <mesh position={[0, -0.01, isLeftLane ? -0.36 : 0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.01, 0.16, 8]} />
        <meshBasicMaterial 
          color={bodyColor} 
          transparent 
          opacity={0.8} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}


// Detailed Quadcopter Drone Sub-component
function DetailedDrone({ initialPos, color, freq, amplitude, offsetZ }) {
  const droneRef = useRef();
  const rotorsRef = useRef([]);
  const beamRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (droneRef.current) {
      // Natural drifting flight coordinates
      droneRef.current.position.y = initialPos[1] + Math.sin(time * freq) * amplitude;
      droneRef.current.position.x = initialPos[0] + Math.cos(time * 0.6 + offsetZ) * 1.1;
      droneRef.current.position.z = initialPos[2] + Math.sin(time * 0.35) * 1.4;

      // Dynamic tilt based on motion direction
      droneRef.current.rotation.z = Math.sin(time * 0.6 + offsetZ) * 0.07;
      droneRef.current.rotation.x = Math.cos(time * 0.35) * 0.05;
    }

    // Rotors blade animation
    rotorsRef.current.forEach((rotor) => {
      if (rotor) {
        rotor.rotation.y = time * 24;
      }
    });

    // Volumetric scanner cone sweeping animation
    if (beamRef.current) {
      beamRef.current.rotation.z = Math.sin(time * 1.6) * 0.12;
      beamRef.current.rotation.x = Math.cos(time * 1.1) * 0.12;
    }
  });

  return (
    <group ref={droneRef} position={initialPos}>
      {/* Quadcopter main frame */}
      <mesh>
        <boxGeometry args={[0.26, 0.1, 0.26]} />
        <meshBasicMaterial color="#111124" />
      </mesh>
      {/* Emissive core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Quadcopter Arms */}
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.62, 0.03, 0.05]} />
        <meshBasicMaterial color="#2d2d54" />
      </mesh>
      <mesh rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.62, 0.03, 0.05]} />
        <meshBasicMaterial color="#2d2d54" />
      </mesh>

      {/* 4 Rotor motor assemblies and blades */}
      {[-0.22, 0.22].map((x, i) => 
        [-0.22, 0.22].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, 0.05, z]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 0.05, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh ref={(el) => (rotorsRef.current[i * 2 + j] = el)} position={[0, 0.025, 0]}>
              <boxGeometry args={[0.2, 0.01, 0.015]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
            </mesh>
          </group>
        ))
      )}

      {/* Volumetric Scan Light Beam */}
      <group ref={beamRef} position={[0, -0.08, 0]}>
        <mesh rotation={[Math.PI, 0, 0]} position={[0, -1.8, 0]}>
          <coneGeometry args={[0.55, 3.6, 16, 1, true]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.12} 
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight color={color} intensity={2} distance={5} decay={1.5} position={[0, -0.2, 0]} />
      </group>
    </group>
  );
}

// Interactive Robot patrolling pavements
function InteractiveRobot({ name, tag, status, details, desc, position, color, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef();
  const robotRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 1.5;
      ringRef.current.scale.setScalar(1 + Math.sin(time * 5) * 0.04);
    }
    if (robotRef.current) {
      robotRef.current.rotation.y = Math.sin(time * 0.8) * 0.25;
      if (hovered) {
        const scaleVal = 1.0 + Math.sin(time * 9) * 0.015;
        robotRef.current.scale.set(scaleVal, scaleVal, scaleVal);
      } else {
        robotRef.current.scale.set(1, 1, 1);
      }
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    audioEngine.playHover();
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    audioEngine.playClick();
    onSelect({
      title: name,
      type: "ROBOTIC TELEMETRY",
      desc: desc,
      details: `Status: ${status} | ${details}`
    });
  };

  return (
    <group position={position}>
      {/* Swivel Robot group */}
      <group 
        ref={robotRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Chassis Track Base */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.22, 0.25, 0.24, 8]} />
          <meshBasicMaterial color="#16162a" wireframe={!hovered} />
        </mesh>
        
        {/* Track Wheels */}
        <mesh position={[0.21, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.07, 8]} />
          <meshBasicMaterial color="#080812" />
        </mesh>
        <mesh position={[-0.21, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.07, 8]} />
          <meshBasicMaterial color="#080812" />
        </mesh>

        {/* Torso swivels */}
        <mesh position={[0, -0.21, 0]}>
          <boxGeometry args={[0.22, 0.3, 0.22]} />
          <meshBasicMaterial color="#1f1f38" />
        </mesh>
        
        {/* Torso Glowing Chest light */}
        <mesh position={[0, -0.21, 0.12]}>
          <boxGeometry args={[0.12, 0.06, 0.02]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Neck connector */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
          <meshBasicMaterial color="#2d2d2d" />
        </mesh>

        {/* Scanning Head */}
        <mesh position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color="#101020" />
        </mesh>
        
        {/* Glowing Head Visor */}
        <mesh position={[0, 0.15, 0.115]}>
          <boxGeometry args={[0.14, 0.035, 0.05]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Whip Antenna */}
        <mesh position={[0.07, 0.3, -0.04]}>
          <cylinderGeometry args={[0.01, 0.01, 0.18, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Bending / pulsing holographic compass circle at the base */}
      <mesh ref={ringRef} position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.42, 16]} />
        <meshBasicMaterial 
          color={hovered ? "#ffffff" : color} 
          transparent 
          opacity={hovered ? 0.9 : 0.4} 
          wireframe 
        />
      </mesh>

      {/* Localized lighting */}
      <pointLight color={color} intensity={1.5} distance={2.5} position={[0, 0, 0.2]} />

      {/* Floating Tag */}
      <Html distanceFactor={6} position={[0, 0.65, 0]} center>
        <span 
          className="text-hud font-bold animate-pulse" 
          style={{ 
            color: color, 
            fontSize: '7px', 
            letterSpacing: '1px',
            backgroundColor: 'rgba(3,3,12,0.85)',
            padding: '2px 6px',
            border: `1px solid ${hovered ? '#ffffff' : color}`,
            borderRadius: '3px',
            whiteSpace: 'nowrap'
          }}
        >
          {tag}
        </span>
      </Html>
    </group>
  );
}

// Floating Central Hologram
function CentralAihologram() {
  const hologramRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (hologramRef.current) {
      hologramRef.current.rotation.y = time * 0.45;
      hologramRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = -time * 0.6;
    }
  });

  return (
    <group position={[0, 2.2, -112]}>
      {/* Core floating geometry */}
      <mesh ref={hologramRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          wireframe 
          transparent 
          opacity={0.65} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner pulsing core */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial 
          color="#ff007c" 
          transparent 
          opacity={0.7} 
        />
      </mesh>

      {/* Orbiting HUD grid ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.1, 1.25, 6]} />
        <meshBasicMaterial 
          color="#bd00ff" 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.4} 
          wireframe
        />
      </mesh>

      {/* Floating Hologram Label */}
      <Html distanceFactor={8} position={[0, 1.5, 0]} center>
        <div
          className="text-hud text-neon-pink"
          style={{
            background: 'rgba(3, 3, 12, 0.8)',
            border: '1px solid rgba(255, 0, 124, 0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '7px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            letterSpacing: '1px'
          }}
        >
          [AI_NEXUS_CORE]
        </div>
      </Html>
    </group>
  );
}

// Main City Component
export default function CyberCity({ onSelectEvent }) {
  // Building heights and positions
  const skyscrapersList = useMemo(() => {
    const leftX = -4.8;
    const rightX = 4.8;
    
    return [
      // Left side skyscrapers
      { id: 0, pos: [leftX, 1.5, -95], size: [1.8, 9.0, 1.8], data: CITY_EVENTS[0] },
      { id: 1, pos: [leftX, 0.5, -105], size: [2.0, 7.0, 2.0], data: CITY_EVENTS[1] },
      { id: 2, pos: [leftX, 2.5, -115], size: [2.2, 11.0, 2.2], data: CITY_EVENTS[2] },
      { id: 3, pos: [leftX, 1.0, -125], size: [1.8, 8.0, 1.8], data: CITY_EVENTS[3] },
      { id: 4, pos: [leftX, 3.5, -135], size: [2.4, 13.0, 2.4], data: CITY_EVENTS[4] },
      // Left side extra decorative towers
      { id: 10, pos: [leftX, 2.0, -145], size: [2.0, 10.0, 2.0], data: { title: "NEXUS GRID", type: "INFRASTRUCTURE", desc: "Main traffic and data packet routing mainframe node for Sector 5 Cyber-Avenue.", details: "Grid Status: 99.4% | Host: Nexus Core" } },
      { id: 11, pos: [leftX, 0.8, -155], size: [1.8, 7.5, 1.8], data: { title: "QUANTUM RELAY", type: "INFRASTRUCTURE", desc: "Local sub-atomic wave-function coherence relay. Stabilizes inter-dimensional linkages.", details: "Sync Factor: 0.99992 | State: Coherent" } },
      { id: 12, pos: [leftX, 3.0, -165], size: [2.2, 12.0, 2.2], data: { title: "CORE RECEPTOR", type: "INFRASTRUCTURE", desc: "High-voltage warp plasma feed intake supplying power grid of Sector 5.", details: "Energy: 89,240 MW | Feed Temp: 42 K" } },
      { id: 13, pos: [leftX, 1.5, -175], size: [1.8, 8.5, 1.8], data: { title: "SYNAPSE BUFFER", type: "INFRASTRUCTURE", desc: "Data cache memory arrays managing incoming bionic neural signals.", details: "Usage: 42.1% | Bandwidth: 1.2 Yb/s" } },
      
      // Right side skyscrapers
      { id: 5, pos: [rightX, 2.0, -95], size: [2.0, 10.0, 2.0], data: CITY_EVENTS[5] },
      { id: 6, pos: [rightX, 0.8, -105], size: [1.8, 7.6, 1.8], data: CITY_EVENTS[6] },
      { id: 7, pos: [rightX, 3.0, -115], size: [2.4, 12.0, 2.4], data: CITY_EVENTS[7] },
      { id: 8, pos: [rightX, 1.5, -125], size: [2.0, 9.0, 2.0], data: CITY_EVENTS[8] },
      { id: 9, pos: [rightX, 2.5, -135], size: [1.8, 11.0, 1.8], data: CITY_EVENTS[9] },
      // Right side extra decorative towers
      { id: 14, pos: [rightX, 1.0, -145], size: [1.8, 8.0, 1.8], data: { title: "WARP CALIBRATOR", type: "INFRASTRUCTURE", desc: "Gravitational shear filtering unit. Prevents dimensional drift in local streets.", details: "Shear Offset: 0.002deg | Status: Nominal" } },
      { id: 15, pos: [rightX, 3.5, -155], size: [2.4, 13.0, 2.4], data: { title: "NEURAL HUB", type: "INFRASTRUCTURE", desc: "Autonomous AI hub node handling security droids and scanning grids.", details: "Active Sentinels: 3 | Signal: Strength 100" } },
      { id: 16, pos: [rightX, 2.0, -165], size: [2.0, 9.5, 2.0], data: { title: "BIO MATRIX LINK", type: "INFRASTRUCTURE", desc: "Cybernetic prosthetics feedback sync core for sector citizens.", details: "Sync Rate: 98.42% | Latency: 0.2 ns" } },
      { id: 17, pos: [rightX, 2.8, -175], size: [1.8, 11.0, 1.8], data: { title: "SECURE PORT 05", type: "INFRASTRUCTURE", desc: "Avenue boundary security firewall and packet filtering node.", details: "Packet filter: active | Rules: 4096" } },
    ];
  }, []);

  // Preset start positions and configurations for Hover Cars
  const hoverCarsList = useMemo(() => {
    return [
      { id: 0, positionY: -2.8, isLeftLane: true, speed: 0.12, startZ: -95, colorTheme: "cyan" },
      { id: 1, positionY: -2.8, isLeftLane: true, speed: 0.16, startZ: -120, colorTheme: "purple" },
      { id: 2, positionY: -2.8, isLeftLane: true, speed: 0.10, startZ: -145, colorTheme: "cyan" },
      { id: 3, positionY: -2.8, isLeftLane: true, speed: 0.14, startZ: -170, colorTheme: "purple" },
      
      { id: 4, positionY: -2.8, isLeftLane: false, speed: 0.11, startZ: -105, colorTheme: "purple" },
      { id: 5, positionY: -2.8, isLeftLane: false, speed: 0.15, startZ: -130, colorTheme: "cyan" },
      { id: 6, positionY: -2.8, isLeftLane: false, speed: 0.13, startZ: -155, colorTheme: "purple" },
      { id: 7, positionY: -2.8, isLeftLane: false, speed: 0.17, startZ: -175, colorTheme: "cyan" },
    ];
  }, []);

  return (
    <group>
      {/* 3D Skyscrapers */}
      {skyscrapersList.map((sky) => (
        <Skyscraper
          key={sky.id}
          data={sky.data}
          position={sky.pos}
          size={sky.size}
          onSelect={onSelectEvent}
        />
      ))}

      {/* Cyber Highway Pavement (extended Z range) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.0, -135]}>
        <planeGeometry args={[7, 95]} />
        <meshBasicMaterial 
          color="#040409" 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      
      {/* Pavement Wireframe border lines (extended Z range) */}
      <gridHelper 
        args={[95, 15, '#00f0ff', 'rgba(189,0,255,0.2)']} 
        position={[0, -2.98, -135]} 
        opacity={0.25} 
        transparent
      />

      {/* Detailed Animated Hover Cars in Traffic Lanes */}
      {hoverCarsList.map((car) => (
        <HoverCar
          key={car.id}
          positionY={car.positionY}
          isLeftLane={car.isLeftLane}
          speed={car.speed}
          startZ={car.startZ}
          colorTheme={car.colorTheme}
        />
      ))}

      {/* Falling green cylinder code streams */}
      <EnhancedDigitalRain />

      {/* Flying detailed patrol drones with searchlights */}
      <DetailedDrone 
        initialPos={[-2.5, 4.0, -100]} 
        color="#00f0ff" 
        freq={0.7} 
        amplitude={0.8} 
        offsetZ={0} 
      />
      <DetailedDrone 
        initialPos={[2.5, 4.5, -135]} 
        color="#ff007c" 
        freq={0.6} 
        amplitude={1.1} 
        offsetZ={2.0} 
      />
      <DetailedDrone 
        initialPos={[-3.2, 5.0, -165]} 
        color="#bd00ff" 
        freq={0.5} 
        amplitude={0.9} 
        offsetZ={4.5} 
      />

      {/* Holographic Billboard Ads floating in space */}
      <HolographicBillboard 
        position={[-5.8, 6.5, -100]} 
        text="TECHFEST 2026" 
        color="#ff007c" 
      />
      <HolographicBillboard 
        position={[5.8, 7.5, -125]} 
        text="AI NEXUS ONLINE" 
        color="#bd00ff" 
      />
      <HolographicBillboard 
        position={[-5.8, 8.0, -150]} 
        text="QUANTUM CORE" 
        color="#00f0ff" 
      />
      <HolographicBillboard 
        position={[0, 7.0, -170]} 
        text="REGISTER NOW" 
        color="#39ff14" 
      />

      {/* Floating Central Hologram */}
      <CentralAihologram />

      {/* Sidewalk futuristic robot core patrol (Interactive Sentinel Droid 01) */}
      <InteractiveRobot 
        name="NEURAL SENTINEL" 
        tag="[SENTINEL_01]" 
        status="Active" 
        details="Firmware: 8.5-STABLE | Charge: 100%" 
        desc="Autonomous security unit deployed to safeguard Sector 05 avenues. Performs scans of local warp streams."
        position={[-2.2, -2.3, -98]} 
        color="#39ff14" 
        onSelect={onSelectEvent} 
      />

      {/* Interactive Surveyor Droid 02 */}
      <InteractiveRobot 
        name="NEXUS SURVEYOR" 
        tag="[SURVEYOR_02]" 
        status="Scanning" 
        details="Data Relay: 94.2% | Buffer: OK" 
        desc="Research drone charting sub-atomic anomalies and logging local building matrix signals."
        position={[2.2, -2.3, -132]} 
        color="#00f0ff" 
        onSelect={onSelectEvent} 
      />

      {/* Interactive BioMonitor Droid 03 */}
      <InteractiveRobot 
        name="BIO-MONITOR DROID" 
        tag="[BIOMON_03]" 
        status="Calibrating" 
        details="Sensors: ACTIVE | Drift: 0.02ppm" 
        desc="Monitors environmental safety and bio-prosthetic synchronization ratios for incoming warp travelers."
        position={[-2.2, -2.3, -162]} 
        color="#ff007c" 
        onSelect={onSelectEvent} 
      />
    </group>
  );
}

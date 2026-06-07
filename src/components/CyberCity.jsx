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
          opacity={0.85} 
        />
      </mesh>

      {/* Wireframe Neon Boundary Grid */}
      <mesh>
        <boxGeometry args={[size[0] + 0.04, size[1] + 0.04, size[2] + 0.04]} />
        <meshBasicMaterial 
          color={hovered ? "#ffffff" : neonColor} 
          wireframe 
          transparent 
          opacity={hovered ? 0.8 : 0.4} 
        />
      </mesh>

      {/* Internal Core Lights (Simulates glowing window grid) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size[0] - 0.05, size[1] - 0.1, size[2] - 0.05]} />
        <meshBasicMaterial 
          color={neonColor} 
          wireframe 
          transparent 
          opacity={hovered ? 0.25 : 0.12} 
        />
      </mesh>

      {/* Building Vertical Beacon Strip */}
      <mesh position={[0, buildingHeight / 2 + 0.3, 0]}>
        <boxGeometry args={[0.08, 0.6, 0.08]} />
        <meshBasicMaterial color={neonColor} />
      </mesh>
      
      {/* Interactive Tag overlay on hover */}
      <Html distanceFactor={10} position={[0, buildingHeight / 2 + 0.8, 0]} center>
        <div
          className="text-hud"
          style={{
            background: hovered ? neonColor : 'rgba(3, 3, 12, 0.85)',
            border: `1px solid ${hovered ? '#ffffff' : neonColor}`,
            color: hovered ? '#000000' : '#ffffff',
            padding: '3px 8px',
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
          {data.title}
        </div>
      </Html>
    </group>
  );
}

// Falling Matrix Digital Rain down the skyscrapers
function DigitalRain() {
  const rainRef = useRef();
  const particleCount = 600;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Align close to building planes (X = -4.2 or X = 4.2)
      const isLeft = Math.random() > 0.5;
      pos[i * 3] = isLeft ? -4.3 - Math.random() * 0.5 : 4.3 + Math.random() * 0.5;
      pos[i * 3 + 1] = -2 + Math.random() * 12; // heights
      pos[i * 3 + 2] = -90 - Math.random() * 45; // depth range

      spd[i] = 0.05 + Math.random() * 0.12;
    }
    return [pos, spd];
  }, []);

  useFrame(() => {
    if (rainRef.current) {
      const positionsArray = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Fall down
        positionsArray[i * 3 + 1] -= speeds[i];

        // Reset to top when passing ground plane
        if (positionsArray[i * 3 + 1] < -3) {
          positionsArray[i * 3 + 1] = 9;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#39ff14" // digital green
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

// Animated Pavement Traffic Lights
function TrafficLanes() {
  const trafficRef = useRef();
  const count = 40;

  const [positions, directions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const dirs = new Float32Array(count); // -1 (forward headlight), +1 (backward taillight)

    for (let i = 0; i < count; i++) {
      const isLeftLane = i % 2 === 0;
      pos[i * 3] = isLeftLane ? -1.4 : 1.4; // left or right lanes
      pos[i * 3 + 1] = -2.8; // slightly above pavement
      pos[i * 3 + 2] = -90 - Math.random() * 45; // random Z depth

      dirs[i] = isLeftLane ? 1 : -1;
    }
    return [pos, dirs];
  }, []);

  useFrame(() => {
    if (trafficRef.current) {
      const posArray = trafficRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const speed = 0.18;
        posArray[i * 3 + 2] += speed * directions[i];

        // Wrap Z coordinates when they exit bounds
        if (directions[i] === 1 && posArray[i * 3 + 2] > -90) {
          posArray[i * 3 + 2] = -135;
        } else if (directions[i] === -1 && posArray[i * 3 + 2] < -135) {
          posArray[i * 3 + 2] = -90;
        }
      }
      trafficRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Re-map colors for white headlights vs red taillights
  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const isLeftLane = i % 2 === 0;
      if (isLeftLane) {
        // White/Cyan Headlights
        cols[i * 3] = 0; cols[i * 3 + 1] = 0.94; cols[i * 3 + 2] = 1;
      } else {
        // Red/Pink Taillights
        cols[i * 3] = 1; cols[i * 3 + 1] = 0; cols[i * 3 + 2] = 0.48;
      }
    }
    return cols;
  }, []);

  return (
    <points ref={trafficRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

// Flying Drones in Sky
function FlyingDrones() {
  const dronesRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (dronesRef.current) {
      dronesRef.current.children.forEach((drone, index) => {
        // Drones fly in sinusoidal waves in the sky
        const freq = 0.6 + index * 0.2;
        const amplitude = 1.2 + index * 0.4;
        
        drone.position.y = 3 + Math.sin(time * freq) * amplitude;
        drone.position.x = (index % 2 === 0 ? -2.5 : 2.5) + Math.cos(time * 0.8 + index) * 0.8;
        
        // Spin the drone rotors (first child of mesh group)
        if (drone.children[1]) {
          drone.children[1].rotation.y = time * 20;
        }
      });
    }
  });

  return (
    <group ref={dronesRef}>
      {/* Drone 1 */}
      <group position={[-2.5, 3, -100]}>
        <mesh>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        {/* Rotors */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.04]} />
          <meshBasicMaterial color="#bd00ff" />
        </mesh>
        {/* Beacon light */}
        <pointLight color="#ff007c" intensity={2} distance={3} />
      </group>

      {/* Drone 2 */}
      <group position={[2.5, 4, -115]}>
        <mesh>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#ff007c" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.04]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        <pointLight color="#00f0ff" intensity={2} distance={3} />
      </group>

      {/* Drone 3 */}
      <group position={[-3, 5, -125]}>
        <mesh>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#bd00ff" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <pointLight color="#bd00ff" intensity={2} distance={3} />
      </group>
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
      {/* Core floating geometry (simulates holographic brain/skull) */}
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
      
      // Right side skyscrapers
      { id: 5, pos: [rightX, 2.0, -95], size: [2.0, 10.0, 2.0], data: CITY_EVENTS[5] },
      { id: 6, pos: [rightX, 0.8, -105], size: [1.8, 7.6, 1.8], data: CITY_EVENTS[6] },
      { id: 7, pos: [rightX, 3.0, -115], size: [2.4, 12.0, 2.4], data: CITY_EVENTS[7] },
      { id: 8, pos: [rightX, 1.5, -125], size: [2.0, 9.0, 2.0], data: CITY_EVENTS[8] },
      { id: 9, pos: [rightX, 2.5, -135], size: [1.8, 11.0, 1.8], data: CITY_EVENTS[9] },
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

      {/* Cyber Highway Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.0, -115]}>
        <planeGeometry args={[7, 50]} />
        <meshBasicMaterial 
          color="#040409" 
          transparent 
          opacity={0.9} 
        />
      </mesh>
      
      {/* Pavement Wireframe border lines */}
      <gridHelper 
        args={[50, 10, '#00f0ff', 'rgba(189,0,255,0.2)']} 
        position={[0, -2.98, -115]} 
        opacity={0.2} 
        transparent
      />

      {/* Traffic head/taillights */}
      <TrafficLanes />

      {/* Falling green rain */}
      <DigitalRain />

      {/* Flying patrol drones */}
      <FlyingDrones />

      {/* Floating Hologram */}
      <CentralAihologram />

      {/* Sidewalk futuristic robot core (Interactive node) */}
      <group 
        position={[-2.2, -2.2, -108]}
        onClick={(e) => {
          e.stopPropagation();
          audioEngine.playClick();
          onSelectEvent({
            title: "NEURAL SENTINEL",
            type: "AI GUARD",
            desc: "Autonomous Security Robot deployed to guard the entry nodes of Sector 5. Communicates with Core Intelligence.",
            details: "Status: Active | Firmware: 8.5-STABLE | Energy: 100%"
          });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          audioEngine.playHover();
        }}
      >
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 12]} />
          <meshBasicMaterial color="#39ff14" wireframe />
        </mesh>
        <pointLight color="#39ff14" intensity={2} distance={3} />
        <Html distanceFactor={6} position={[0, 0.6, 0]} center>
          <span className="text-hud animate-pulse" style={{ color: '#39ff14', fontSize: '6px' }}>
            [SENTINEL_01]
          </span>
        </Html>
      </group>
    </group>
  );
}

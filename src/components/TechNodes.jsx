import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import audioEngine from '../utils/AudioEngine';

// Node 1: Nexus Core (Sphere with Saturn rings & satellites)
function NexusCore({ active, onClick }) {
  const groupRef = useRef();
  const sphereRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.3;
      sphereRef.current.rotation.x = time * 0.1;
    }
    if (groupRef.current) {
      // Gentle bobbing effect
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.15;
    }
  });

  const scale = hovered ? 1.2 : 1.0;

  return (
    <group 
      ref={groupRef} 
      position={[-2.2, 0.5, 0]} 
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        audioEngine.playHover();
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Central Core Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          wireframe 
          transparent 
          opacity={active ? 0.9 : 0.4}
        />
      </mesh>

      {/* Solid Inner Glow Sphere */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          transparent 
          opacity={active ? 0.5 : 0.2}
        />
      </mesh>

      {/* Planetary Outer Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshBasicMaterial 
          color="#bd00ff" 
          side={THREE.DoubleSide} 
          transparent 
          opacity={active ? 0.8 : 0.3}
        />
      </mesh>

      {/* Sector Floating Tag */}
      <Html distanceFactor={8} position={[0, 1.4, 0]} center>
        <div 
          className="text-hud text-neon-blue font-bold"
          style={{
            background: 'rgba(3, 3, 12, 0.75)',
            border: `1px solid ${active ? '#00f0ff' : 'rgba(0,240,255,0.2)'}`,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '9px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: active ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none'
          }}
        >
          SECTOR_01 // CORE
        </div>
      </Html>
    </group>
  );
}

// Node 2: Synapse Net (Neural Node Lattice Network)
function SynapseNet({ active, onClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Generate fixed random positions for synapse nodes
  const nodeCount = 8;
  const positions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const r = 0.5 + Math.random() * 0.4;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 0.8,
        Math.sin(angle) * r
      ));
    }
    return pts;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.4;
      groupRef.current.position.y = Math.cos(time * 1.3) * 0.15;
    }
  });

  const scale = hovered ? 1.2 : 1.0;

  return (
    <group 
      ref={groupRef} 
      position={[2.2, -0.5, -20]} 
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        audioEngine.playHover();
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Draw Synapse Spheres */}
      {positions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial 
            color="#bd00ff" 
            transparent 
            opacity={active ? 0.9 : 0.4}
          />
        </mesh>
      ))}

      {/* Draw Connective Lines */}
      {positions.map((pos, idx) => {
        const nextPos = positions[(idx + 1) % nodeCount];
        const nextPosAlt = positions[(idx + 3) % nodeCount];
        
        return (
          <group key={idx}>
            <LineSegment start={pos} end={nextPos} color="#bd00ff" opacity={active ? 0.5 : 0.15} />
            <LineSegment start={pos} end={nextPosAlt} color="#00f0ff" opacity={active ? 0.3 : 0.1} />
          </group>
        );
      })}

      <Html distanceFactor={8} position={[0, 1.4, 0]} center>
        <div 
          className="text-hud text-neon-purple font-bold"
          style={{
            background: 'rgba(3, 3, 12, 0.75)',
            border: `1px solid ${active ? '#bd00ff' : 'rgba(189,0,255,0.2)'}`,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '9px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: active ? '0 0 10px rgba(189, 0, 255, 0.3)' : 'none'
          }}
        >
          SECTOR_02 // SYNAPSE
        </div>
      </Html>
    </group>
  );
}

// Simple line rendering component
function LineSegment({ start, end, color, opacity }) {
  const points = useMemo(() => [start, end], [start, end]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

// Node 3: Quantum Cell (Spinning nested hypercubes)
function QuantumCell({ active, onClick }) {
  const groupRef = useRef();
  const innerCubeRef = useRef();
  const outerCubeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 1.8) * 0.15;
    }
    if (innerCubeRef.current) {
      innerCubeRef.current.rotation.x = time * 0.6;
      innerCubeRef.current.rotation.y = time * 0.3;
    }
    if (outerCubeRef.current) {
      outerCubeRef.current.rotation.y = -time * 0.3;
      outerCubeRef.current.rotation.z = time * 0.2;
    }
  });

  const scale = hovered ? 1.2 : 1.0;

  return (
    <group 
      ref={groupRef} 
      position={[-2.2, 0.5, -40]} 
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        audioEngine.playHover();
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Outer Cage Cube */}
      <mesh ref={outerCubeRef}>
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshBasicMaterial 
          color="#ff007c" 
          wireframe 
          transparent 
          opacity={active ? 0.7 : 0.3}
        />
      </mesh>

      {/* Inner Nested Solid-ish Cube */}
      <mesh ref={innerCubeRef}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          wireframe
          transparent 
          opacity={active ? 0.9 : 0.4}
        />
      </mesh>

      <Html distanceFactor={8} position={[0, 1.4, 0]} center>
        <div 
          className="text-hud text-neon-pink font-bold"
          style={{
            background: 'rgba(3, 3, 12, 0.75)',
            border: `1px solid ${active ? '#ff007c' : 'rgba(255,0,124,0.2)'}`,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '9px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: active ? '0 0 10px rgba(255, 0, 124, 0.3)' : 'none'
          }}
        >
          SECTOR_03 // QUANTUM
        </div>
      </Html>
    </group>
  );
}

// Node 4: Nexus Portal (Flat spiral/vortex event horizon)
function NexusPortal({ active, onClick }) {
  const groupRef = useRef();
  const discRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.cos(time * 1.6) * 0.15;
    }
    if (discRef.current) {
      discRef.current.rotation.z = -time * 0.8;
    }
  });

  const scale = hovered ? 1.2 : 1.0;

  // Render spiral rings
  const ringCount = 8;

  return (
    <group 
      ref={groupRef} 
      position={[2.2, -0.5, -60]} 
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        audioEngine.playHover();
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={discRef} rotation={[0, -Math.PI / 4, 0]}>
        {/* Draw multiple spiral rings */}
        {[...Array(ringCount)].map((_, i) => {
          const radius = 0.2 + (i * 0.15);
          return (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 6]}>
              <ringGeometry args={[radius, radius + 0.03, 3, 1, 0, Math.PI * 1.5]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? '#bd00ff' : '#ff007c'} 
                transparent 
                opacity={active ? 0.8 - (i * 0.05) : 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
        {/* Inner black-hole circle core */}
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#03030c" />
        </mesh>
      </group>

      <Html distanceFactor={8} position={[0, 1.4, 0]} center>
        <div 
          className="text-hud text-neon-purple font-bold"
          style={{
            background: 'rgba(3, 3, 12, 0.75)',
            border: `1px solid ${active ? '#bd00ff' : 'rgba(189,0,255,0.2)'}`,
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '9px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: active ? '0 0 10px rgba(189, 0, 255, 0.3)' : 'none'
          }}
        >
          SECTOR_04 // PORTAL
        </div>
      </Html>
    </group>
  );
}

// Memory utility import for SynapseNet
import { useMemo } from 'react';

export default function TechNodes({ activeSector, onNodeClick }) {
  return (
    <group>
      <NexusCore active={activeSector === 0} onClick={() => onNodeClick(0)} />
      <SynapseNet active={activeSector === 1} onClick={() => onNodeClick(1)} />
      <QuantumCell active={activeSector === 2} onClick={() => onNodeClick(2)} />
      <NexusPortal active={activeSector === 3} onClick={() => onNodeClick(3)} />
    </group>
  );
}

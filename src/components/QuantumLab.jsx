import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import audioEngine from '../utils/AudioEngine';

// Sub-component: Floating Bohr Atom with Orbiting Electrons
function BohrAtom({ position, label, shellConfig, mass, energy }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Zero gravity floating drift
      groupRef.current.position.y = position[1] + Math.sin(time * 1.3 + position[2]) * 0.14;
      groupRef.current.position.x = position[0] + Math.cos(time * 0.5 + position[2]) * 0.08;
      
      // Gentle orientation drift
      groupRef.current.rotation.y = time * 0.15;
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

  const scale = hovered ? 1.25 : 1.0;

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Raycast hover boundary target */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Nucleus Core Cluster (Protons & Neutrons) */}
      <group>
        {/* Proton 1 (Red) */}
        <mesh position={[0.08, 0.08, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#ff007c" />
        </mesh>
        {/* Proton 2 (Red) */}
        <mesh position={[-0.08, -0.08, 0.06]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#ff007c" />
        </mesh>
        {/* Neutron 1 (Blue) */}
        <mesh position={[-0.08, 0.08, -0.06]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        {/* Neutron 2 (Blue) */}
        <mesh position={[0.08, -0.08, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>

      {/* Orbiting Electrons */}
      <ElectronOrbit radius={0.65} tilt={0.35} speed={4.5} color="#00f0ff" />
      <ElectronOrbit radius={0.65} tilt={-0.45} speed={-3.8} color="#bd00ff" />
      <ElectronOrbit radius={0.85} tilt={0.8} speed={5.2} color="#ff007c" />

      {/* Interactive Hover HUD Display */}
      {hovered && (
        <Html distanceFactor={8} position={[0, 1.1, 0]} center>
          <div className="molecular-hud-card purple">
            <div className="molecular-hud-title purple">// ATOMIC STATE //</div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">IDENT:</span>
              <span className="molecular-hud-val purple">{label}</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">SHELLS:</span>
              <span className="molecular-hud-val">{shellConfig}</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">MASS:</span>
              <span className="molecular-hud-val">{mass} u</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">BINDING:</span>
              <span className="molecular-hud-val">{energy} eV</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Sub-component: Electron Orbit Path and Particle
function ElectronOrbit({ radius, tilt, speed, color }) {
  const electronRef = useRef();

  // Create circle points for visual orbit ring path
  const curvePoints = useMemo(() => {
    const pts = [];
    const count = 32;
    for (let i = 0; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * Math.cos(tilt),
        Math.sin(angle) * radius * Math.sin(tilt)
      ));
    }
    return pts;
  }, [radius, tilt]);

  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(curvePoints), [curvePoints]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const angle = time * speed;
    if (electronRef.current) {
      electronRef.current.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * Math.cos(tilt),
        Math.sin(angle) * radius * Math.sin(tilt)
      );
    }
  });

  return (
    <group>
      {/* Orbit ring path wire */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.2} />
      </line>
      {/* Electron particle sphere */}
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

// Sub-component: Rotating DNA Helix
function DNAHelix({ position, label, sequencing, codons }) {
  const [hovered, setHovered] = useState(false);
  const helixRef = useRef();

  const N = 16;
  const radius = 0.55;
  const heightStep = 0.18;

  // Generate fixed coordinates for DNA rungs
  const dnaNodes = useMemo(() => {
    const list = [];
    for (let i = 0; i < N; i++) {
      const angle = i * 0.45;
      const y = (i - N / 2) * heightStep;
      list.push({
        y,
        angle
      });
    }
    return list;
  }, [N, heightStep]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (helixRef.current) {
      helixRef.current.position.y = position[1] + Math.sin(time * 0.8 + position[2]) * 0.1;
      helixRef.current.rotation.y = time * 0.5;
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

  const scale = hovered ? 1.2 : 1.0;

  return (
    <group ref={helixRef} position={position} scale={[scale, scale, scale]}>
      {/* Raycast hover target */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.8, 0.8, N * heightStep, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* DNA Strands and Rungs */}
      <group>
        {dnaNodes.map((node, i) => {
          const x1 = Math.cos(node.angle) * radius;
          const z1 = Math.sin(node.angle) * radius;
          const x2 = -Math.cos(node.angle) * radius;
          const z2 = -Math.sin(node.angle) * radius;

          // Alternate colors (Adenine, Thymine, Cytosine, Guanine)
          const color1 = i % 4 === 0 ? "#ff007c" : i % 4 === 1 ? "#00f0ff" : i % 4 === 2 ? "#bd00ff" : "#39ff14";
          const color2 = i % 4 === 0 ? "#00f0ff" : i % 4 === 1 ? "#ff007c" : i % 4 === 2 ? "#39ff14" : "#bd00ff";

          return (
            <group key={i}>
              {/* Strand Bead 1 */}
              <mesh position={[x1, node.y, z1]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshBasicMaterial color={color1} />
              </mesh>
              {/* Strand Bead 2 */}
              <mesh position={[x2, node.y, z2]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshBasicMaterial color={color2} />
              </mesh>
              {/* Rung line connector */}
              <mesh
                position={[0, node.y, 0]}
                rotation={[0, -node.angle, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.015, 0.015, radius * 2, 4]} />
                <meshBasicMaterial color="#55556c" transparent opacity={0.5} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Hover Card */}
      {hovered && (
        <Html distanceFactor={8} position={[0, 1.6, 0]} center>
          <div className="molecular-hud-card">
            <div className="molecular-hud-title">// GENOMIC HELIX //</div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">GENOME:</span>
              <span className="molecular-hud-val blue">{label}</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">SEQ GRID:</span>
              <span className="molecular-hud-val">{sequencing}</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">CODONS:</span>
              <span className="molecular-hud-val">{codons}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Sub-component: Rotating Ball and Stick Molecule
function MolecularLattice({ position, title, weight, formula, stateFactor }) {
  const [hovered, setHovered] = useState(false);
  const molRef = useRef();

  // Coordinates for a carbon benzene-like ring
  const carbonNodes = useMemo(() => {
    const list = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * 0.6;
      const z = Math.sin(angle) * 0.6;
      list.push(new THREE.Vector3(x, 0, z));
    }
    return list;
  }, []);

  // Coordinates for outer Hydrogen attachments
  const hydrogenNodes = useMemo(() => {
    const list = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * 0.95;
      const z = Math.sin(angle) * 0.95;
      list.push(new THREE.Vector3(x, 0, z));
    }
    return list;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (molRef.current) {
      molRef.current.position.y = position[1] + Math.sin(time * 0.6 + position[2]) * 0.15;
      // Rotation in multiple axes
      molRef.current.rotation.y = time * 0.45;
      molRef.current.rotation.x = Math.cos(time * 0.3) * 0.15;
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

  const scale = hovered ? 1.25 : 1.0;

  return (
    <group ref={molRef} position={position} scale={[scale, scale, scale]}>
      {/* Raycast hover boundary target */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Carbon Atoms (Dark Grey) */}
      {carbonNodes.map((node, idx) => (
        <mesh key={`c-${idx}`} position={node}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshBasicMaterial color="#333344" />
        </mesh>
      ))}

      {/* Hydrogen Atoms (White) */}
      {hydrogenNodes.map((node, idx) => (
        <mesh key={`h-${idx}`} position={node}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Carbon-Carbon Covalent Bonds */}
      {carbonNodes.map((node, idx) => {
        const nextNode = carbonNodes[(idx + 1) % carbonNodes.length];
        const midPoint = new THREE.Vector3().addVectors(node, nextNode).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(nextNode, node);
        const length = dir.length();
        
        return (
          <group key={`cc-bond-${idx}`} position={midPoint}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, length, 6]} />
              <meshBasicMaterial color="#55556a" />
            </mesh>
          </group>
        );
      })}

      {/* Carbon-Hydrogen Bonds */}
      {carbonNodes.map((node, idx) => {
        const hNode = hydrogenNodes[idx];
        const midPoint = new THREE.Vector3().addVectors(node, hNode).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(hNode, node);
        const length = dir.length();
        
        return (
          <group key={`ch-bond-${idx}`} position={midPoint}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, length, 6]} />
              <meshBasicMaterial color="#78788c" />
            </mesh>
          </group>
        );
      })}

      {/* Hover Info Overlay */}
      {hovered && (
        <Html distanceFactor={8} position={[0, 1.3, 0]} center>
          <div className="molecular-hud-card purple">
            <div className="molecular-hud-title purple">// MOLECULAR STRUCTURE //</div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">COMPOUND:</span>
              <span className="molecular-hud-val purple">{title}</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">FORMULA:</span>
              <span className="molecular-hud-val">{formula}</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">MOL WT:</span>
              <span className="molecular-hud-val">{weight} g/mol</span>
            </div>
            <div className="molecular-hud-row">
              <span className="molecular-hud-label">STATE:</span>
              <span className="molecular-hud-val">{stateFactor}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Sub-component: Quantum Fluctuation Particle System (Brownian Drift)
function QuantumParticles() {
  const pointsRef = useRef();
  const count = 350;

  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const offs = [];
    for (let i = 0; i < count; i++) {
      // Scatter inside the lab bounds (Z = -36 to -72)
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = -38 - Math.random() * 32;

      // Unique random noise speeds
      offs.push({
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        speedX: 0.2 + Math.random() * 0.3,
        speedY: 0.15 + Math.random() * 0.25,
        speedZ: 0.1 + Math.random() * 0.2
      });
    }
    return [pos, offs];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const data = offsets[i];
      // erratic wave movement (Brownian noise simulation)
      posArr[i * 3] += Math.sin(time * data.speedX + data.rx) * 0.005;
      posArr[i * 3 + 1] += Math.cos(time * data.speedY + data.ry) * 0.005;
      posArr[i * 3 + 2] += Math.sin(time * data.speedZ + data.rz) * 0.003;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#00f0ff"
        size={0.065}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Sub-component: Transparent Holographic mainframe screen
function ScientificHologram({ position, title, isBlue, logs }) {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 1.5 + position[2]) * 0.12;
      groupRef.current.rotation.y = Math.sin(time * 0.25) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Wireframe Frame screen */}
      <mesh>
        <planeGeometry args={[3.08, 2.28]} />
        <meshBasicMaterial
          color={isBlue ? "#00f0ff" : "#bd00ff"}
          wireframe
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* HTML mainframe UI */}
      <Html distanceFactor={8} center transform sprite>
        <div className={`quantum-holo-card ${isBlue ? 'blue' : ''}`}>
          <div className={`quantum-header ${isBlue ? 'blue' : ''}`}>
            {isBlue ? "// QUANTUM MAIN COMM //" : "// COHERENCE FEED //"}
          </div>

          <div className="quantum-title">{title}</div>

          <div className="quantum-data-grid">
            <div className="quantum-data-row">
              <span className="quantum-label">COHERENCE RATIO:</span>
              <span className={`quantum-value ${isBlue ? 'blue' : ''}`}>
                {isBlue ? "99.982% [SYNC]" : "98.745% [STABLE]"}
              </span>
            </div>
            <div className="quantum-data-row">
              <span className="quantum-label">QUBIT MATRIX:</span>
              <span className="quantum-value">8192 REGISTERED</span>
            </div>
            <div className="quantum-data-row">
              <span className="quantum-label">COOLDOWN UNIT:</span>
              <span className="quantum-value green">0.015 K [ACTIVE]</span>
            </div>
          </div>

          <div className="hazard-bar" />

          {/* Diagnostics console log logs */}
          <div className="telemetry-log">
            {logs.map((log, idx) => (
              <div key={idx} className={`log-entry ${log.includes("OK") || log.includes("SYNC") ? "ready" : ""}`}>
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Main Lab Component
export default function QuantumLab({ onSelectEvent }) {
  const screenALogs = ["WAVE EQ: RESOLVED", "SPIN STATE: EIGEN", "COHERENCE: OK", "PSI FIELD: nominal"];
  const screenBLogs = ["DNA SEQ: MATCHED", "CODON PAIRING: OK", "CYTOSINE: STABLE", "GENOME: 100% SYNC"];
  const screenCLogs = ["GRID DAMPING: 99.4%", "COGNITIVE SPEED: OK", "LASER_3: SWEEPING", "ALERT: NONE"];

  return (
    <group>
      {/* 1. SECTOR 3: QUANTUM DIAGNOSTICS (Z = -38 to Z = -52) */}
      <BohrAtom position={[-2.8, 1.2, -40]} label="QUBIT_CORE_A" shellConfig="2, 8, 1" mass="18.99" energy="240.5" />
      <BohrAtom position={[2.8, -1.0, -42]} label="QUBIT_CORE_B" shellConfig="2, 8, 4" mass="28.08" energy="382.4" />
      
      <MolecularLattice position={[-2.6, -1.2, -48]} title="BENZENE RING" formula="C6H6" weight="78.11" stateFactor="RESONANT" />
      <MolecularLattice position={[2.6, 1.2, -50]} title="CARBON LATTICE" formula="C_DIAMOND" weight="12.01" stateFactor="CRYSTALLINE" />

      {/* 2. SECTOR 4: GENOMIC MATRIX (Z = -54 to Z = -72) */}
      <DNAHelix position={[-2.5, 0.8, -56]} label="CHROMOSOME_Y" sequencing="ADENINE-THYMINE" codons="ATG - TAC" />
      <DNAHelix position={[2.5, -1.2, -62]} label="CHROMOSOME_X" sequencing="CYTOSINE-GUANINE" codons="CCG - GGC" />

      {/* Holographic displays for the mainframe center */}
      <ScientificHologram position={[2.6, 1.0, -58]} title="WAVE FUNCTION COHERENCE" isBlue={true} logs={screenALogs} />
      <ScientificHologram position={[-2.6, -0.6, -64]} title="GENOMIC CODING DIAGNOSTICS" isBlue={false} logs={screenBLogs} />
      <ScientificHologram position={[0, -1.5, -69]} title="MAIN CORE ALIGNMENT MATRIX" isBlue={true} logs={screenCLogs} />

      {/* Quantum fluctuations (drifting particles) */}
      <QuantumParticles />

      {/* Soft blue and purple point lights for volumetric environment lighting */}
      <pointLight color="#00f0ff" intensity={2.0} distance={18} position={[-5, 3, -45]} />
      <pointLight color="#bd00ff" intensity={2.5} distance={18} position={[5, -3, -60]} />
      <pointLight color="#ff007c" intensity={1.5} distance={12} position={[-2, -2, -52]} />
    </group>
  );
}

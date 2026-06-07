import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { FileCode, Sparkles, Cpu, Atom, Brain, Cloud } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

// Node data mapping Techfest events to coordinates and code snippets
const NETWORK_NODES = [
  {
    id: 0,
    title: "ROBOWARS",
    type: "COMPETITION",
    desc: "India's largest combat robotics grid. Top international teams battle in an enclosed steel arena for ultimate supremacy.",
    details: "Date: Jan 3-5 | Arena: Sector 7 | Prize: ₹10,00,000",
    pos: [-3.0, 1.2, -88],
    neonColor: "#ff007c",
    code: `// ROBOWARS Torque Controller
const calcTorque = (rpm, hp) => {
  const constant = 5252;
  return (hp * constant) / rpm;
};
const motorEngage = true;`
  },
  {
    id: 1,
    title: "CODEFT",
    type: "HACKATHON",
    desc: "Elite 36-hour competitive programming and AI hackathon solving real-world global security bottlenecks.",
    details: "Date: Jan 3-4 | Lab: Cyber-Grid 2 | Prize: ₹5,0,000",
    pos: [3.0, -0.8, -96],
    neonColor: "#bd00ff",
    code: `// CODEFT CTF Validation
async function verifyHash(payload) {
  const hash = await sha256(payload);
  return hash === TARGET_HEX;
}`
  },
  {
    id: 2,
    title: "TECHFEST EXHIBITIONS",
    type: "SHOWCASE",
    desc: "Global technology showcase featuring state-of-the-art bionics, robotics, and space crafts from 20+ nations.",
    details: "Date: Jan 3-5 | Hall: Nexus Dome | Entry: Free",
    pos: [-3.2, -1.2, -104],
    neonColor: "#00f0ff",
    code: `// Bionic Arm Kinematics
function solveIK(targetX, targetY) {
  const l1 = 10, l2 = 8;
  // Inverse trigonometric equations
  return { theta1, theta2 };
}`
  },
  {
    id: 3,
    title: "AEROMODELLING",
    type: "COMPETITION",
    desc: "International aerial maneuvers conflict. Custom drones and aircraft take flight in speed, durability, and obstacle drills.",
    details: "Date: Jan 4 | Field: Astro-Link | Prize: ₹4,0,000",
    pos: [3.2, 1.6, -112],
    neonColor: "#ff007c",
    code: `// PID Drone Stabilizer
class PIDController {
  update(error, dt) {
    this.integral += error * dt;
    const derivative = (error - this.prevError) / dt;
    return (kp * error) + (ki * this.integral) + (kd * derivative);
  }
}`
  },
  {
    id: 4,
    title: "QUANTUM MASTERCLASS",
    type: "WORKSHOP",
    desc: "Practical hands-on training sessions in quantum cryptography and distributed ledger structures led by industry pioneers.",
    details: "Date: Jan 5 | Center: Synapse Hall | Registration: Required",
    pos: [-3.4, 0.5, -120],
    neonColor: "#39ff14",
    code: `// Qubit Entanglement Matrix
const entangle = (q1, q2) => {
  q1.applyGate('Hadamard');
  q2.applyGate('CNOT', q1);
  return [q1.state, q2.state];
};`
  },
  {
    id: 5,
    title: "KEYNOTE LECTURES",
    type: "SUMMIT",
    desc: "Thought leadership presentations from Nobel Laureates, field medalists, and directors of global science agencies.",
    details: "Date: Jan 3-5 | Theater: Quantum Stage | Schedule: Live on HUD",
    pos: [3.4, -1.5, -128],
    neonColor: "#39ff14",
    code: `// Transformer Attention Hook
const attention = (Q, K, V) => {
  const scores = matmul(Q, transpose(K)) / sqrt(d_k);
  const weights = softmax(scores);
  return matmul(weights, V);
};`
  },
  {
    id: 6,
    title: "INTERNATIONAL CODING",
    type: "COMPETITION",
    desc: "Global coding duel. Speed-running algorithmic debugging and system stress-testing challenges against global leaders.",
    details: "Date: Jan 4-5 | Platform: Cloud Nexus | Prize: ₹6,0,000",
    pos: [-2.8, -0.6, -136],
    neonColor: "#ff007c",
    code: `// Dijkstra Shortest Path
function dijkstra(graph, start) {
  const dist = {}, queue = new MinHeap();
  dist[start] = 0;
  // Resolve paths...
  return dist;
}`
  },
  {
    id: 7,
    title: "BIO-TECH MATRIX",
    type: "SHOWCASE",
    desc: "Showcasing micro-bionic implants, neural prosthetics, and organ regeneration matrices.",
    details: "Date: Jan 3-5 | Arena: Bio-Nexus | Entry: Free",
    pos: [2.8, 1.2, -144],
    neonColor: "#00f0ff",
    code: `// DNA Sequence Alignment
function needlemanWunsch(seq1, seq2) {
  const matrix = Array(seq1.length + 1).fill();
  // Compute scoring matrix
  return alignmentScore;
}`
  },
  {
    id: 8,
    title: "FINTECH SUMMIT",
    type: "SUMMIT",
    desc: "Exploring decentralized financial networks, smart cyber-assets, and high-frequency algorithms.",
    details: "Date: Jan 5 | Center: Block Room 8 | Entry: Open",
    pos: [-3.2, 1.8, -152],
    neonColor: "#39ff14",
    code: `// High-Frequency Arbitrage
const checkArbitrage = (priceA, priceB) => {
  const spread = Math.abs(priceA - priceB);
  if (spread > minSpread) {
    executeTrade(BUY_A, SELL_B);
  }
};`
  },
  {
    id: 9,
    title: "CYBER SECURITY NEXUS",
    type: "COMPETITION",
    desc: "CTF (Capture The Flag) cyber-warfare tournament testing penetration, system defense, and decryptions.",
    details: "Date: Jan 3 | Lab: Matrix Sandbox | Prize: ₹3,50,000",
    pos: [3.2, -1.0, -160],
    neonColor: "#bd00ff",
    code: `// CTF Memory Payload
const generatePayload = () => {
  const buffer = Buffer.alloc(128);
  buffer.fill(0x90); // NOP Sled
  buffer.writeUInt32LE(RET_ADDR, 64);
  return buffer;
};`
  }
];

// Connection topology (mesh connections between nodes)
const NETWORK_CONNECTIONS = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 6 },
  { from: 5, to: 7 },
  { from: 6, to: 8 },
  { from: 7, to: 9 },
  { from: 8, to: 9 }
];

// Sub-component: Code Typing Terminal Effect
function TypingCode({ code, isExpanded }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isExpanded) {
      setDisplayedText(code.substring(0, 50) + "...");
      return;
    }

    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (index < code.length) {
          const nextChar = code.charAt(index);
          index++;
          return prev + nextChar;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 15);

    return () => clearInterval(interval);
  }, [code, isExpanded]);

  // Escape HTML characters and apply simple token-based highlight spans using placeholders
  const highlighted = useMemo(() => {
    // 1. Escape HTML
    let text = displayedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const comments = [];
    const strings = [];

    // 2. Extract comments
    text = text.replace(/(\/\/.*)/g, (match) => {
      comments.push(match);
      return `__COMMENT_${comments.length - 1}__`;
    });

    // 3. Extract strings
    text = text.replace(/(["'`])(.*?)\1/g, (match) => {
      strings.push(match);
      return `__STRING_${strings.length - 1}__`;
    });

    // 4. Highlight keywords
    text = text.replace(/\b(const|let|var|function|return|import|export|default|class|extends|if|else|for|while|new|await|async)\b/g, '<span class="syn-keyword">$1</span>');

    // 5. Highlight functions
    text = text.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, '<span class="syn-function">$1</span>');

    // 6. Highlight numbers
    text = text.replace(/\b(\d+)\b/g, '<span class="syn-number">$1</span>');

    // 7. Restore strings
    strings.forEach((str, idx) => {
      text = text.replace(`__STRING_${idx}__`, `<span class="syn-string">${str}</span>`);
    });

    // 8. Restore comments
    comments.forEach((comment, idx) => {
      text = text.replace(`__COMMENT_${idx}__`, `<span class="syn-comment">${comment}</span>`);
    });

    return text;
  }, [displayedText]);

  // Split lines for clean gutter line numbers
  const lines = highlighted.split('\n');

  return (
    <div className={`code-snippet-box ${isExpanded ? 'typing' : ''}`}>
      {lines.map((lineContent, idx) => (
        <div className="code-line" key={idx}>
          <span className="code-num">{idx + 1}</span>
          <span className="code-content" dangerouslySetInnerHTML={{ __html: lineContent }} />
        </div>
      ))}
      <span className="terminal-cursor" />
    </div>
  );
}

// Sub-component: Floating Code Panel Card
function CodePanel({ data, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (panelRef.current) {
      // Subtle float animation
      panelRef.current.position.y = data.pos[1] + Math.sin(time * 1.5 + data.id) * 0.12;
      // Gentle orientation sway
      panelRef.current.rotation.y = Math.sin(time * 0.25 + data.id) * 0.04;
      panelRef.current.rotation.x = Math.cos(time * 0.2 + data.id) * 0.03;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    audioEngine.playHover();
  };

  const handlePointerOut = () => {
    setHovered(false);
    setExpanded(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    audioEngine.playClick();
    setExpanded(!expanded);
    onSelect(data);
  };

  return (
    <group ref={panelRef} position={[data.pos[0], data.pos[1], data.pos[2]]}>
      {/* Invisible plane for hover/click capture */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[3.2, 2.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Glow outer border wireframe */}
      <mesh>
        <planeGeometry args={expanded ? [4.12, 3.12] : [3.12, 2.12]} />
        <meshBasicMaterial
          color={expanded ? "#ff007c" : (hovered ? "#00f0ff" : data.neonColor)}
          wireframe
          transparent
          opacity={hovered ? 0.7 : 0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* HTML overlay Card */}
      <Html
        distanceFactor={9}
        center
        transform
        pointerEvents="none"
      >
        <div className="cyber-card-wrapper">
          <div className={`glass-code-card ${hovered ? 'hovered' : ''} ${expanded ? 'expanded' : ''}`}>
            <div className={`card-header ${expanded ? 'card-header-expanded' : ''}`}>
              <span className={`card-title ${expanded ? 'pink' : ''}`}>
                {expanded ? `[ACTIVE] ${data.title}` : data.title}
              </span>
              <span className={`card-type ${expanded ? 'pink' : ''}`}>
                {data.type}
              </span>
            </div>

            <div className="card-description">
              {data.desc}
            </div>

            <TypingCode code={data.code} isExpanded={expanded || hovered} />

            <div style={{
              fontSize: '8px',
              fontFamily: 'monospace',
              color: expanded ? 'var(--neon-pink)' : 'var(--text-muted)',
              textAlign: 'right',
              marginTop: '4px',
              letterSpacing: '1px'
            }}>
              {expanded ? "CLICK CARD TO CLOSE PAYLOAD" : "CLICK CARD TO RUN CODE"}
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Sub-component: Glowing connection path
function ConnectionLine({ curve, color }) {
  const points = useMemo(() => curve.getPoints(24), [curve]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <group>
      {/* Base wire */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#111126" linewidth={1} transparent opacity={0.35} />
      </line>
      {/* Glowing neon core overlay */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          linewidth={2}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

// Sub-component: Animating packets/particles flowing along curve
function FlowingPackets({ curve, color, count = 2 }) {
  const meshRefs = useRef([]);
  const speeds = useMemo(() => Array(count).fill(0).map(() => 0.04 + Math.random() * 0.05), [count]);
  const progresses = useRef(Array(count).fill(0).map((_, i) => i / count));

  useFrame((state, delta) => {
    progresses.current.forEach((progress, idx) => {
      // Advance progress using delta for frame-rate independence
      progresses.current[idx] = (progress + speeds[idx] * delta * 15) % 1;

      const mesh = meshRefs.current[idx];
      if (mesh) {
        const point = curve.getPointAt(progresses.current[idx]);
        mesh.position.copy(point);

        // Add size breathing effect
        const scaleVal = 1.0 + Math.sin(state.clock.getElapsedTime() * 12 + idx) * 0.25;
        mesh.scale.setScalar(scaleVal);
      }
    });
  });

  return (
    <group>
      {[...Array(count)].map((_, idx) => (
        <mesh key={idx} ref={(el) => (meshRefs.current[idx] = el)}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Sub-component: Orbiting Tech Badges
function OrbitingIcons({ centerZ }) {
  const groupRef = useRef();

  const orbiters = useMemo(() => [
    { name: "HTML5", type: "html", icon: FileCode, radius: 4.8, speed: 0.22, tilt: 0.15, phase: 0 },
    { name: "CSS3", type: "css", icon: Sparkles, radius: 5.6, speed: -0.28, tilt: -0.2, phase: Math.PI / 3 },
    { name: "JavaScript", type: "js", icon: Cpu, radius: 6.4, speed: 0.18, tilt: 0.35, phase: (2 * Math.PI) / 3 },
    { name: "React", type: "react", icon: Atom, radius: 7.2, speed: -0.2, tilt: -0.45, phase: Math.PI },
    { name: "AI/ML", type: "ai", icon: Brain, radius: 8.0, speed: 0.15, tilt: 0.55, phase: (4 * Math.PI) / 3 },
    { name: "Cloud", type: "cloud", icon: Cloud, radius: 8.8, speed: -0.12, tilt: -0.3, phase: (5 * Math.PI) / 3 }
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((child, idx) => {
        const data = orbiters[idx];
        const angle = time * data.speed + data.phase;

        // Position coordinates based on tilt plane
        const x = Math.cos(angle) * data.radius;
        const y = Math.sin(angle) * data.radius * Math.cos(data.tilt);
        const z = centerZ + Math.sin(angle) * data.radius * Math.sin(data.tilt);

        child.position.set(x, y, z);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {orbiters.map((orb, idx) => {
        const Icon = orb.icon;
        return (
          <group key={idx}>
            <Html distanceFactor={11} center transform sprite>
              <div className="orbit-badge-container">
                <div className={`orbit-badge ${orb.type}`}>
                  <Icon size={16} />
                </div>
                <span className="orbit-badge-label">{orb.name}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Sub-component: Falling green matrix digital rain stream (Decorative)
function DigitalRain() {
  const rainRef = useRef();
  const count = 60;

  const streams = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const startY = 6 + Math.random() * 8;
      const z = -80 - Math.random() * 95;
      const length = 0.5 + Math.random() * 1.2;
      const speed = 0.08 + Math.random() * 0.12;
      arr.push({ x, y: startY, z, length, speed });
    }
    return arr;
  }, []);

  useFrame(() => {
    if (rainRef.current) {
      rainRef.current.children.forEach((stream, idx) => {
        const data = streams[idx];
        data.y -= data.speed;

        if (data.y < -4.0) {
          data.y = 6 + Math.random() * 6;
        }
        stream.position.y = data.y;
      });
    }
  });

  return (
    <group ref={rainRef}>
      {streams.map((stream, idx) => (
        <mesh key={idx} position={[stream.x, stream.y, stream.z]}>
          <cylinderGeometry args={[0.008, 0.008, stream.length, 4]} />
          <meshBasicMaterial
            color="#39ff14"
            transparent
            opacity={0.25 + Math.random() * 0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main World Component
export default function CyberNetworkWorld({ onSelectEvent }) {
  // Generate connection curves between node coordinates
  const curvesList = useMemo(() => {
    return NETWORK_CONNECTIONS.map((conn) => {
      const fromNode = NETWORK_NODES[conn.from];
      const toNode = NETWORK_NODES[conn.to];

      const start = new THREE.Vector3(...fromNode.pos);
      const end = new THREE.Vector3(...toNode.pos);

      // Compute an organic curved arc
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(end, start).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const perpendicular = new THREE.Vector3().crossVectors(dir, up).normalize();

      // Displace control point slightly sideways and upwards
      midPoint.addScaledVector(perpendicular, 1.0);
      midPoint.y += 0.6;

      const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
      return {
        curve,
        color: fromNode.neonColor
      };
    });
  }, []);

  return (
    <group>
      {/* 1. Connection lines between nodes */}
      {curvesList.map((cData, idx) => (
        <ConnectionLine
          key={`line-${idx}`}
          curve={cData.curve}
          color={cData.color}
        />
      ))}

      {/* 2. Flowing packets along connection lines */}
      {curvesList.map((cData, idx) => (
        <FlowingPackets
          key={`packets-${idx}`}
          curve={cData.curve}
          color="#ffffff"
          count={2}
        />
      ))}

      {/* 3. Floating code panel cards */}
      {NETWORK_NODES.map((node) => (
        <CodePanel
          key={node.id}
          data={node}
          onSelect={onSelectEvent}
        />
      ))}

      {/* 4. Orbiting Tech Badges (Centered around the core network Z=-125) */}
      <OrbitingIcons centerZ={-125} />

      {/* 5. Ambient matrix code rain in background */}
      <DigitalRain />
    </group>
  );
}

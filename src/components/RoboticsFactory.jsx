import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldAlert, Cpu, Activity, Database, AlertOctagon } from 'lucide-react';
import audioEngine from '../utils/AudioEngine';

// Sub-component: Welding Spark Particle System
function SparkParticles({ active, position }) {
  const pointsRef = useRef();
  const count = 35;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      // Random hemisphere velocity (upwards/outwards)
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;
      vels.push({
        x: Math.cos(angle) * Math.sin(Math.random() * Math.PI) * speed,
        y: Math.random() * speed + 0.4,
        z: Math.sin(angle) * Math.sin(Math.random() * Math.PI) * speed,
        age: 0,
        maxAge: 0.3 + Math.random() * 0.4
      });
    }
    return [pos, vels];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const v = velocities[i];
      if (active) {
        v.age += delta;

        // Apply velocity & gravity pull
        posArr[i * 3] += v.x * delta * 2;
        posArr[i * 3 + 1] += v.y * delta * 2 - 0.4 * delta; // gravity
        posArr[i * 3 + 2] += v.z * delta * 2;

        if (v.age > v.maxAge) {
          posArr[i * 3] = 0;
          posArr[i * 3 + 1] = 0;
          posArr[i * 3 + 2] = 0;
          v.age = 0;
        }
      } else {
        posArr[i * 3] = 0;
        posArr[i * 3 + 1] = 0;
        posArr[i * 3 + 2] = 0;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffcc00"
        size={0.06}
        transparent
        opacity={active ? 0.95 : 0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Sub-component: Jointed Robotic Welder Arm
function RoboticArm({ position, isLeftArm, conveyorTargetZ }) {
  const baseRef = useRef();
  const arm1Ref = useRef();
  const arm2Ref = useRef();
  const tipLightRef = useRef();

  const [welding, setWelding] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const sideFactor = isLeftArm ? 1 : -1;

    // Joint kinematics animations using overlapping sines
    if (baseRef.current && arm1Ref.current && arm2Ref.current) {
      // Rotation around base (swiveling)
      baseRef.current.rotation.y = Math.sin(time * 1.4 + sideFactor) * 0.22;

      // Arm joint bending
      arm1Ref.current.rotation.z = (Math.sin(time * 1.8) * 0.12 - 0.38) * sideFactor;
      arm2Ref.current.rotation.z = (Math.cos(time * 2.2) * 0.15 - 0.6) * sideFactor;
    }

    // Determine if tip is close to the conveyor belt center (Z positions align)
    // Simulated contact based on oscillator cycle
    const angleCycle = (time * 1.8) % (Math.PI * 2);
    const isClose = angleCycle > Math.PI * 0.6 && angleCycle < Math.PI * 1.2;
    setWelding(isClose);

    // Dynamic light flashing for welding sparks
    if (tipLightRef.current) {
      tipLightRef.current.intensity = isClose ? (1.5 + Math.random() * 2.0) : 0;
    }
  });

  return (
    <group position={position} ref={baseRef}>
      {/* Base Pedestal */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.42, 0.6, 12]} />
        <meshBasicMaterial color="#1a1a2e" wireframe />
      </mesh>

      {/* Shoulder Joint */}
      <group position={[0, 0.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color={isLeftArm ? "#ff007c" : "#bd00ff"} />
        </mesh>

        {/* Lower Arm Segment */}
        <group ref={arm1Ref}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 1.0, 8]} />
            <meshBasicMaterial color="#323246" />
          </mesh>

          {/* Elbow Joint */}
          <group position={[0, 1.0, 0]}>
            <mesh>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color={isLeftArm ? "#ff007c" : "#bd00ff"} />
            </mesh>

            {/* Upper Arm Segment */}
            <group ref={arm2Ref}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.05, 0.07, 0.8, 8]} />
                <meshBasicMaterial color="#323246" />
              </mesh>

              {/* Welder Tip head */}
              <group position={[0, 0.8, 0]}>
                <mesh rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.08, 0.25, 8]} />
                  <meshBasicMaterial color="#00f0ff" />
                </mesh>

                {/* Welder Point light glow */}
                <pointLight
                  ref={tipLightRef}
                  color="#ffcc00"
                  intensity={0}
                  distance={3.0}
                  decay={1.2}
                />

                {/* Localized spark system */}
                <SparkParticles active={welding} position={[0, -0.1, 0]} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// Sub-component: Conveyor Belt Moving Machine Parts
function ConveyorBelt({ length = 22, startZ = 10, endZ = -12, posY = -2.5 }) {
  const partsGroupRef = useRef();
  const rollersGroupRef = useRef();

  const count = 3;
  const partsData = useMemo(() => {
    return Array(count).fill(0).map((_, i) => ({
      id: i,
      startOffset: i / count
    }));
  }, [count]);

  useFrame((state, delta) => {
    // 1. Rollers rotation animation
    if (rollersGroupRef.current) {
      rollersGroupRef.current.children.forEach((roller) => {
        roller.rotation.x -= delta * 2.5;
      });
    }

    // 2. Translate package hulls along conveyor length
    if (partsGroupRef.current) {
      partsGroupRef.current.children.forEach((partMesh, idx) => {
        const data = partsData[idx];
        // Cycle position
        const t = (state.clock.getElapsedTime() * 0.12 + data.startOffset) % 1;
        const currentZ = startZ - t * (startZ - endZ);
        partMesh.position.z = currentZ;

        // Subtle vibrating tilt
        partMesh.rotation.y = Math.sin(state.clock.getElapsedTime() * 15 + idx) * 0.02;
      });
    }
  });

  // Generate roller position offsets
  const rollers = useMemo(() => {
    const list = [];
    const step = 1.4;
    for (let z = startZ; z >= endZ; z -= step) {
      list.push(z);
    }
    return list;
  }, [startZ, endZ]);

  return (
    <group>
      {/* Belt Bed Mesh */}
      <mesh position={[0, posY - 0.1, (startZ + endZ) / 2]}>
        <boxGeometry args={[1.5, 0.15, startZ - endZ]} />
        <meshBasicMaterial color="#0b0b14" />
      </mesh>
      {/* Side rail guard wireframe */}
      <mesh position={[0, posY, (startZ + endZ) / 2]}>
        <boxGeometry args={[1.56, 0.28, startZ - endZ]} />
        <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.14} />
      </mesh>

      {/* Rotating Rollers */}
      <group ref={rollersGroupRef}>
        {rollers.map((rz, i) => (
          <mesh key={i} position={[0, posY - 0.05, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 1.44, 8]} />
            <meshBasicMaterial color="#222230" />
          </mesh>
        ))}
      </group>

      {/* Moving Technical parts */}
      <group ref={partsGroupRef}>
        {partsData.map((d) => (
          <group key={d.id} position={[0, posY + 0.35, startZ]}>
            {/* Machine Hull Box */}
            <mesh>
              <boxGeometry args={[0.7, 0.45, 0.7]} />
              <meshBasicMaterial color="#141424" />
            </mesh>
            {/* Glowing inner core power unit */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.55, 0.48, 0.55]} />
              <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.4} />
            </mesh>
            {/* Micro warning indicator */}
            <mesh position={[0, 0.23, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshBasicMaterial color="#ff007c" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Sub-component: Rotating mechanical gear
function IndustrialGear({ position, radius, teethCount, speed, direction, color = "#48485c" }) {
  const gearRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (gearRef.current) {
      gearRef.current.rotation.y = time * speed * direction;
    }
  });

  const teeth = useMemo(() => {
    const arr = [];
    const toothAngle = (Math.PI * 2) / teethCount;
    for (let i = 0; i < teethCount; i++) {
      const angle = i * toothAngle;
      arr.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        rot: [0, -angle, 0]
      });
    }
    return arr;
  }, [radius, teethCount]);

  return (
    <group position={position} ref={gearRef} rotation={[Math.PI / 2, 0, 0]}>
      {/* Gear disc body */}
      <mesh>
        <cylinderGeometry args={[radius - 0.1, radius - 0.1, 0.16, 16]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {/* Shaft connector */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.22, 8]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      {/* Radial ribs */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 4, 0]}>
          <boxGeometry args={[radius * 1.8, 0.06, 0.08]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      {/* Cog teeth */}
      {teeth.map((t, idx) => (
        <mesh key={idx} position={t.pos} rotation={t.rot}>
          <boxGeometry args={[0.12, 0.16, 0.28]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// Sub-component: Sweeping Laser Scanner
function LaserScanner({ position, angleSpeed = 1.2, sweepWidth = 0.5, color = "#ff007c" }) {
  const scannerRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (scannerRef.current) {
      // Sweeping rotation tilt
      scannerRef.current.rotation.z = Math.sin(time * angleSpeed) * sweepWidth;
    }
    if (ringRef.current) {
      // Pulse scale scanner ring
      ringRef.current.scale.setScalar(1 + Math.sin(time * 6) * 0.15);
    }
  });

  return (
    <group position={position}>
      {/* Scanner Ceiling Bracket mount */}
      <mesh>
        <boxGeometry args={[0.4, 0.18, 0.4]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Sweeping Scanner head assembly */}
      <group ref={scannerRef} position={[0, -0.1, 0]}>
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Volumetric Laser cone light */}
        <mesh position={[0, -1.8, 0]}>
          <coneGeometry args={[0.26, 3.6, 12, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Laser line overlay */}
        <mesh position={[0, -1.8, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 3.6, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>

        {/* Floor scanning feedback ring */}
        <group position={[0, -3.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh ref={ringRef}>
            <ringGeometry args={[0.18, 0.24, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Sub-component: Autonomous Patrolling Ground Droid (Interactive)
function PatrolDroid({ initialPos, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [timer, setTimer] = useState(0);

  const droidRef = useRef();
  const warningLightRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (animating) {
      setTimer((prev) => {
        const next = prev + delta;
        if (next >= 2.2) {
          setAnimating(false);
          return 0;
        }
        return next;
      });

      // Rapid spin animation
      if (droidRef.current) {
        droidRef.current.rotation.y += delta * 15;
        droidRef.current.position.y = initialPos[1] + Math.abs(Math.sin(time * 24)) * 0.18; // vibrating jump
      }
      if (warningLightRef.current) {
        // High flash warning frequency
        warningLightRef.current.intensity = (Math.sin(time * 30) > 0) ? 2.5 : 0;
      }
    } else {
      // Normal Patrol navigation (rolling along Z path)
      const patrolZ = Math.sin(time * 0.45) * 3.8;
      if (droidRef.current) {
        droidRef.current.position.z = initialPos[2] + patrolZ;
        droidRef.current.position.y = initialPos[1];
        // Set rotation facing moving path direction
        const movingForward = Math.cos(time * 0.45) > 0;
        droidRef.current.rotation.y = movingForward ? 0 : Math.PI;
      }
      if (warningLightRef.current) {
        warningLightRef.current.intensity = 0;
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
    setAnimating(true);
    setTimer(0);
    onSelect({
      title: "GROUND SENTINEL",
      type: "DIAGNOSTICS LOCK",
      desc: "Industrial crawler patrolling sector coordinates. Engaging click trigger activates structural diagnostics rotation and warning flashes.",
      details: "Crawler Status: LOCKED | Charge: 98.7% | Signal: 100"
    });
  };

  const modelColor = animating ? "#ff007c" : (hovered ? "#00f0ff" : "#bd00ff");

  return (
    <group ref={droidRef} position={initialPos}>
      {/* Click target helper */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        position={[0, 0.4, 0]}
      >
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Industrial Chassis (Cylinder/Box) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.3, 0.36, 0.36, 6]} />
        <meshBasicMaterial color="#111122" />
      </mesh>
      {/* Side hazard panels */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.31, 0.37, 0.38, 6]} />
        <meshBasicMaterial color={modelColor} wireframe />
      </mesh>

      {/* Rolling treads wheels */}
      <mesh position={[0.26, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.26, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Head scanner lens */}
      <mesh position={[0, 0.44, 0.18]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={modelColor} />
      </mesh>

      {/* Flashing Alert light beacon */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
        <meshBasicMaterial color={animating ? "#ff007c" : "#ffcc00"} />
      </mesh>

      {/* Point light for alert strobe */}
      <pointLight
        ref={warningLightRef}
        color={animating ? "#ff007c" : "#ffcc00"}
        intensity={0}
        distance={2.5}
        decay={1.2}
        position={[0, 0.6, 0]}
      />

      {/* Volumetric scanner scanline cone when clicked */}
      {animating && (
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.28, 2.0, 12, 1, true]} />
          <meshBasicMaterial
            color="#ff007c"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Floating Tag */}
      <Html distanceFactor={6} position={[0, 0.76, 0]} center>
        <span
          className="text-hud"
          style={{
            color: modelColor,
            fontSize: '7px',
            letterSpacing: '1px',
            backgroundColor: 'rgba(3,3,12,0.85)',
            padding: '2px 5px',
            border: `1.5px solid ${modelColor}`,
            borderRadius: '3px',
            whiteSpace: 'nowrap'
          }}
        >
          {animating ? "[DIAGNOSTICS_RUN]" : "[SENTINEL_DRIP]"}
        </span>
      </Html>
    </group>
  );
}

// Sub-component: Floating Command holographic telemetry screens
function MainframeHoloScreen({ position, title, isAlert, logs }) {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(time * 1.6 + position[2]) * 0.1;
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer Glow bracket boundary */}
      <mesh>
        <planeGeometry args={[3.06, 2.26]} />
        <meshBasicMaterial
          color={isAlert ? "#ff007c" : "#00f0ff"}
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Html mainframe overlay */}
      <Html distanceFactor={8} center transform sprite>
        <div className={`factory-holo-card ${isAlert ? 'danger' : ''}`}>
          <div className={`factory-header ${isAlert ? 'pink' : ''}`}>
            {isAlert ? "// SYSTEM CRITICAL //" : "// TELEMETRY READOUT //"}
          </div>

          <div className="factory-title">{title}</div>

          <div className="factory-data-grid">
            <div className="factory-data-row">
              <span className="factory-label">THERM TEMP:</span>
              <span className={`factory-value ${isAlert ? 'pink' : 'green'}`}>
                {isAlert ? "124.5 °C [OVERHEAT]" : "42.1 °C [NOMINAL]"}
              </span>
            </div>
            <div className="factory-data-row">
              <span className="factory-label">RPM CAP:</span>
              <span className="factory-value">
                {isAlert ? "2800 RPM" : "1200 RPM"}
              </span>
            </div>
            <div className="factory-data-row">
              <span className="factory-label">WELD POWER:</span>
              <span className="factory-value">
                {isAlert ? "42.0 kW" : "18.5 kW"}
              </span>
            </div>
          </div>

          <div className="hazard-bar" />

          {/* Telemetry scrolling event log */}
          <div className="telemetry-log">
            {logs.map((log, i) => (
              <div key={i} className={`log-entry ${log.includes("OK") ? "ready" : ""}`}>
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

// Main Factory component
export default function RoboticsFactory({ onSelectEvent }) {
  return (
    <group>
      {/* ZONE 1: ROBOTIC ASSEMBLY LINE (Z = 5 to Z = -15) */}
      <ConveyorBelt startZ={6} endZ={-14} posY={-2.5} />
      <RoboticArm position={[-2.4, -2.4, -4]} isLeftArm={true} conveyorTargetZ={-4} />
      <RoboticArm position={[2.4, -2.4, -10]} isLeftArm={false} conveyorTargetZ={-10} />

      {/* ZONE 2: POWER GENERATOR INTERLOCKING GEARS (Z = -20 to Z = -35) */}
      {/* Lock A with B, B with C */}
      <IndustrialGear position={[-3.2, 0.4, -27]} radius={1.8} teethCount={16} speed={0.65} direction={1} color="#48485c" />
      <IndustrialGear position={[3.2, -1.0, -27]} radius={1.8} teethCount={16} speed={0.65} direction={-1} color="#3c3c4e" />
      <IndustrialGear position={[-0.4, 2.5, -27]} radius={1.2} teethCount={10} speed={0.97} direction={-1} color="#ffffff" />

      {/* Static ambient industrial lights */}
      <pointLight color="#bd00ff" intensity={1.5} distance={15} position={[-4, 4, -15]} />
      <pointLight color="#00f0ff" intensity={1.5} distance={15} position={[4, 4, -25]} />
      <pointLight color="#ff007c" intensity={1.2} distance={10} position={[0, -2, -10]} />
    </group>
  );
}

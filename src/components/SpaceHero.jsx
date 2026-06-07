import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Procedural 3D Techfest Logo (Gear + Core Monogram)
function TechfestLogo() {
  const logoRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (logoRef.current) {
      // Slow rotation and hover bobbing
      logoRef.current.rotation.y = time * 0.25;
      logoRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      logoRef.current.position.y = Math.sin(time * 1.2) * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -time * 0.4;
      innerRef.current.rotation.y = time * 0.5;
    }
  });

  // Create 8 gear teeth
  const teeth = useMemo(() => {
    const arr = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push({
        position: [Math.cos(angle) * 0.95, Math.sin(angle) * 0.95, 0],
        rotation: [0, 0, angle]
      });
    }
    return arr;
  }, []);

  return (
    <group ref={logoRef} position={[0, 0, 15]}>
      {/* Outer Gear Ring */}
      <mesh>
        <torusGeometry args={[0.85, 0.06, 12, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
      </mesh>

      {/* Gear Teeth */}
      {teeth.map((t, idx) => (
        <mesh key={idx} position={t.position} rotation={t.rotation}>
          <boxGeometry args={[0.15, 0.15, 0.08]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Inner Rotating Octahedron Core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#bd00ff" wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[0,0,0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ff007c" transparent opacity={0.6} />
      </mesh>

      {/* Floating subtitle label */}
      <Html distanceFactor={12} position={[0, -1.3, 0]} center>
        <div 
          className="text-hud text-neon-blue"
          style={{
            background: 'rgba(3, 3, 12, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '8px',
            letterSpacing: '3px',
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)'
          }}
        >
          TECHFEST IIT BOMBAY
        </div>
      </Html>
    </group>
  );
}

// Procedural Twinkling Stars
function TwinklingStars() {
  const pointsRef = useRef();
  const count = 3000;

  const [positions, sizes, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const szs = new Float32Array(count);
    const cols = new Float32Array(count * 3);

    const blue = new THREE.Color('#00f0ff');
    const purple = new THREE.Color('#bd00ff');
    const white = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      // Scatter in a shell from radius 30 to 80
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 30 + Math.random() * 50;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Sizes
      szs[i] = 0.05 + Math.random() * 0.15;

      // Color mapping
      let c = white.clone();
      const rand = Math.random();
      if (rand > 0.8) {
        c = blue.clone();
      } else if (rand > 0.65) {
        c = purple.clone();
      }
      
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    return [pos, szs, cols];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      // Slow background rotation
      pointsRef.current.rotation.y = time * 0.005;
      pointsRef.current.rotation.x = time * 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Procedural Rotating Planets
function SpacePlanets() {
  const planet1Ref = useRef();
  const planet2Ref = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (planet1Ref.current) {
      planet1Ref.current.rotation.y = time * 0.08;
    }
    if (planet2Ref.current) {
      planet2Ref.current.rotation.y = -time * 0.12;
      planet2Ref.current.rotation.x = time * 0.04;
    }
  });

  return (
    <group>
      {/* Planet 1: Large Neon Blue Gas Giant with Rings (far left) */}
      <group position={[-16, 6, -20]} ref={planet1Ref}>
        <mesh>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.25} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial color="#002d4d" transparent opacity={0.6} />
        </mesh>
        {/* Saturn-like Flat Rings */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[3.2, 4.5, 64]} />
          <meshBasicMaterial color="#bd00ff" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Planet 2: Purple-Red Lava World (far right) */}
      <group position={[18, -8, -30]} ref={planet2Ref}>
        <mesh>
          <sphereGeometry args={[3.8, 16, 16]} />
          <meshBasicMaterial color="#ff007c" wireframe transparent opacity={0.2} />
        </mesh>
        <mesh>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshBasicMaterial color="#220015" transparent opacity={0.8} />
        </mesh>
        {/* Orbiting Moon */}
        <mesh position={[6, 0, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// Procedural Nebula Clouds
function NebulaClouds() {
  const groupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.015;
    }
  });

  // Soft nebula spheres stacked together with additive blending
  const clouds = useMemo(() => [
    { pos: [-8, -4, -15], size: 6, color: '#002244' },
    { pos: [8, 4, -25], size: 8, color: '#2b0044' },
    { pos: [-4, 5, -20], size: 7, color: '#3c0022' },
    { pos: [10, -6, -20], size: 7, color: '#001a33' },
  ], []);

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <mesh key={i} position={c.pos}>
          <sphereGeometry args={[c.size, 16, 16]} />
          <meshBasicMaterial
            color={c.color}
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Moving Spiral Galaxy
function SpiralGalaxy() {
  const galaxyRef = useRef();
  const count = 1800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    
    const purple = new THREE.Color('#bd00ff');
    const blue = new THREE.Color('#00f0ff');
    const pink = new THREE.Color('#ff007c');

    for (let i = 0; i < count; i++) {
      // 3 spiral arms
      const armIndex = i % 3;
      const angleOffset = (armIndex * Math.PI * 2) / 3;
      
      const distance = (i / count) * 6; // spiral extent
      const angle = distance * 2.2 + angleOffset + (Math.random() - 0.5) * 0.35;
      
      // Add random displacement for thickness
      const x = Math.cos(angle) * distance + (Math.random() - 0.5) * 0.4;
      const y = (Math.random() - 0.5) * 0.2;
      const z = Math.sin(angle) * distance + (Math.random() - 0.5) * 0.4;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Arm colors
      let c = purple.clone();
      if (armIndex === 1) c = blue.clone();
      if (armIndex === 2) c = pink.clone();
      
      // Fade out at outer edges
      const fade = Math.max(0.1, 1 - (distance / 6));
      cols[i * 3] = c.r * fade;
      cols[i * 3 + 1] = c.g * fade;
      cols[i * 3 + 2] = c.b * fade;
    }

    return [pos, cols];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={galaxyRef} position={[6, 3, -12]} rotation={[Math.PI / 4, 0, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Shooting Meteors
function ShootingMeteors() {
  const groupRef = useRef();
  const meteorCount = 6;

  // Create initial positions & directions for meteors
  const meteors = useMemo(() => {
    const arr = [];
    for (let i = 0; i < meteorCount; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          10 + Math.random() * 5,
          -15 - Math.random() * 20
        ),
        speed: 0.25 + Math.random() * 0.2,
        length: 1.5 + Math.random() * 1.5,
        ref: React.createRef()
      });
    }
    return arr;
  }, []);

  useFrame(() => {
    meteors.forEach((m) => {
      if (m.ref.current) {
        // Move diagonal down-left
        m.pos.x -= m.speed * 1.2;
        m.pos.y -= m.speed;
        m.pos.z += m.speed * 0.8;

        m.ref.current.position.copy(m.pos);

        // Reset when out of bounds/near camera
        if (m.pos.y < -15 || m.pos.z > 20) {
          m.pos.set(
            10 + Math.random() * 20,
            10 + Math.random() * 5,
            -15 - Math.random() * 20
          );
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {meteors.map((m, i) => (
        <group key={i} ref={m.ref}>
          {/* Shooting star streak line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    0, 0, 0,
                    m.length * 1.2, m.length, -m.length * 0.8
                  ]),
                  3
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#00f0ff" transparent opacity={0.6} />
          </line>
        </group>
      ))}
    </group>
  );
}

export default function SpaceHero() {
  return (
    <group>
      <TwinklingStars />
      <SpacePlanets />
      <NebulaClouds />
      <SpiralGalaxy />
      <ShootingMeteors />
      <TechfestLogo />
    </group>
  );
}

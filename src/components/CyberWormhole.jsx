import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CyberWormhole({ currentScrollY }) {
  const pointsRef = useRef();
  const ringsRef = useRef();

  // Create random points inside a cylindrical shape
  const particleCount = 2500;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    
    const colorBlue = new THREE.Color('#00f0ff');
    const colorPurple = new THREE.Color('#bd00ff');
    const colorPink = new THREE.Color('#ff007c');

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical coordinates
      const radius = 6 + Math.random() * 8; // distance from center line
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 120; // extend from -60 to +60 along Z

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color mapping based on distance/depth
      let mixedColor = colorBlue.clone();
      const rand = Math.random();
      if (rand > 0.6) {
        mixedColor.lerp(colorPurple, Math.random());
      } else if (rand > 0.3) {
        mixedColor.lerp(colorPink, Math.random());
      }

      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }
    return [pos, cols];
  }, []);

  // Generate concentric 3D neon tunnel rings
  const ringsData = useMemo(() => {
    const rings = [];
    const count = 15;
    for (let i = 0; i < count; i++) {
      rings.push({
        z: -60 + i * 10,
        radius: 6.5,
        color: i % 2 === 0 ? '#00f0ff' : '#bd00ff'
      });
    }
    return rings;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Dynamic speed based on scrolling speed
    const scrollFactor = 1.0 + Math.min(5.0, currentScrollY * 0.005);

    // Slowly rotate particles and move them slightly down the Z-axis
    if (pointsRef.current) {
      pointsRef.current.rotation.z = time * 0.05;
      
      const positionsArray = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Move particles along Z
        positionsArray[i * 3 + 2] += 0.05 * scrollFactor;
        
        // Wrap around when they go past the tunnel end
        if (positionsArray[i * 3 + 2] > 60) {
          positionsArray[i * 3 + 2] = -60;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Spin the tunnel rings at different directions
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, index) => {
        const speed = 0.2 + (index % 3) * 0.1;
        const direction = index % 2 === 0 ? 1 : -1;
        ring.rotation.z = time * speed * direction;
        
        // Add subtle neon breathing effect by scaling
        const scaleVal = 1 + Math.sin(time * 2 + index) * 0.03;
        ring.scale.set(scaleVal, scaleVal, 1);
      });
    }
  });

  return (
    <group>
      {/* Glow Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
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

      {/* Cyber Tunnel Rings */}
      <group ref={ringsRef}>
        {ringsData.map((ring, idx) => (
          <group key={idx} position={[0, 0, ring.z]}>
            {/* Main Emissive Ring */}
            <mesh>
              <torusGeometry args={[ring.radius, 0.03, 8, 48]} />
              <meshBasicMaterial 
                color={ring.color} 
                transparent 
                opacity={0.65}
              />
            </mesh>
            
            {/* Outer wireframe decoration ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[ring.radius + 0.1, ring.radius + 0.2, 4]} />
              <meshBasicMaterial 
                color={ring.color === '#00f0ff' ? '#bd00ff' : '#00f0ff'} 
                transparent 
                opacity={0.25}
                wireframe
              />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Center ambient light beam */}
      <gridHelper 
        args={[100, 20, '#00f0ff', '#bd00ff']} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        opacity={0.05}
        transparent
      />
    </group>
  );
}

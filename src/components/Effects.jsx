import React from 'react';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function Effects() {
  return (
    <EffectComposer>
      {/* Bloom effect to make the neon glowing shapes and particles stand out */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        height={300}
      />
      
      {/* Subtle chromatic aberration to simulate camera lens displacement */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.0012, 0.0012]}
      />
      
      {/* Dark vignette framing */}
      <Vignette
        eskil={false}
        offset={0.3}
        darkness={0.8}
      />
    </EffectComposer>
  );
}

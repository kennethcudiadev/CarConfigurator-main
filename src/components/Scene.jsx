import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Watch } from './Watch'

function FallbackWatch() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.15]} />
      <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
    </mesh>
  )
}

function SceneContent({ config, rotationY, onPartClick, onLoaded }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#e8e8ec', '#6b6b78', 0.6]} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.9} />
      <Suspense fallback={<FallbackWatch />}>
        <Watch config={config} rotationY={rotationY} onPartClick={onPartClick} onLoaded={onLoaded} />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.5}
        minDistance={2}
        maxDistance={6}
      />
      <Environment
        files="/textures/studio.hdr"
        background={true}
        intensity={1.8}
      />
    </>
  )
}

export function Scene({ config, rotationY, onPartClick, onLoaded }) {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,rgb(219, 223, 238) 0%,rgb(198, 209, 252) 50%,rgb(196, 205, 238) 100%)' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent config={config} rotationY={rotationY} onPartClick={onPartClick} onLoaded={onLoaded} />
      </Canvas>
    </div>
  )
}

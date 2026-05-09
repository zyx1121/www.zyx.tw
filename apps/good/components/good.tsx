"use client"

import { OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

const MODEL_URL = "/good.glb"

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-gray-700" />
        <div className="absolute top-0 left-0 h-full w-full animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    </div>
  )
}

type ModelProps = {
  isInteracting: boolean
  onLoaded: () => void
}

function Model({ isInteracting, onLoaded }: ModelProps) {
  const { scene } = useGLTF(MODEL_URL)
  const modelRef = useRef<THREE.Group>(null)
  const initialRotationRef = useRef<number | null>(null)

  useEffect(() => {
    if (scene) onLoaded()
  }, [scene, onLoaded])

  // Apply a brighter metallic finish to every mesh in the GLTF scene.
  useEffect(() => {
    if (!scene) return
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const source = child.material as
        | (THREE.Material & {
            color?: THREE.Color
            map?: THREE.Texture | null
            normalMap?: THREE.Texture | null
          })
        | undefined
      const baseColor = source?.color
        ? source.color.clone().multiplyScalar(2.0)
        : new THREE.Color(0xcccccc).multiplyScalar(2.0)

      const metal = new THREE.MeshPhysicalMaterial({
        color: baseColor,
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 2.0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        emissive: new THREE.Color(0x222222),
        emissiveIntensity: 0.1,
      })
      if (source?.map) metal.map = source.map
      if (source?.normalMap) metal.normalMap = source.normalMap
      child.material = metal
    })
  }, [scene])

  useEffect(() => {
    if (modelRef.current && initialRotationRef.current === null) {
      const r = Math.random() * Math.PI * 2
      modelRef.current.rotation.y = r
      initialRotationRef.current = r
    }
  }, [])

  useFrame((_, delta) => {
    if (!isInteracting && modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <primitive
      ref={modelRef}
      object={scene}
      position={[0, -1, 0]}
      scale={0.05}
    />
  )
}

function Scene({ onModelLoaded }: { onModelLoaded: () => void }) {
  const [isInteracting, setIsInteracting] = useState(false)

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={3.0} />
      <directionalLight position={[-10, 5, -5]} intensity={2.0} />
      <directionalLight position={[0, -10, 0]} intensity={1.2} />
      <pointLight position={[5, 5, 5]} intensity={2.0} />
      <pointLight position={[-5, 5, -5]} intensity={1.8} />
      <Suspense fallback={null}>
        <Model isInteracting={isInteracting} onLoaded={onModelLoaded} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={3}
        maxDistance={10}
        onStart={() => setIsInteracting(true)}
        onEnd={() => {
          // Brief grace period so a release click doesn't immediately
          // jerk the auto-rotate back into action.
          window.setTimeout(() => setIsInteracting(false), 100)
        }}
      />
    </>
  )
}

useGLTF.preload(MODEL_URL)

export function Good() {
  const [isLoaded, setIsLoaded] = useState(false)
  const handleLoaded = useCallback(() => setIsLoaded(true), [])

  return (
    <div className="relative h-full w-full bg-black">
      {!isLoaded && <LoadingOverlay />}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Scene onModelLoaded={handleLoaded} />
      </Canvas>
    </div>
  )
}

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { PBR_TEXTURE_PATHS } from '../config/textures'

const MODEL_URL = '/models/model.glb'

function applyColorToMaterial(material, color) {
  if (!material) return
  if (Array.isArray(material)) {
    material.forEach((m) => applyColorToMaterial(m, color))
    return
  }
  material.color?.set(color)
  if (material.emissive) material.emissive.set(color).multiplyScalar(0.15)
  material.needsUpdate = true
}

/** Apply PBR texture maps to a material (MeshStandardMaterial) */
function applyPBRMaps(material, textures) {
  if (!material || !textures) return
  if (Array.isArray(material)) {
    material.forEach((m) => applyPBRMaps(m, textures))
    return
  }
  if (!material.isMeshStandardMaterial) return
  if (textures.map) material.map = textures.map
  if (textures.roughnessMap) {
    material.roughnessMap = textures.roughnessMap
    material.roughness = 1
  }
  if (textures.metalnessMap) {
    material.metalnessMap = textures.metalnessMap
    material.metalness = 1
  }
  if (textures.normalMap) {
    material.normalMap = textures.normalMap
    material.normalMapType = THREE.TangentSpaceNormalMap
  }
  if (textures.aoMap) {
    material.aoMap = textures.aoMap
    material.aoMapIntensity = 1
  }
  material.needsUpdate = true
}

/** Apply colors from config.partColors to every mesh by name */
function colorizeAllParts(scene, config) {
  if (!scene || !config.partColors || typeof config.partColors !== 'object') return
  const partColors = config.partColors
  scene.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const colorHex = partColors[child.name]
    if (colorHex) {
      applyColorToMaterial(child.material, new THREE.Color(colorHex))
    }
  })
}

function isSelectableMeshName(name) {
  const n = (name || '').toLowerCase()
  // Do not allow selecting the watch glass / crystal
  if (n.includes('glass') || n.includes('crystal') || n.includes('lens')) return false
  return true
}

export function Watch({ config, rotationY = 0, onPartHover, onPartClick, onLoaded }) {
  const groupRef = useRef(null)
  const lastPartRef = useRef(null)
  const secondHandsRef = useRef([])
  const minuteHandsRef = useRef([])
  const hourHandsRef = useRef([])
  const { scene: gltfScene } = useGLTF(MODEL_URL)
  const pbrTextures = useTexture(PBR_TEXTURE_PATHS)
  useEffect(() => {
    if (pbrTextures.map) pbrTextures.map.colorSpace = THREE.SRGBColorSpace
  }, [pbrTextures.map])

  useEffect(() => {
    if (gltfScene && onLoaded) onLoaded()
  }, [gltfScene, onLoaded])

  const scene = useMemo(() => {
    if (!gltfScene) return null
    const clone = gltfScene.clone()
    const seconds = []
    const minutes = []
    const hours = []
    clone.traverse((c) => {
      if (c.isMesh && c.material) {
        if (!Array.isArray(c.material)) {
          c.material = c.material.clone()
        } else {
          c.material = c.material.map((m) => m.clone())
        }
        const lname = (c.name || '').toLowerCase()
        // Treat watch glass / crystal as highly reflective, transparent material
        if (lname.includes('glass') || lname.includes('crystal') || lname.includes('lens')) {
          const mats = Array.isArray(c.material) ? c.material : [c.material]
          mats.forEach((m) => {
            if (!m) return
            m.transparent = true
            m.opacity = 0.12
            m.roughness = 0.02
            m.metalness = 0
            m.envMapIntensity = 1.6
            if ('clearcoat' in m) {
              m.clearcoat = 1
              m.clearcoatRoughness = 0.05
            }
            m.depthWrite = false
            m.needsUpdate = true
          })
        } else {
          applyPBRMaps(c.material, pbrTextures)
        }
        if (
          lname.includes('second') ||
          lname.includes('sec_hand') ||
          lname.includes('hand_sec') ||
          lname.includes('seconds')
        ) {
          seconds.push(c)
        } else if (
          lname.includes('minute') ||
          lname.includes('min_hand') ||
          lname.includes('hand_min') ||
          lname.includes('mins')
        ) {
          minutes.push(c)
        } else if (
          lname.includes('hour') ||
          lname.includes('hr_hand') ||
          lname.includes('hand_hour')
        ) {
          hours.push(c)
        }
      }
    })
    secondHandsRef.current = seconds
    minuteHandsRef.current = minutes
    hourHandsRef.current = hours
    return clone
  }, [gltfScene, pbrTextures])

  // Apply colors to all parts whenever config.partColors changes
  useMemo(() => {
    if (scene && config) colorizeAllParts(scene, config)
  }, [scene, config?.partColors])

  useFrame((state) => {
    if (!groupRef.current) return

    const now = new Date()
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000
    const minutes = now.getMinutes() + seconds / 60
    const hours = (now.getHours() % 12) + minutes / 60

    // Rotate second hand: 1 revolution per 60 seconds
    if (secondHandsRef.current.length > 0) {
      const angleSec = -(seconds / 60) * Math.PI * 2
      secondHandsRef.current.forEach((hand) => {
        hand.rotation.z = angleSec
      })
    }

    // Rotate minute hand: 1 revolution per 60 minutes
    if (minuteHandsRef.current.length > 0) {
      const angleMin = -(minutes / 60) * Math.PI * 2
      minuteHandsRef.current.forEach((hand) => {
        hand.rotation.z = angleMin
      })
    }

    // Rotate hour hand: 1 revolution per 12 hours
    if (hourHandsRef.current.length > 0) {
      const angleHour = -(hours / 12) * Math.PI * 2
      hourHandsRef.current.forEach((hand) => {
        hand.rotation.z = angleHour
      })
    }

    // Raycast-based hover: report which mesh (part) is under the pointer
    const raycaster = state.raycaster
    const pointer = state.pointer
    raycaster.setFromCamera(pointer, state.camera)
    const list = raycaster.intersectObject(groupRef.current, true)
    const hit = list[0]
    const meshName =
      hit?.object?.name != null && isSelectableMeshName(hit.object.name)
        ? hit.object.name
        : null
    if (meshName !== lastPartRef.current) {
      lastPartRef.current = meshName
      onPartHover?.(meshName)
    }
  })

  // Click fallback: when pointer goes down then up over the watch, open panel for hovered part
  const { gl } = useThree()
  const pointerDownPartRef = useRef(null)
  useEffect(() => {
    if (!onPartClick) return
    const el = gl.domElement
    const onDown = () => {
      pointerDownPartRef.current = lastPartRef.current
    }
    const onUp = () => {
      if (pointerDownPartRef.current != null && isSelectableMeshName(pointerDownPartRef.current)) {
        onPartClick(pointerDownPartRef.current)
        pointerDownPartRef.current = null
      }
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl.domElement, onPartClick])

  if (!scene) return null

  const handlePointerDown = (e) => {
    e.stopPropagation()
    const name = e.object?.name
    if (name != null && isSelectableMeshName(name)) {
      pointerDownPartRef.current = null
      onPartClick?.(name)
    }
  }

  return (
    <group
      ref={groupRef}
      rotation={[0, rotationY, 0]}
      scale={3}
      onPointerDown={handlePointerDown}
    >
      <primitive object={scene} />
    </group>
  )
}

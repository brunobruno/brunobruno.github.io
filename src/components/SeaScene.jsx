import { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Underwater finale for the shared Footer: a fullscreen caustics shader
 * (classic interference pattern — sun focused through moving water),
 * additive-blended so it sparkles over the CSS depth gradient, plus a
 * marine-snow particle field drifting down. The whole canvas mounts only
 * while the footer is near the viewport — zero GL cost elsewhere.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uRes;
  varying vec2 vUv;

  // classic water-caustic interference pattern
  float caustic(vec2 uv, float t) {
    vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < 4; n++) {
      float tt = t * (1.0 - (3.5 / float(n + 1)));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= 4.0;
    c = 1.17 - pow(c, 1.4);
    return pow(abs(c), 8.0);
  }

  void main() {
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0) * 1.6;
    float c1 = caustic(uv, uTime * 0.32);
    float c2 = caustic(uv * 1.7 + 13.7, uTime * 0.21);
    vec3 col = vec3(0.55, 0.85, 1.0) * (c1 * 0.5 + c2 * 0.22);
    float a = clamp(c1 * 0.75 + c2 * 0.3, 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`

function Caustics() {
  const mesh = useRef()
  const material = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
    }),
    [],
  )
  const { size } = useThree()
  useFrame((_, dt) => {
    if (mesh.current) mesh.current.scale.x = size.width / size.height
    const u = material.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    u.uRes.value[0] = size.width
    u.uRes.value[1] = size.height
  })
  return (
    <mesh ref={mesh}>
      <planeGeometry args={[2, 2]} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

const SNOW_COUNT = 420

function Snow() {
  const ref = useRef()
  const { positions, phases, speeds } = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3)
    const phases = new Float32Array(SNOW_COUNT)
    const speeds = new Float32Array(SNOW_COUNT)
    for (let i = 0; i < SNOW_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8
      phases[i] = Math.random() * Math.PI * 2
      speeds[i] = 0.08 + Math.random() * 0.22
    }
    return { positions, phases, speeds }
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pos = ref.current?.geometry.attributes.position
    if (!pos) return
    for (let i = 0; i < SNOW_COUNT; i++) {
      const y = positions[i * 3 + 1] - ((t * speeds[i]) % 1.8)
      pos.array[i * 3 + 1] = y < -0.95 ? y + 1.8 : y
      pos.array[i * 3] = positions[i * 3] + Math.sin(t * 0.4 + phases[i]) * 0.12
    }
    pos.needsUpdate = true
  })
  const { size } = useThree()
  return (
    <group scale={[Math.max(0.5, size.width / size.height), 1, 1]}>
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.006} color="#cfeaff" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
    </group>
  )
}

/* Fish silhouettes — flat dark shapes with a tail beat, swimming the
   ±1 ortho water column. Whale deepest, sharks mid, fish near surface. */
const FISH = [
  { kind: 'whale', y: -0.68, scale: 0.34, speed: 0.09, dir: -1, phase: 0.0, op: 0.6 },
  { kind: 'shark', y: -0.22, scale: 0.22, speed: 0.2, dir: 1, phase: 1.7, op: 0.7 },
  { kind: 'shark', y: 0.48, scale: 0.17, speed: 0.16, dir: -1, phase: 3.4, op: 0.62 },
  { kind: 'fish', y: 0.82, scale: 0.1, speed: 0.4, dir: 1, phase: 0.9, op: 0.9 },
  { kind: 'fish', y: 0.0, scale: 0.085, speed: 0.48, dir: -1, phase: 2.6, op: 0.85 },
  { kind: 'fish', y: 0.28, scale: 0.075, speed: 0.44, dir: 1, phase: 4.1, op: 0.8 },
]

function FishBody({ kind, op }) {
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#03141f', transparent: true, opacity: op, depthWrite: false }),
    [op],
  )
  if (kind === 'whale')
    return (
      <group>
        <mesh scale={[1.5, 0.42, 0.22]} material={material}><sphereGeometry args={[0.5, 14, 10]} /></mesh>
        <mesh position={[-0.95, 0.05, 0]} rotation={[0, 0, 0.5]} scale={[0.5, 0.28, 0.06]} material={material}><coneGeometry args={[0.16, 0.5, 4]} /></mesh>
        <mesh position={[-0.95, -0.05, 0]} rotation={[0, 0, -0.5]} scale={[0.5, 0.28, 0.06]} material={material}><coneGeometry args={[0.16, 0.5, 4]} /></mesh>
      </group>
    )
  if (kind === 'shark')
    return (
      <group>
        <mesh scale={[1.7, 0.42, 0.2]} material={material}><sphereGeometry args={[0.4, 12, 9]} /></mesh>
        <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.16, 0.5, 0.05]} material={material}><coneGeometry args={[0.22, 0.7, 4]} /></mesh>
        <mesh position={[0.1, 0.24, 0]} rotation={[0, 0, -0.5]} scale={[0.14, 0.34, 0.05]} material={material}><coneGeometry args={[0.18, 0.4, 4]} /></mesh>
      </group>
    )
  return (
    <group>
      <mesh scale={[1.8, 0.5, 0.18]} material={material}><sphereGeometry args={[0.35, 12, 9]} /></mesh>
      <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.18, 0.4, 0.05]} material={material}><coneGeometry args={[0.18, 0.5, 4]} /></mesh>
    </group>
  )
}

function Fish({ cfg }) {
  const g = useRef()
  const tail = useRef()
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    if (!g.current) return
    const halfW = (camera.right - camera.left) / 2 + 0.35
    const halfH = (camera.top - camera.bottom) / 2
    const span = Math.min(halfW, 3.2)
    const x = ((((t * cfg.speed * cfg.dir + cfg.phase) % (span * 2)) + span * 2) % (span * 2)) - span
    g.current.position.set(x, cfg.y * halfH + Math.sin(t * 0.6 + cfg.phase) * halfH * 0.08, 0)
    g.current.rotation.y = cfg.dir > 0 ? 0 : Math.PI
    g.current.rotation.z = Math.sin(t * 0.9 + cfg.phase) * 0.05
    if (tail.current) tail.current.rotation.z = Math.sin(t * 5 + cfg.phase) * 0.18
  })
  return (
    <group ref={g} scale={cfg.scale}>
      <group ref={tail}>
        <FishBody kind={cfg.kind} op={cfg.op} />
      </group>
    </group>
  )
}

function FishField() {
  return (
    <>
      {FISH.map((f, i) => (
        <Fish key={i} cfg={f} />
      ))}
    </>
  )
}

function Rig() {
  const { camera, size } = useThree()
  useFrame(() => {
    const a = size.width / size.height
    camera.left = -a
    camera.right = a
    camera.top = 1
    camera.bottom = -1
    camera.updateProjectionMatrix()
    camera.position.set(0, 0, 1)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function SeaScene() {
  const wrapRef = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '80%' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={wrapRef} className="footer__gl" aria-hidden>
      {near && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1 }}
          dpr={typeof window !== 'undefined' && window.innerWidth < 768 ? [1, 1] : [1, 1.5]}
          gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
          frameloop="always"
        >
          <Rig />
          <Caustics />
          <Snow />
          <FishField />
        </Canvas>
      )}
    </div>
  )
}

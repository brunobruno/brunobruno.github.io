import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Color, MathUtils, Vector3 } from 'three'

/**
 * A kaleidoscopic tunnel: rings of letters and primitives arranged with
 * radial symmetry, counter-rotating, receding into fog. Scroll progress
 * (`progressRef`, 0→1) drives the camera down the tube; at the end the
 * letters of FUTURE fly in from the walls and lock into place.
 */

const FONT = 'https://fonts.gstatic.com/s/unbounded/v12/Yq6F-LOTXCb04q32xlpat-6uR42XTqtG67H244rNhw.woff'
const RINGS = 30
const SPACING = 5
const ITEMS = 12
const TRAVEL = (RINGS - 2) * SPACING // how far the camera flies
const PALETTE = ['#ff3fa4', '#ffe600', '#19c3e6', '#c6ff3f', '#8b5cf6', '#ffffff']
const GLYPHS = 'AEKMNRSTVXYZ0147<>/{}#@*&?!'
const SHAPES = ['torus', 'octa', 'box', 'cone', 'ring']

const rand = (seed) => {
  // tiny deterministic PRNG so the tunnel is identical on every visit
  let s = seed * 9301 + 49297
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

function buildRings() {
  const rnd = rand(7)
  return Array.from({ length: RINGS }, (_, i) => {
    const letters = [GLYPHS[(rnd() * GLYPHS.length) | 0], GLYPHS[(rnd() * GLYPHS.length) | 0]]
    const shape = SHAPES[(rnd() * SHAPES.length) | 0]
    return {
      z: -i * SPACING - 6,
      radius: 3.4 + Math.sin(i * 0.7) * 0.8,
      dir: i % 2 ? 1 : -1,
      speed: 0.08 + rnd() * 0.12,
      spin: 1.5 + rnd() * 2,
      color: PALETTE[i % PALETTE.length],
      alt: PALETTE[(i + 2) % PALETTE.length],
      letters,
      shape,
      wire: rnd() > 0.5,
      // per-element opacity so the tunnel reads as layered glass, not neon wall
      slotAlpha: Array.from({ length: ITEMS }, () => 0.28 + rnd() * 0.62),
      halo: 0.08 + rnd() * 0.2,
    }
  })
}

function Shape({ kind, color, wire, opacity = 1 }) {
  const mat = <meshBasicMaterial color={color} wireframe={wire} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 0.85} toneMapped={false} />
  switch (kind) {
    case 'torus':
      return <mesh>{mat}<torusGeometry args={[0.42, 0.14, 10, 24]} /></mesh>
    case 'octa':
      return <mesh>{mat}<octahedronGeometry args={[0.5]} /></mesh>
    case 'box':
      return <mesh>{mat}<boxGeometry args={[0.6, 0.6, 0.6]} /></mesh>
    case 'cone':
      return <mesh>{mat}<coneGeometry args={[0.4, 0.8, 5]} /></mesh>
    default:
      return <mesh>{mat}<ringGeometry args={[0.3, 0.5, 6]} /></mesh>
  }
}

function Ring({ r, progressRef }) {
  const group = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const p = progressRef.current
    group.current.rotation.z = r.dir * (t * r.speed + p * r.spin)
    // breathe the radius a little so the tube feels alive
    const s = 1 + Math.sin(t * 0.8 + r.z * 0.1) * 0.04
    group.current.scale.setScalar(s)
  })
  const slots = useMemo(() => {
    const out = []
    for (let k = 0; k < ITEMS; k++) {
      const a = (k / ITEMS) * Math.PI * 2
      const isLetter = k % 3 === 0 // 4 letters per ring, 3-fold symmetric
      const letter = r.letters[(k / 3) % 2 | 0]
      out.push({ a, x: Math.cos(a) * r.radius, y: Math.sin(a) * r.radius, isLetter, letter, mirror: k % 2 === 1 })
    }
    return out
  }, [r])
  return (
    <group ref={group} position={[0, 0, r.z]}>
      {slots.map((s, k) => (
        <group key={k} position={[s.x, s.y, 0]} rotation={[0, 0, s.a + Math.PI / 2]}>
          {s.isLetter ? (
            <Text
              font={FONT}
              fontSize={0.9}
              color={r.color}
              anchorX="center"
              anchorY="middle"
              scale={[s.mirror ? -1 : 1, 1, 1]}
              outlineWidth={0.03}
              outlineColor="#000"
              fillOpacity={r.slotAlpha[k]}
            >
              {s.letter}
            </Text>
          ) : (
            <group rotation={[s.a, s.a * 0.5, 0]}>
              <Shape kind={r.shape} color={k % 4 === 2 ? r.alt : r.color} wire={r.wire ? k % 2 === 0 : false} opacity={r.slotAlpha[k]} />
            </group>
          )}
        </group>
      ))}
      {/* a thin halo ring per slice gives the kaleidoscope its spokes */}
      <mesh>
        <ringGeometry args={[r.radius + 1.1, r.radius + 1.16, 48]} />
        <meshBasicMaterial color={r.alt} transparent opacity={r.halo} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Tube({ progressRef }) {
  const a = useRef(), b = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, p = progressRef.current
    a.current.rotation.z = t * 0.05 + p * 2
    b.current.rotation.z = -t * 0.04 - p * 1.4
  })
  const len = RINGS * SPACING + 40
  return (
    <group position={[0, 0, -len / 2 + 4]}>
      <mesh ref={a} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[5.6, 5.6, len, 24, 48, true]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.18} toneMapped={false} />
      </mesh>
      <mesh ref={b} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6.4, 6.4, len, 12, 24, true]} />
        <meshBasicMaterial color="#ff3fa4" wireframe transparent opacity={0.1} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Dust() {
  const positions = useMemo(() => {
    const rnd = rand(3)
    const arr = new Float32Array(1500 * 3)
    for (let i = 0; i < 1500; i++) {
      const a = rnd() * Math.PI * 2, rr = 1 + rnd() * 4.5
      arr[i * 3] = Math.cos(a) * rr
      arr[i * 3 + 1] = Math.sin(a) * rr
      arr[i * 3 + 2] = -rnd() * (RINGS * SPACING + 30)
    }
    return arr
  }, [])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.7} sizeAttenuation toneMapped={false} />
    </points>
  )
}

const WORD = 'FUTURE'
function Future({ progressRef }) {
  const refs = useRef([])
  const zEnd = -TRAVEL - 9
  const targets = useMemo(() => {
    const w = 2.4
    return [...WORD].map((_, i) => new Vector3((i - (WORD.length - 1) / 2) * w, 0, zEnd))
  }, [zEnd])
  const starts = useMemo(
    () => [...WORD].map((_, i) => {
      const a = (i / WORD.length) * Math.PI * 2 + 0.6
      return new Vector3(Math.cos(a) * 9, Math.sin(a) * 9, zEnd + 14)
    }),
    [zEnd],
  )
  const tmp = useMemo(() => new Vector3(), [])
  useFrame(({ clock }) => {
    const p = progressRef.current
    const k = MathUtils.smoothstep(p, 0.78, 0.97)
    const t = clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (!m) return
      const ease = MathUtils.smoothstep(k, i * 0.06, 0.7 + i * 0.05)
      tmp.lerpVectors(starts[i], targets[i], ease)
      m.position.copy(tmp)
      m.rotation.set((1 - ease) * 2.4, (1 - ease) * 3.1 + Math.sin(t + i) * 0.04 * ease, (1 - ease) * 1.2)
      const s = 0.6 + ease * 0.4 + Math.sin(t * 2 + i) * 0.02 * ease
      m.scale.setScalar(s)
      m.material.opacity = 0.15 + ease * 0.85
    })
  })
  return (
    <group>
      {[...WORD].map((ch, i) => (
        <Text
          key={i}
          ref={(el) => (refs.current[i] = el)}
          font={FONT}
          fontSize={2.6}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          outlineWidth={0.08}
          outlineColor="#ff3fa4"
          outlineBlur={0.2}
          material-transparent
        >
          {ch}
        </Text>
      ))}
      <pointLight position={[0, 0, zEnd + 3]} intensity={6} color="#ff3fa4" distance={20} />
    </group>
  )
}

function Rig({ progressRef }) {
  const { camera, pointer } = useThree()
  const target = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const p = progressRef.current
    const z = -p * TRAVEL
    // ease the camera so wheel steps feel like gliding, not stepping
    camera.position.z += (z - camera.position.z) * 0.12
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.05
    camera.position.y += (pointer.y * 0.6 - camera.position.y) * 0.05
    camera.rotation.z += (p * Math.PI * 2 - camera.rotation.z) * 0.06
    target.set(pointer.x * 0.3, pointer.y * 0.2, camera.position.z - 10)
    camera.lookAt(target)
    camera.rotation.z = p * Math.PI * 2 // one full barrel roll; lookAt resets it, so restore after
  })
  return null
}

export default function VortexScene({ progressRef, active }) {
  const rings = useMemo(() => buildRings(), [])
  const bg = useMemo(() => new Color('#050308'), [])
  return (
    <Canvas
      camera={{ position: [0, 0, 0], fov: 78, near: 0.1, far: 90 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      scene={{ background: bg }}
    >
      <fog attach="fog" args={['#050308', 8, 55]} />
      <Rig progressRef={progressRef} />
      <Tube progressRef={progressRef} />
      <Dust />
      {rings.map((r, i) => (
        <Ring key={i} r={r} progressRef={progressRef} />
      ))}
      <Future progressRef={progressRef} />
    </Canvas>
  )
}

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color, Matrix3, Vector3 } from 'three'

/**
 * A fully procedural Moon: craters, maria and regolith are generated in GLSL,
 * so there is nothing to download. `sunRef` holds the sun angle (radians)
 * driven from scroll; the phase sweeps as the visitor moves through the slide.
 */

const vertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  ${'' /* height is shared with the fragment shader through the include below */}
  __NOISE__
  void main() {
    vNormal = normalize(normal);
    vPos = position;
    float h = height(normalize(position));
    vec3 displaced = position + normal * h * 0.03;
    vec4 wp = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const noise = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  vec3 hash3(vec3 p) {
    return vec3(hash(p), hash(p + 31.7), hash(p + 67.3));
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
    return n;
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.1 + 7.3;
      a *= 0.5;
    }
    return v;
  }
  // bowl-shaped craters with a raised rim, one per noise cell
  float craters(vec3 p, float freq) {
    p *= freq;
    vec3 i = floor(p);
    vec3 f = fract(p);
    float v = 0.0;
    for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
    for (int z = -1; z <= 1; z++) {
      vec3 g = vec3(float(x), float(y), float(z));
      vec3 o = hash3(i + g);
      if (o.z < 0.42) continue; // leave most cells empty so craters cluster naturally
      float r = 0.12 + 0.3 * o.x;
      float d = length(f - (g + 0.15 + o * 0.7)) / r;
      if (d < 1.0) {
        float bowl = -pow(1.0 - d * d, 1.5) * 0.8;
        float rim = smoothstep(0.7, 0.96, d) * (1.0 - smoothstep(0.96, 1.0, d)) * 0.22;
        v += (bowl + rim) * r * 1.4 * (0.5 + o.y);
      }
    }
    return v;
  }
  float height(vec3 n) {
    float h = craters(n, 2.6) * 0.8 + craters(n + 11.0, 6.0) * 0.5 + craters(n + 5.0, 14.0) * 0.3 + craters(n + 23.0, 30.0) * 0.12;
    h += (fbm(n * 5.0) - 0.5) * 0.3;
    return h;
  }
  float maria(vec3 n) {
    float m = fbm(n * 1.6 + 3.0);
    return smoothstep(0.52, 0.66, m);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uSun;
  uniform vec3 uEarthshine;
  uniform float uTime;
  uniform mat3 uNormalMatrix;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  __NOISE__
  void main() {
    vec3 n = normalize(vPos);
    // bump normal from finite differences of the height field
    vec3 t = normalize(cross(n, abs(n.y) > 0.98 ? vec3(1, 0, 0) : vec3(0, 1, 0)));
    vec3 b = cross(n, t);
    float e = 0.008;
    float h0 = height(n);
    float ht = height(normalize(n + t * e));
    float hb = height(normalize(n + b * e));
    vec3 bumped = normalize(n - t * (ht - h0) * 6.0 - b * (hb - h0) * 6.0);
    vec3 N = normalize(uNormalMatrix * bumped);

    float m = maria(n);
    float grain = (fbm(n * 40.0) - 0.5) * 0.16 + (fbm(n * 120.0) - 0.5) * 0.08;
    vec3 albedo = mix(vec3(0.58, 0.57, 0.55), vec3(0.27, 0.28, 0.31), m) + grain;
    albedo += smoothstep(0.03, 0.09, h0) * 0.07; // crater rims are brighter, fresher regolith

    vec3 L = normalize(uSun);
    float lambert = max(dot(N, L), 0.0);
    float wrap = pow(max(dot(N, L) * 0.5 + 0.5, 0.0), 2.4);
    float terminator = smoothstep(-0.05, 0.25, dot(N, L));
    vec3 lit = albedo * (lambert * 1.05 + wrap * 0.18) * terminator;

    // the dark side is never black: a cold earthshine fills it
    vec3 V = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 dark = albedo * uEarthshine * (0.18 + rim * 0.5);

    vec3 color = lit + dark * (1.0 - terminator) + rim * uEarthshine * 0.25;
    gl_FragColor = vec4(color, 1.0);
  }
`

const MARKERS = [{ id: 'apollo', lat: 0.674, lng: 23.473, label: 'Tranquility Base', sub: 'Apollo 11 · 1969' }]

const toVec = (lat, lng, r = 1) => {
  const la = (lat * Math.PI) / 180, lo = (lng * Math.PI) / 180
  return new Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo))
}
const toLatLng = (v) => {
  const n = v.clone().normalize()
  return { lat: (Math.asin(n.y) * 180) / Math.PI, lng: (Math.atan2(n.x, n.z) * 180) / Math.PI }
}

function MoonMesh({ sunRef, onLand, markers, meshRef }) {
  const material = useRef()
  useFrame((_, dt) => {
    const u = material.current?.uniforms
    if (!u || !meshRef.current) return
    const a = sunRef.current
    u.uSun.value.set(Math.cos(a), 0.25, Math.sin(a))
    u.uTime.value += dt
    // world-space normal matrix (the mesh rotates under OrbitControls' camera, but stays safe if it ever spins itself)
    u.uNormalMatrix.value.getNormalMatrix(meshRef.current.matrixWorld)
  })
  const uniforms = useMemo(
    () => ({
      uSun: { value: new Vector3(1, 0.2, 0.6) },
      uEarthshine: { value: new Color('#4a6fa8') },
      uTime: { value: 0 },
      uNormalMatrix: { value: new Matrix3() },
    }),
    [],
  )
  const shaders = useMemo(
    () => ({ vertexShader: vertex.replace('__NOISE__', noise), fragmentShader: fragment.replace('__NOISE__', noise) }),
    [],
  )
  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onLand(meshRef.current.worldToLocal(e.point.clone()))
        }}
        onPointerOver={() => (document.body.style.cursor = 'crosshair')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial ref={material} uniforms={uniforms} {...shaders} />
      </mesh>
      {markers.map((m) => (
        <Marker key={m.id} m={m} />
      ))}
    </group>
  )
}

function Marker({ m }) {
  const pos = toVec(m.lat, m.lng, 1.045)
  const ring = useRef()
  useFrame(({ clock }) => {
    if (!ring.current) return
    const s = 1 + (Math.sin(clock.elapsedTime * 2.4 + m.lat) + 1) * 0.35
    ring.current.scale.setScalar(s)
    ring.current.material.opacity = 0.9 - (s - 1) * 1.1
  })
  return (
    <group position={pos} onUpdate={(g) => g.lookAt(0, 0, 0)}>
      <mesh>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#c6ff3f" />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.025, 0.03, 32]} />
        <meshBasicMaterial color="#c6ff3f" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

/**
 * Projects each marker to screen space every frame and positions plain DOM
 * labels (rendered by MoonScene outside the Canvas). Labels on the far side
 * of the Moon are hidden. This replaces drei's <Html>, which mounts its own
 * React root and can throw `removeChild` errors when the view unmounts.
 */
function LabelProjector({ markers, labelRefs, meshRef }) {
  const v = useMemo(() => new Vector3(), [])
  const n = useMemo(() => new Vector3(), [])
  const wp = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.getWorldPosition(wp)
    markers.forEach((m) => {
      const el = labelRefs.current[m.id]
      if (!el) return
      v.copy(toVec(m.lat, m.lng, 1.06))
      mesh.localToWorld(v)
      n.copy(v).sub(wp).normalize() // outward normal at the marker
      const facing = n.dot(wp.copy(camera.position).sub(v).normalize()) > 0.08
      v.project(camera)
      const x = ((v.x + 1) / 2) * size.width
      const y = ((1 - v.y) / 2) * size.height
      el.style.transform = `translate(${(x + 14).toFixed(1)}px, ${y.toFixed(1)}px) translateY(-50%)`
      el.style.opacity = facing ? '1' : '0'
    })
  })
  return null
}

export default function MoonScene({ sunRef, active, onLanding }) {
  const [markers, setMarkers] = useState(MARKERS)
  const meshRef = useRef()
  const labelRefs = useRef({})

  const land = (local) => {
    const { lat, lng } = toLatLng(local)
    const id = `site-${Date.now()}`
    const site = {
      id,
      lat,
      lng,
      label: `Site ${String(markers.length).padStart(2, '0')}`,
      sub: `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`,
    }
    setMarkers((m) => [...m.slice(-5), site])
    onLanding?.(site)
  }

  return (
    <div className="moon__scene">
      <Canvas
        camera={{ position: [0, 0, 3.7], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={active ? 'always' : 'never'}
        style={{ background: 'transparent' }}
      >
        <MoonMesh sunRef={sunRef} onLand={land} markers={markers} meshRef={meshRef} />
        <LabelProjector markers={markers} labelRefs={labelRefs} meshRef={meshRef} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} rotateSpeed={0.6} dampingFactor={0.08} enableDamping />
      </Canvas>
      {markers.map((m) => (
        <div key={m.id} ref={(el) => (labelRefs.current[m.id] = el)} className="moon__label">
          <strong>{m.label}</strong>
          <span>{m.sub}</span>
        </div>
      ))}
    </div>
  )
}

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/**
 * Fullscreen domain-warped FBM smoke — no textures, no geometry, one shader
 * quad. `progressRef` (0→1 scroll) thickens the fog until white-out, then
 * parts it for the finale; time keeps it churning while idle; the pointer
 * steers the warp field a little. Sparse embers drift up through the smoke.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform vec2 uRes;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1, 0)), f.x),
      mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x),
      f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= uRes.x / uRes.y;
    float t = uTime * 0.055;

    // smoke rises slowly; scroll drags it sideways so motion reads
    vec2 p = uv * 1.9;
    p.y -= t * 0.4;
    p.x += uProgress * 1.1;

    // two-stage domain warp — the smoke folds through itself
    vec2 q = vec2(
      fbm(p + vec2(0.0, t)),
      fbm(p + vec2(5.2, -t * 0.7)));
    vec2 r = vec2(
      fbm(p + 2.4 * q + vec2(1.7 + uPointer.x * 0.7, 9.2 + uPointer.y * 0.5)),
      fbm(p + 2.4 * q + vec2(8.3, 2.8 - t * 0.6)));
    float d = fbm(p + 3.2 * r);

    // scroll: density builds to white-out, then the fog parts at the end
    float thick = mix(0.55, 1.7, sin(min(uProgress * 1.12, 0.9) * 2.7));
    float part = smoothstep(0.74, 0.97, uProgress);
    d = pow(max(d * thick - part * 0.75, 0.0), 1.25);

    // cold smoke over void, with magenta blooming inside the warp field
    vec3 col = vec3(0.02, 0.012, 0.031);
    col = mix(col, vec3(0.38, 0.4, 0.5), smoothstep(0.04, 0.9, d));
    col += vec3(1.0, 0.25, 0.64) * pow(max(r.x * r.y, 0.0), 2.4) * 0.5 * d;

    // sparse embers drifting up through the smoke
    float ember = smoothstep(0.986, 1.0, noise(uv * 34.0 + vec2(r.x * 2.0, -uTime * 0.8)));
    col += vec3(1.0, 0.82, 0.35) * ember * (0.25 + d * 0.9);

    // vignette
    col *= smoothstep(1.3, 0.4, length(uv));

    gl_FragColor = vec4(col, 1.0);
  }
`

function Smoke({ progressRef }) {
  const material = useRef()
  const { pointer, size } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPointer: { value: [0, 0] },
      uRes: { value: [1, 1] },
    }),
    [],
  )
  useFrame((_, dt) => {
    const u = material.current?.uniforms
    if (!u) return
    u.uTime.value += dt
    u.uProgress.value = progressRef.current
    u.uPointer.value[0] += (pointer.x - u.uPointer.value[0]) * 0.04
    u.uPointer.value[1] += (pointer.y - u.uPointer.value[1]) * 0.04
    u.uRes.value[0] = size.width
    u.uRes.value[1] = size.height
  })
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  )
}

export default function FogScene({ progressRef, active }) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      style={{ background: '#050308' }}
    >
      <Smoke progressRef={progressRef} />
    </Canvas>
  )
}

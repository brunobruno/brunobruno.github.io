import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/**
 * Fullscreen procedural burn — no textures, one shader quad.
 * `progressRef` (0→1 scroll) drives the burn front: a ragged FBM edge that
 * grows from a pulsing ember at the centre until the charred surface is
 * consumed by flame, then the inferno dies down for the finale. Time keeps
 * the flames licking while idle; the pointer leans the fire slightly.
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
    float t = uTime;

    // ---- burn front: distance from centre, warped into a ragged ring
    float r = length(uv);
    float rag = fbm(uv * 2.6 + vec2(t * 0.12, -t * 0.18));
    float front = r + (rag - 0.5) * 0.3;

    // ignition starts after the intro, front grows past the corners
    float burn = smoothstep(0.04, 0.6, uProgress);
    float burnR = burn * 1.45;
    float d = front - burnR;              // <0 inside the burn, >0 charred side
    float inside = smoothstep(0.0, -0.05, d);

    // ---- charred surface outside the front
    float grain = fbm(uv * 9.0 + 3.7);
    vec3 charCol = mix(vec3(0.012, 0.009, 0.012), vec3(0.07, 0.06, 0.062), grain);
    // glowing crack veins in the ring just ahead of the front
    float near = smoothstep(0.42, 0.0, d);
    float veins = pow(fbm(uv * 15.0 + vec2(0.0, -t * 0.35)), 4.0);
    charCol += vec3(1.0, 0.3, 0.04) * veins * near * (0.4 + burn * 2.4);
    // carbon darkening right at the char edge
    charCol *= mix(0.3, 1.0, smoothstep(0.0, 0.24, d));

    // ---- inferno inside the hole: turbulence licking upward
    vec2 fp = uv;
    fp.y -= t * 0.85;
    fp.x += uPointer.x * 0.12;
    float warp = fbm(fp * 2.1 + vec2(0.0, -t * 1.35));
    float fl = fbm(fp * 3.3 + vec2(warp * 1.7, 0.0));
    // flames taller toward the bottom of the hole, deeper = hotter
    float depth = clamp((burnR - front) * 1.5, 0.0, 1.0);
    float heat = clamp(fl * (0.5 + 0.75 * depth) - (uv.y + 0.6) * 0.28 + 0.22, 0.0, 1.0);
    vec3 fire = mix(vec3(0.05, 0.0, 0.0), vec3(0.6, 0.05, 0.0), smoothstep(0.0, 0.3, heat));
    fire = mix(fire, vec3(1.0, 0.38, 0.02), smoothstep(0.28, 0.6, heat));
    fire = mix(fire, vec3(1.0, 0.85, 0.32), smoothstep(0.58, 0.85, heat));
    fire = mix(fire, vec3(1.0, 1.0, 0.94), smoothstep(0.85, 1.0, heat));

    // the whole thing burns down near the end so the finale can breathe
    float die = smoothstep(0.8, 1.0, uProgress);
    fire *= 1.0 - die * 0.88;

    vec3 col = mix(charCol, fire, inside);

    // white-hot rim where the front is actively eating
    float rim = smoothstep(0.06, 0.0, abs(d)) * (0.35 + burn);
    col += vec3(1.0, 0.55, 0.15) * rim;
    col += vec3(1.0, 0.9, 0.6) * smoothstep(0.015, 0.0, abs(d)) * burn;

    // ember eye pulsing at the centre before ignition
    float emberEye = exp(-r * 5.0) * (0.35 + 0.3 * sin(t * 2.4)) * (1.0 - burn);
    col += vec3(1.0, 0.4, 0.08) * emberEye;

    // sparks drifting up out of the fire
    float spark = smoothstep(0.985, 1.0, noise(uv * 38.0 + vec2(warp * 3.0, -t * 2.2)));
    col += vec3(1.0, 0.7, 0.25) * spark * (0.25 + inside * 1.4) * (1.0 - die * 0.4);

    // vignette + final fade to embers-in-the-dark
    col *= smoothstep(1.35, 0.35, length(uv));
    col *= 1.0 - die * 0.45;

    gl_FragColor = vec4(col, 1.0);
  }
`

function Burn({ progressRef }) {
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

export default function FireScene({ progressRef, active }) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      style={{ background: '#050308' }}
    >
      <Burn progressRef={progressRef} />
    </Canvas>
  )
}

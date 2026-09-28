import * as THREE from 'three'

// Colours are written straight to the canvas by the custom shaders, so they are
// kept as plain sRGB vectors instead of THREE.Color (which would be linearised).
const rgb = (hex) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255)

const BG = rgb(0x05051c)
const PINK = rgb(0xeb2f5b)
const WARM = rgb(0xffd9b8)
const FOG_DENSITY = 0.012

const SPACING = 2.4
const BLOCK = 5 // every 5th grid row/column is a street

function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const buildingVertex = /* glsl */ `
  attribute float aDelay;
  attribute float aSeed;
  attribute float aAccent;
  uniform float uRise;
  varying vec3 vLocal;
  varying vec3 vScale;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vSeed;
  varying float vAccent;
  varying float vTop;
  varying float vFogDepth;

  void main() {
    float t = clamp((uRise * 1.9 - aDelay) / 0.9, 0.0, 1.0);
    t = 1.0 - pow(1.0 - t, 3.0);

    vec3 p = position;
    p.y *= t;

    vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
    vec4 mv = viewMatrix * world;

    vLocal = position;
    vNormal = normal;
    vWorld = world.xyz;
    vSeed = aSeed;
    vAccent = aAccent;
    vTop = vScale.y * t;
    vFogDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const buildingFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBg;
  uniform vec3 uPink;
  uniform vec3 uWarm;
  uniform float uFog;
  varying vec3 vLocal;
  varying vec3 vScale;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vSeed;
  varying float vAccent;
  varying float vTop;
  varying float vFogDepth;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 base = vec3(0.045, 0.045, 0.14);
    vec3 lightDir = normalize(vec3(0.45, 0.8, 0.35));
    float shade = 0.55 + 0.45 * max(dot(vNormal, lightDir), 0.0);
    vec3 col = base * shade;

    if (vNormal.y > 0.5) {
      // Roof: slightly lighter, with a faint accent rim.
      vec2 e = abs(vLocal.xz) * 2.0;
      float rim = smoothstep(0.86, 1.0, max(e.x, e.y));
      col = base * 1.35 + rim * mix(vec3(0.08, 0.08, 0.2), uPink * 0.9, vAccent);
    } else if (vNormal.y > -0.5) {
      // Facade windows, laid out in world space so they stay put while the tower rises.
      float face = vNormal.x > 0.5 ? 1.0 : vNormal.x < -0.5 ? 2.0 : vNormal.z > 0.5 ? 3.0 : 4.0;
      float u = abs(vNormal.x) > 0.5 ? vLocal.z * vScale.z : vLocal.x * vScale.x;
      vec2 cell = vec2(u / 0.34, vWorld.y / 0.44);
      vec2 id = floor(cell);
      vec2 f = fract(cell);
      float win = step(0.24, f.x) * step(f.x, 0.76) * step(0.26, f.y) * step(f.y, 0.74);
      float h = hash(id + vSeed * 57.0 + face * 13.0);
      float lit = step(0.63, h);
      if (h > 0.975) lit = step(0.5, fract(uTime * 0.12 + h * 17.0));
      lit *= step(0.6, vWorld.y); // no lit windows at street level

      vec3 winCol = mix(uWarm, uPink * 1.25, max(vAccent, step(0.93, fract(h * 7.31))));
      float glow = win * lit * (0.55 + 0.45 * fract(h * 3.7));
      // Far away the grid is smaller than a pixel: fade to its average to avoid shimmer.
      vec2 fw = fwidth(cell);
      glow = mix(glow, 0.075, smoothstep(0.3, 0.75, max(fw.x, fw.y)));
      col = mix(col, winCol, glow);
      col += win * (1.0 - lit) * vec3(0.02, 0.02, 0.06);

      // Rooftop edge highlight and pink street bounce light.
      col += smoothstep(0.12, 0.0, vTop - vWorld.y) * mix(vec3(0.12, 0.12, 0.3), uPink, vAccent) * 0.8;
      col += uPink * exp(-vWorld.y * 1.4) * 0.18;
    }

    float fog = 1.0 - exp(-uFog * uFog * vFogDepth * vFogDepth);
    gl_FragColor = vec4(mix(col, uBg, clamp(fog, 0.0, 1.0)), 1.0);
  }
`

const groundVertex = /* glsl */ `
  varying vec3 vWorld;
  varying float vFogDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * world;
    vWorld = world.xyz;
    vFogDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const groundFragment = /* glsl */ `
  uniform float uTime;
  uniform float uRise;
  uniform vec3 uPink;
  uniform float uFog;
  uniform float uSpacing;
  uniform float uBlock;
  varying vec3 vWorld;
  varying float vFogDepth;

  float street(float c) {
    float period = uSpacing * uBlock;
    float d = abs(fract((c + 2.0 * uSpacing) / period + 0.5) - 0.5) * period;
    return 1.0 - smoothstep(0.02, 0.12, d);
  }

  void main() {
    float lines = max(street(vWorld.x), street(vWorld.z));
    float r = length(vWorld.xz);

    // A "lead ping" that ripples out from the central tower.
    float wave = fract(uTime * 0.18) * 42.0;
    float ping = smoothstep(1.6, 0.0, abs(r - wave)) * (1.0 - wave / 42.0);

    float reveal = smoothstep(uRise * 60.0, uRise * 60.0 - 8.0, r);
    float intensity = lines * (0.28 + ping * 1.6) * reveal;
    intensity += ping * 0.06 * reveal;

    float fog = 1.0 - exp(-uFog * uFog * vFogDepth * vFogDepth);
    gl_FragColor = vec4(uPink, intensity * (1.0 - clamp(fog, 0.0, 1.0)));
  }
`

const particleVertex = /* glsl */ `
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vMix;

  void main() {
    float t = fract(uTime * 0.035 * aSpeed + aOffset);
    vec3 p = position;
    p.y += t * 18.0;
    p.x += sin(uTime * 0.4 + aOffset * 30.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (26.0 / -mv.z);
    vAlpha = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.7, 1.0, t)) * clamp(40.0 / -mv.z, 0.0, 1.0);
    vMix = fract(aOffset * 13.0);
  }
`

const particleFragment = /* glsl */ `
  uniform vec3 uPink;
  varying float vAlpha;
  varying float vMix;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uPink, vec3(1.0, 0.9, 0.95), step(0.7, vMix));
    gl_FragColor = vec4(col, a * vAlpha);
  }
`

const beamFragment = /* glsl */ `
  uniform vec3 uPink;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float core = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0);
    float fade = pow(1.0 - vUv.y, 1.6);
    float pulse = 0.75 + 0.25 * sin(uTime * 2.0 - vUv.y * 12.0);
    gl_FragColor = vec4(mix(uPink, vec3(1.0), core * 0.5), core * fade * pulse * uOpacity);
  }
`

export default class CityScene {
  constructor(canvas, { mobile = false, reducedMotion = false } = {}) {
    this.canvas = canvas
    this.mobile = mobile
    this.reducedMotion = reducedMotion
    this.scroll = 0
    this.pointer = new THREE.Vector2()
    this.pointerSmooth = new THREE.Vector2()
    this.intro = { rise: reducedMotion ? 1 : 0, fly: reducedMotion ? 1 : 0 }
    this.startTime = performance.now()

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75))

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 220)
    this.lookAt = new THREE.Vector3()

    this.buildCity()
    this.buildGround()
    this.buildParticles()
    this.buildBeam()
    this.resize()
  }

  buildCity() {
    const rand = mulberry32(20260428)
    const half = this.mobile ? 11 : 16
    const maxD = half * SPACING * 1.42
    const dummy = new THREE.Object3D()
    const buildings = []

    for (let i = -half; i <= half; i++) {
      for (let j = -half; j <= half; j++) {
        const onStreet = (((i + 2) % BLOCK) + BLOCK) % BLOCK === 0 || (((j + 2) % BLOCK) + BLOCK) % BLOCK === 0
        if (onStreet) continue
        const x = i * SPACING + (rand() - 0.5) * 0.35
        const z = j * SPACING + (rand() - 0.5) * 0.35
        const d = Math.hypot(x, z)
        const falloff = Math.exp(-((d / 15) ** 2)) * 0.85 + 0.15
        const isHero = i === 0 && j === 0
        const height = isHero ? 17 : (0.9 + rand() ** 2.4 * 11) * falloff + 0.5
        buildings.push({
          x,
          z,
          w: isHero ? 2.1 : 1.25 + rand() * 0.65,
          dz: isHero ? 2.1 : 1.25 + rand() * 0.65,
          h: height,
          delay: isHero ? 0 : Math.min(1, (d / maxD) * 0.85 + rand() * 0.15),
          seed: rand(),
          accent: isHero || rand() < 0.07 ? 1 : 0,
        })
      }
    }

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.translate(0, 0.5, 0)
    const delays = new Float32Array(buildings.length)
    const seeds = new Float32Array(buildings.length)
    const accents = new Float32Array(buildings.length)

    this.buildingMaterial = new THREE.ShaderMaterial({
      vertexShader: buildingVertex,
      fragmentShader: buildingFragment,
      uniforms: {
        uTime: { value: 0 },
        uRise: { value: this.intro.rise },
        uBg: { value: BG },
        uPink: { value: PINK },
        uWarm: { value: WARM },
        uFog: { value: FOG_DENSITY },
      },
    })

    const mesh = new THREE.InstancedMesh(geometry, this.buildingMaterial, buildings.length)
    buildings.forEach((b, k) => {
      dummy.position.set(b.x, 0, b.z)
      dummy.scale.set(b.w, b.h, b.dz)
      dummy.updateMatrix()
      mesh.setMatrixAt(k, dummy.matrix)
      delays[k] = b.delay
      seeds[k] = b.seed
      accents[k] = b.accent
    })
    geometry.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delays, 1))
    geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    geometry.setAttribute('aAccent', new THREE.InstancedBufferAttribute(accents, 1))
    mesh.frustumCulled = false
    this.scene.add(mesh)
    this.city = mesh
  }

  buildGround() {
    this.groundMaterial = new THREE.ShaderMaterial({
      vertexShader: groundVertex,
      fragmentShader: groundFragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uRise: { value: this.intro.rise },
        uPink: { value: PINK },
        uFog: { value: FOG_DENSITY },
        uSpacing: { value: SPACING },
        uBlock: { value: BLOCK },
      },
    })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), this.groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0.01
    this.scene.add(ground)
  }

  buildParticles() {
    const count = this.mobile ? 260 : 520
    const rand = mulberry32(7)
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    const offsets = new Float32Array(count)
    const sizes = new Float32Array(count)
    for (let k = 0; k < count; k++) {
      const r = Math.sqrt(rand()) * 34
      const a = rand() * Math.PI * 2
      positions.set([Math.cos(a) * r, rand() * 2, Math.sin(a) * r], k * 3)
      speeds[k] = 0.5 + rand()
      offsets[k] = rand()
      sizes[k] = 1.5 + rand() * 3.5
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uPink: { value: PINK },
      },
    })
    const points = new THREE.Points(geometry, this.particleMaterial)
    points.frustumCulled = false
    this.scene.add(points)
  }

  buildBeam() {
    this.beamMaterial = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: beamFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uPink: { value: PINK }, uTime: { value: 0 }, uOpacity: { value: 0 } },
    })
    const geometry = new THREE.PlaneGeometry(1.1, 28)
    geometry.translate(0, 14, 0)
    // Two crossed planes read as a volumetric beam from any angle.
    this.beam = new THREE.Group()
    for (let k = 0; k < 2; k++) {
      const plane = new THREE.Mesh(geometry, this.beamMaterial)
      plane.rotation.y = (k * Math.PI) / 2
      this.beam.add(plane)
    }
    this.beam.position.y = 17
    this.scene.add(this.beam)
  }

  // 0 at the top of the hero, 1 once it has scrolled out of view.
  setScroll(progress) {
    this.scroll = progress
  }

  setPointer(x, y) {
    this.pointer.set(x, y)
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Pull back on tall, narrow screens so the skyline still fits.
    this.camera.fov = w / h < 0.8 ? 58 : 42
    // Wide screens: shift the skyline right, beside the headline.
    // Tall screens: lift it into the upper half, above the copy.
    this.portrait = w / h < 0.8
    if (w / h > 1.15) this.camera.setViewOffset(w, h, -w * 0.25, 0, w, h)
    else if (this.portrait) this.camera.setViewOffset(w, h, 0, h * 0.24, w, h)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
  }

  updateCamera(time) {
    const ease = (t) => 1 - Math.pow(1 - t, 3)
    const fly = ease(this.intro.fly)
    const s = this.scroll
    const drift = this.reducedMotion ? 0 : time * 0.025

    this.pointerSmooth.lerp(this.pointer, 0.04)
    const angle = -0.55 + drift + this.pointerSmooth.x * 0.12 + (1 - fly) * 0.6
    const radius = (THREE.MathUtils.lerp(92, 62, fly) - s * 14) * (this.portrait ? 0.8 : 1)
    const height = THREE.MathUtils.lerp(48, 12, fly) + s * 34 + this.pointerSmooth.y * 2

    this.camera.position.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius)
    this.lookAt.set(0, THREE.MathUtils.lerp(7.5, 0, s), 0)
    this.camera.lookAt(this.lookAt)
  }

  render() {
    const time = (performance.now() - this.startTime) / 1000
    const animTime = this.reducedMotion ? 0 : time
    this.buildingMaterial.uniforms.uTime.value = animTime
    this.buildingMaterial.uniforms.uRise.value = this.intro.rise
    this.groundMaterial.uniforms.uTime.value = animTime
    this.groundMaterial.uniforms.uRise.value = this.intro.rise
    this.particleMaterial.uniforms.uTime.value = animTime
    this.beamMaterial.uniforms.uTime.value = animTime
    this.beamMaterial.uniforms.uOpacity.value = Math.max(0, this.intro.rise * 1.6 - 0.6)
    this.updateCamera(time)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.scene.traverse((obj) => {
      obj.geometry?.dispose()
      obj.material?.dispose()
    })
    this.renderer.dispose()
  }
}

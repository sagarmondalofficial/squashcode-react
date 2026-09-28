import * as THREE from 'three'

const PINK = new THREE.Vector3(235 / 255, 47 / 255, 91 / 255)

const TOP = 4.2
const BOTTOM = -3.6
const R_TOP = 3.8
const R_BOTTOM = 0.18

// Funnel radius at a normalised depth t (0 = rim, 1 = spout).
const radiusAt = (t) => R_BOTTOM + (R_TOP - R_BOTTOM) * Math.pow(1 - t, 1.7)

const vertex = /* glsl */ `
  attribute float aOffset;
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aJitter;
  attribute float aSize;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vT;
  varying float vAlpha;

  void main() {
    float t = fract(uTime * 0.05 * aSpeed + aOffset);
    float y = mix(${TOP.toFixed(2)}, ${BOTTOM.toFixed(2)}, t);
    float r = ${R_BOTTOM.toFixed(2)} + ${(R_TOP - R_BOTTOM).toFixed(2)} * pow(1.0 - t, 1.7);
    r += aJitter * mix(0.7, 0.03, t);
    float angle = aAngle + t * 12.566 + uTime * 0.15;

    // Once through the spout, leads drop in a tight stream: the site visits.
    float out_ = smoothstep(0.9, 1.0, t);
    y -= out_ * 1.8;

    vec3 p = vec3(cos(angle) * r, y, sin(angle) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (18.0 / -mv.z) * mix(1.0, 1.8, out_);
    vT = t;
    vAlpha = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.96, 1.0, t));
  }
`

const fragment = /* glsl */ `
  uniform vec3 uPink;
  varying float vT;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    vec3 col = mix(vec3(0.72, 0.74, 1.0), uPink, smoothstep(0.25, 0.8, vT));
    col = mix(col, vec3(1.0, 0.85, 0.9), smoothstep(0.9, 1.0, vT));
    gl_FragColor = vec4(col, a * vAlpha * 0.9);
  }
`

export default class FunnelScene {
  constructor(canvas, { mobile = false, reducedMotion = false } = {}) {
    this.canvas = canvas
    this.reducedMotion = reducedMotion
    this.pointer = new THREE.Vector2()
    this.startTime = performance.now()

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    this.camera.position.set(0, 3.2, 15)
    this.camera.lookAt(0, 0, 0)

    this.group = new THREE.Group()
    this.group.rotation.x = 0.12
    this.scene.add(this.group)

    this.buildParticles(mobile ? 1800 : 4200)
    this.buildRings()
    this.buildCore()
    this.resize()
  }

  buildParticles(count) {
    const geometry = new THREE.BufferGeometry()
    const attrs = { aOffset: [], aAngle: [], aSpeed: [], aJitter: [], aSize: [] }
    for (let k = 0; k < count; k++) {
      attrs.aOffset.push(Math.random())
      attrs.aAngle.push(Math.random() * Math.PI * 2)
      attrs.aSpeed.push(0.6 + Math.random() * 0.8)
      attrs.aJitter.push((Math.random() - 0.5) * 2)
      attrs.aSize.push(1 + Math.random() * 2.6)
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    for (const [name, values] of Object.entries(attrs)) {
      geometry.setAttribute(name, new THREE.BufferAttribute(new Float32Array(values), 1))
    }
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uPink: { value: PINK },
      },
    })
    const points = new THREE.Points(geometry, this.material)
    points.frustumCulled = false
    this.group.add(points)
  }

  buildRings() {
    // Faint rings trace the funnel's silhouette.
    for (let k = 0; k <= 6; k++) {
      const t = k / 6
      const r = radiusAt(t)
      const curve = new THREE.EllipseCurve(0, 0, r, r)
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(96))
      geometry.rotateX(Math.PI / 2)
      geometry.translate(0, TOP + (BOTTOM - TOP) * t, 0)
      const material = new THREE.LineBasicMaterial({
        color: k === 0 ? 0xeb2f5b : 0x6b6bb8,
        transparent: true,
        opacity: k === 0 ? 0.55 : 0.14,
      })
      this.group.add(new THREE.LineLoop(geometry, material))
    }
  }

  buildCore() {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.2, 'rgba(255,120,150,0.8)')
    g.addColorStop(1, 'rgba(235,47,91,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    this.core = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    this.core.position.y = BOTTOM - 1.9
    this.core.scale.setScalar(2.4)
    this.group.add(this.core)
  }

  setPointer(x, y) {
    this.pointer.set(x, y)
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  render() {
    const time = this.reducedMotion ? 4 : (performance.now() - this.startTime) / 1000
    this.material.uniforms.uTime.value = time
    this.group.rotation.y += (this.pointer.x * 0.35 - this.group.rotation.y) * 0.04
    this.group.rotation.x += (0.12 + this.pointer.y * 0.12 - this.group.rotation.x) * 0.04
    this.core.scale.setScalar(2.4 + Math.sin(time * 2.2) * 0.25)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.scene.traverse((obj) => {
      obj.geometry?.dispose()
      if (obj.material) {
        obj.material.map?.dispose()
        obj.material.dispose()
      }
    })
    this.renderer.dispose()
  }
}

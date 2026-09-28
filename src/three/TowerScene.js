import * as THREE from 'three'

const FLOORS = 18
const FLOOR_H = 0.56
const PINK = 0xeb2f5b
const NAVY = 0x000033

const easeOut = (t) => 1 - Math.pow(1 - t, 3)

// Glass facade: sky-tinted gradient with white mullions, drawn once on a canvas.
function facadeTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, '#8f96d6')
  g.addColorStop(1, '#3b3f8a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 64)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillRect(0, 6, 256, 14) // sky reflection band
  ctx.fillStyle = '#e9e4f5'
  for (let x = 0; x < 256; x += 64) ctx.fillRect(x, 0, 4, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

export default class TowerScene {
  constructor(canvas, { mobile = false, reducedMotion = false } = {}) {
    this.canvas = canvas
    this.reducedMotion = reducedMotion
    this.progress = reducedMotion ? 1 : 0
    this.shown = this.progress
    this.pointer = new THREE.Vector2()
    this.pointerSmooth = new THREE.Vector2()
    this.startTime = performance.now()

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    this.target = new THREE.Vector3()

    this.buildLights()
    this.buildSite()
    this.buildTower()
    this.buildCrane()
    this.resize()
  }

  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xf3e6dc, 1.6))
    const sun = new THREE.DirectionalLight(0xfff1e2, 2.4)
    sun.position.set(7, 14, 9)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -9
    sun.shadow.camera.right = 9
    sun.shadow.camera.top = 16
    sun.shadow.camera.bottom = -4
    sun.shadow.radius = 6
    sun.shadow.bias = -0.0008
    this.scene.add(sun)
  }

  buildSite() {
    const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.12 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Plot boundary and a faint survey grid.
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.6, 3.66, 96),
      new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.8 })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.005
    this.scene.add(ring)

    const grid = new THREE.GridHelper(14, 28, NAVY, NAVY)
    grid.material.transparent = true
    grid.material.opacity = 0.07
    this.scene.add(grid)

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 0.16, 3.9),
      new THREE.MeshStandardMaterial({ color: 0xf1ece6, roughness: 0.9 })
    )
    base.position.y = 0.08
    base.castShadow = base.receiveShadow = true
    this.scene.add(base)
  }

  buildTower() {
    const facade = facadeTexture()
    const slabMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 })
    const accentMat = new THREE.MeshStandardMaterial({ color: PINK, roughness: 0.5, emissive: PINK, emissiveIntensity: 0.25 })

    this.floors = []
    for (let i = 0; i < FLOORS; i++) {
      // A setback near the top gives the tower a crown.
      const size = i >= FLOORS - 4 ? 2.3 : i >= FLOORS - 8 ? 2.7 : 3.1
      const group = new THREE.Group()

      const glassTex = facade.clone()
      glassTex.repeat.set(size / 1.2, 1)
      glassTex.needsUpdate = true
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(size, FLOOR_H - 0.09, size),
        new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.18, metalness: 0.25 })
      )
      glass.position.y = (FLOOR_H - 0.09) / 2 + 0.09
      const slab = new THREE.Mesh(new THREE.BoxGeometry(size + 0.16, 0.09, size + 0.16), i === 5 ? accentMat : slabMat)
      slab.position.y = 0.045
      for (const m of [glass, slab]) {
        m.castShadow = true
        m.receiveShadow = true
        group.add(m)
      }
      group.userData.baseY = 0.16 + i * FLOOR_H
      group.visible = false
      this.scene.add(group)
      this.floors.push(group)
    }

    // Crown: a pink halo that lights up once the last floor lands.
    this.crown = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.05, 12, 64),
      new THREE.MeshStandardMaterial({ color: PINK, emissive: PINK, emissiveIntensity: 0.9, roughness: 0.4 })
    )
    this.crown.rotation.x = Math.PI / 2
    this.crown.position.y = 0.16 + FLOORS * FLOOR_H + 0.35
    this.crown.scale.setScalar(0.001)
    this.scene.add(this.crown)
  }

  buildCrane() {
    const mat = new THREE.MeshStandardMaterial({ color: PINK, roughness: 0.55 })
    const dark = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.6 })
    this.crane = new THREE.Group()
    this.crane.position.set(-2.6, 0, -2.6)

    this.mast = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), mat)
    this.mast.castShadow = true
    this.crane.add(this.mast)

    this.slew = new THREE.Group() // rotating top: jib, counter-jib, cab, hook
    const jib = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.14, 0.14), mat)
    jib.position.x = 2.2
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.14), mat)
    counter.position.x = -1.2
    const weight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.3), dark)
    weight.position.set(-1.8, -0.22, 0)
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.3), dark)
    cab.position.set(0.25, -0.2, 0)
    const peak = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), mat)
    peak.position.y = 0.45
    for (const m of [jib, counter, weight, cab, peak]) {
      m.castShadow = true
      this.slew.add(m)
    }
    this.cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 6), dark)
    this.hook = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), dark)
    this.slew.add(this.cable, this.hook)
    this.crane.add(this.slew)
    this.scene.add(this.crane)
  }

  // 0 = empty plot, 1 = finished tower.
  setProgress(p) {
    this.progress = THREE.MathUtils.clamp(p, 0, 1)
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
    const time = (performance.now() - this.startTime) / 1000
    this.shown += (this.progress - this.shown) * (this.reducedMotion ? 1 : 0.08)
    const built = this.shown * FLOORS
    let top = 0.16
    let placing = null

    this.floors.forEach((floor, i) => {
      const t = THREE.MathUtils.clamp(built - i, 0, 1)
      floor.visible = t > 0.001
      const e = easeOut(t)
      floor.position.y = floor.userData.baseY + (1 - e) * 2.6
      floor.rotation.y = (1 - e) * 0.5
      if (t > 0 && t < 1) placing = floor
      if (t >= 1) top = floor.userData.baseY + FLOOR_H
    })

    // Crane climbs with the tower and swings toward the floor being placed.
    const craneTop = Math.max(top + 2.2, 4)
    this.mast.scale.y = craneTop
    this.mast.position.y = craneTop / 2
    this.slew.position.y = craneTop
    const swing = placing ? Math.atan2(2.6, 2.6) * -1 + Math.sin(time * 0.8) * 0.05 : -0.2 + Math.sin(time * 0.35) * 0.5
    this.slew.rotation.y += (swing - this.slew.rotation.y) * 0.05

    const reach = 3.65
    const hookY = placing ? placing.position.y + FLOOR_H + 0.1 : top + 1.2
    const hookDrop = Math.max(0.3, craneTop - hookY)
    this.hook.position.set(reach, -hookDrop, 0)
    this.cable.position.set(reach, -hookDrop / 2, 0)
    this.cable.scale.y = hookDrop

    const done = THREE.MathUtils.clamp((built - FLOORS + 0.5) * 2, 0, 1)
    this.crown.scale.setScalar(Math.max(0.001, easeOut(done)))
    this.crown.rotation.z = time * 0.4

    // Camera frames the part of the tower that is currently rising.
    this.pointerSmooth.lerp(this.pointer, 0.05)
    const angle = 0.75 + (this.reducedMotion ? 0 : time * 0.06) + this.pointerSmooth.x * 0.25
    const lookY = THREE.MathUtils.lerp(2.4, 6.4, this.shown)
    const dist = THREE.MathUtils.lerp(17, 29, this.shown) * (this.camera.aspect < 0.9 ? 1.3 : 1)
    this.camera.position.set(Math.sin(angle) * dist, lookY + 3.5 + this.pointerSmooth.y * 1.5, Math.cos(angle) * dist)
    this.target.set(0, lookY, 0)
    this.camera.lookAt(this.target)

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

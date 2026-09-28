import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap'

// Mounts a Three.js scene class on a canvas, renders only while it is on screen,
// and forwards pointer position. `onReady(scene)` may return a cleanup function.
export default function SceneCanvas({ Scene, className, onReady }) {
  const canvasRef = useRef(null)
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  useEffect(() => {
    const canvas = canvasRef.current
    const reducedMotion = prefersReducedMotion()
    let scene
    try {
      scene = new Scene(canvas, { mobile: window.innerWidth < 768, reducedMotion })
    } catch (err) {
      console.warn('WebGL is unavailable, skipping 3D scene.', err)
      return undefined
    }

    const resize = new ResizeObserver(() => {
      scene.resize()
      if (reducedMotion) scene.render()
    })
    resize.observe(canvas)

    // Checked every frame rather than with an IntersectionObserver, which can miss
    // canvases that ScrollTrigger re-parents while pinning.
    let frame = 0
    const loop = () => {
      frame = requestAnimationFrame(loop)
      const r = canvas.getBoundingClientRect()
      if (r.width && r.bottom > -100 && r.top < window.innerHeight + 100) scene.render()
    }
    if (!reducedMotion) frame = requestAnimationFrame(loop)

    const onPointer = (e) => {
      scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const cleanup = onReadyRef.current?.(scene, { reducedMotion })

    return () => {
      cleanup?.()
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('pointermove', onPointer)
      scene.dispose()
    }
  }, [Scene])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

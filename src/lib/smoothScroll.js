import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

let lenis = null

// Scrolls to an in-page anchor, through Lenis when it is running.
export function scrollToHash(hash, { immediate = false } = {}) {
  const target = document.querySelector(hash)
  if (!target) return
  const top = hash === 'body' ? 0 : -70
  if (lenis) lenis.scrollTo(hash === 'body' ? 0 : target, { offset: top, duration: 1.4, immediate })
  else if (hash === 'body') window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
  else target.scrollIntoView({ behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function getLenis() {
  return lenis
}

// Smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in sync.
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenis = null
    }
  }, [])
}

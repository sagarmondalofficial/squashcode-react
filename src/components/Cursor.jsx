import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

// A soft trailing ring that grows over interactive elements (fine pointers only).
export default function Cursor() {
  const ref = useRef(null)

  useGSAP(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const el = ref.current
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })

    const move = (e) => {
      gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' })
      xTo(e.clientX)
      yTo(e.clientY)
      const hot = e.target.closest?.('a, button, [data-cursor], summary, input, select, textarea')
      el.classList.toggle('cursor--hot', Boolean(hot))
    }
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 })
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  })

  return <div ref={ref} className="cursor" aria-hidden="true" />
}

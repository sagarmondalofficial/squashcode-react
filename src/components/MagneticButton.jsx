import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { scrollToHash } from '../lib/smoothScroll'
import Icon from './Icon'

// A button that leans toward the cursor. Renders an <a> when given an href.
export default function MagneticButton({ href, children, variant = 'primary', icon = 'arrow', type, disabled }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const el = ref.current
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
      const move = (e) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.3)
        yTo((e.clientY - r.top - r.height / 2) * 0.4)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    },
    { scope: ref }
  )

  const className = `btn btn--${variant}`
  const content = (
    <>
      <span className="btn__label">{children}</span>
      {icon && (
        <span className="btn__icon">
          <Icon name={icon} size={18} />
        </span>
      )}
    </>
  )

  if (href) {
    const onClick = (e) => {
      if (href.startsWith('#')) {
        e.preventDefault()
        scrollToHash(href)
      }
    }
    return (
      <a ref={ref} href={href} className={className} onClick={onClick}>
        {content}
      </a>
    )
  }
  return (
    <button ref={ref} className={className} type={type} disabled={disabled}>
      {content}
    </button>
  )
}

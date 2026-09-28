import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { useGo } from '../lib/navigation'
import { nav } from '../content'
import MagneticButton from './MagneticButton'

export default function Nav() {
  const ref = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)

  useGSAP(
    () => {
      if (!prefersReducedMotion()) gsap.from('.nav__inner', { y: -40, opacity: 0, duration: 1, delay: 0.6, ease: 'power3.out' })

      // Solid background once scrolled; hide on the way down, reveal on the way up.
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll()
          ref.current.classList.toggle('nav--solid', y > 40)
          ref.current.classList.toggle('nav--hidden', self.direction === 1 && y > 500)
        },
      })
    },
    { scope: ref }
  )

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    const links = menu.querySelectorAll('.mobile-menu__link')
    if (open) {
      gsap.to(menu, { autoAlpha: 1, clipPath: 'circle(150% at 100% 0%)', duration: 0.7, ease: 'power3.inOut' })
      gsap.fromTo(links, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, delay: 0.25, duration: 0.6, ease: 'power3.out' })
    } else {
      gsap.to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.5, ease: 'power3.inOut', onComplete: () => gsap.set(menu, { autoAlpha: 0 }) })
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const navigate = useGo()
  const go = (e, href) => {
    setOpen(false)
    navigate(href, e)
  }

  return (
    <>
      <header ref={ref} className="nav">
        <div className="container nav__inner">
          <a href="/" className="nav__logo" onClick={(e) => go(e, '/')} aria-label="SquashCode home">
            <img className="logo-on-dark" src="/logo-dark.png" alt="SquashCode" width="1033" height="183" />
            <img className="logo-on-light" src="/logo.png" alt="" width="1033" height="183" />
          </a>
          <nav className="nav__links" aria-label="Primary">
            {nav.map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => go(e, item.href)} className="nav__link">
                <span data-text={item.label}>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="nav__cta">
            <MagneticButton href="/#contact" variant="small" icon={null}>
              Book a call
            </MagneticButton>
          </div>
          <button
            className={`nav__burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" aria-hidden={!open}>
        <nav aria-label="Mobile">
          {[...nav, { label: 'Contact', href: '/#contact' }].map((item) => (
            <div key={item.href} className="mobile-menu__row">
              <a href={item.href} className="mobile-menu__link" onClick={(e) => go(e, item.href)} tabIndex={open ? 0 : -1}>
                {item.label}
              </a>
            </div>
          ))}
        </nav>
      </div>
    </>
  )
}

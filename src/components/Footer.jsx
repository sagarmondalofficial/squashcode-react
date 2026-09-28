import { useRef } from 'react'
import { gsap, useGSAP, SplitText } from '../lib/gsap'
import { scrollToHash } from '../lib/smoothScroll'
import { nav } from '../content'
import Icon from './Icon'

export default function Footer() {
  const ref = useRef(null)

  useGSAP(
    () => {
      // Scale the wordmark so it spans the container exactly.
      const mark = ref.current.querySelector('.footer__wordmark')
      const fit = () => {
        mark.style.fontSize = '1000px'
        mark.style.fontSize = `${(1000 * mark.clientWidth * 0.99) / mark.scrollWidth}px`
      }
      fit()
      document.fonts?.ready.then(fit)
      window.addEventListener('resize', fit)

      const split = SplitText.create('.footer__wordmark', { type: 'chars' })
      gsap.from(split.chars, {
        yPercent: 100,
        stagger: 0.04,
        ease: 'power3.out',
        duration: 1,
        scrollTrigger: { trigger: '.footer__wordmark', start: 'top 95%' },
      })
      return () => window.removeEventListener('resize', fit)
    },
    { scope: ref }
  )

  const go = (e, href) => {
    e.preventDefault()
    scrollToHash(href)
  }

  return (
    <footer ref={ref} className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="/logo-dark.png" alt="SquashCode" width="1033" height="183" />
            <p>Digital marketing built for real estate — from first ad to final site visit.</p>
          </div>
          <nav className="footer__nav" aria-label="Footer">
            {[...nav, { label: 'Contact', href: '#contact' }].map((item) => (
              <a key={item.href} href={item.href} onClick={(e) => go(e, item.href)}>
                {item.label}
              </a>
            ))}
          </nav>
          <button className="footer__top-btn" onClick={() => scrollToHash('#home')} aria-label="Back to top">
            <Icon name="arrowUp" size={20} />
          </button>
        </div>
        <div className="footer__wordmark" aria-hidden="true">
          SquashCode
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} SquashCode. All rights reserved.</span>
          <span>Digital marketing for real estate</span>
        </div>
      </div>
    </footer>
  )
}

import { useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { faq } from '../content'
import Icon from '../components/Icon'
import SectionHeading from '../components/SectionHeading'
import MagneticButton from '../components/MagneticButton'

function Item({ q, a, open, onToggle, id }) {
  const bodyRef = useRef(null)

  useGSAP(
    () => {
      gsap.to(bodyRef.current, {
        height: open ? 'auto' : 0,
        opacity: open ? 1 : 0,
        duration: prefersReducedMotion() ? 0 : 0.55,
        ease: 'power3.inOut',
        // The page got taller or shorter, so later scroll triggers need new positions.
        onComplete: () => ScrollTrigger.refresh(),
      })
    },
    { dependencies: [open] }
  )

  return (
    <div className={`faq__item ${open ? 'is-open' : ''}`}>
      <h3>
        <button className="faq__q" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
          <span>{q}</span>
          <span className="faq__icon">
            <Icon name="plus" size={20} />
          </span>
        </button>
      </h3>
      <div ref={bodyRef} className="faq__a" id={`${id}-a`} role="region" aria-labelledby={`${id}-q`} style={{ height: 0, opacity: 0 }}>
        <p>{a}</p>
      </div>
    </div>
  )
}

export default function Faq() {
  const [open, setOpen] = useState(0)
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.faq__item', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.faq__list', start: 'top 85%' },
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section faq" id="faq">
      <div className="container faq__grid">
        <div className="faq__intro">
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Questions, <em>answered.</em>
              </>
            }
            sub="Still wondering if we are the right fit? Book a call and we will walk through your project together."
          />
          <MagneticButton href="#contact">Talk to us</MagneticButton>
        </div>
        <div className="faq__list">
          {faq.map((item, k) => (
            <Item key={item.q} id={`faq-${k}`} {...item} open={open === k} onToggle={() => setOpen(open === k ? -1 : k)} />
          ))}
        </div>
      </div>
    </section>
  )
}

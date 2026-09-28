import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { services } from '../content'
import Icon from '../components/Icon'
import SectionHeading from '../components/SectionHeading'

export default function Services() {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.set('.service', { y: 70, opacity: 0 })
      ScrollTrigger.batch('.service', {
        start: 'top 90%',
        once: true,
        onEnter: (cards) => gsap.to(cards, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power3.out' }),
      })
    },
    { scope: ref }
  )

  // Spotlight + tilt follow the pointer via CSS custom properties.
  const onMove = (e) => {
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    card.style.setProperty('--mx', `${x * 100}%`)
    card.style.setProperty('--my', `${y * 100}%`)
    gsap.to(card, { rotateY: (x - 0.5) * 8, rotateX: (0.5 - y) * 8, duration: 0.5, ease: 'power2.out' })
  }
  const onLeave = (e) => gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })

  return (
    <section ref={ref} className="section services" id="services">
      <div className="container">
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Everything it takes to <em>move inventory.</em>
            </>
          }
          sub="One team for ads, funnels, automation and creative — so nothing gets lost between the click and the site visit."
        />
        <div className="services__grid">
          {services.map((s, k) => (
            <article className="service" key={s.title} onPointerMove={onMove} onPointerLeave={onLeave}>
              <div className="service__head">
                <span className="service__icon">
                  <Icon name={s.icon} size={26} />
                </span>
                <span className="service__num">{String(k + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="service__title">{s.title}</h3>
              <p className="service__body">{s.body}</p>
              <ul className="service__tags">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

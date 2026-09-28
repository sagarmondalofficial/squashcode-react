import { useRef } from 'react'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '../lib/gsap'
import { marquee } from '../content'

function Row({ items, reverse }) {
  // Two copies side by side so a -50% shift loops seamlessly.
  return (
    <div className={`marquee__row ${reverse ? 'marquee__row--reverse' : ''}`}>
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy} aria-hidden={copy === 1}>
            {items.map((item) => (
              <span className="marquee__item" key={item}>
                {item}
                <span className="marquee__sep" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const loops = gsap.utils.toArray('.marquee__row', ref.current).map((row, k) =>
        gsap.fromTo(
          row.querySelector('.marquee__track'),
          { xPercent: k ? -50 : 0 },
          { xPercent: k ? 0 : -50, duration: 38, ease: 'none', repeat: -1 }
        )
      )
      // Start deep into the repeats so the loops can also run backwards.
      loops.forEach((loop) => loop.totalTime(loop.duration() * 200))

      // Scrolling speeds the loops up and flips their direction with the scroll.
      let direction = 1
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          if (self.direction !== direction) direction = self.direction
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6)
          loops.forEach((loop) => {
            gsap.to(loop, { timeScale: boost * direction, duration: 0.2, overwrite: true })
            gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.25, ease: 'power2.out' })
          })
        },
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="marquee" aria-label="What we do">
      <Row items={marquee} />
      <Row items={[...marquee].reverse()} reverse />
    </section>
  )
}

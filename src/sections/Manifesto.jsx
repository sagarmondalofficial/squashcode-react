import { useRef } from 'react'
import { gsap, useGSAP, SplitText, prefersReducedMotion } from '../lib/gsap'
import { manifesto } from '../content'
import Icon from '../components/Icon'

const pillars = ['Built only for real estate', 'In-house creative studio', 'Tracked from click to site visit']

export default function Manifesto() {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Words light up one by one as the paragraph scrolls through the viewport.
      const split = SplitText.create('.manifesto__text', { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
        }
      )
      gsap.from('.manifesto__pillar', {
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.manifesto__pillars', start: 'top 88%' },
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section manifesto" id="about">
      <div className="container">
        <p className="eyebrow">Why SquashCode</p>
        <p className="manifesto__text">{manifesto}</p>
        <ul className="manifesto__pillars">
          {pillars.map((p) => (
            <li className="manifesto__pillar" key={p}>
              <Icon name="check" size={18} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

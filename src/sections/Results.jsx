import { lazy, Suspense, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { results } from '../content'
import SectionHeading from '../components/SectionHeading'

const FunnelCanvas = lazy(() => import('../three/FunnelCanvas'))

const format = (value, decimals = 0) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export default function Results() {
  const ref = useRef(null)

  useGSAP(
    () => {
      const reduced = prefersReducedMotion()
      gsap.utils.toArray('.stat').forEach((el, k) => {
        const { value, decimals = 0 } = results.stats[k]
        const out = el.querySelector('.stat__value')
        if (reduced) return
        const counter = { v: 0 }
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } })
          .from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', delay: k * 0.08 })
          .to(
            counter,
            {
              v: value,
              duration: 2,
              ease: 'power3.out',
              onUpdate: () => (out.textContent = format(counter.v, decimals)),
            },
            '<0.1'
          )
      })
      if (!reduced) {
        gsap.from('.results__label', {
          x: -20,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          scrollTrigger: { trigger: '.results__visual', start: 'top 70%' },
        })
      }
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section results" id="results">
      <div className="container results__grid">
        <div className="results__visual">
          <Suspense fallback={null}>
            <FunnelCanvas className="results__canvas" />
          </Suspense>
          <span className="results__label results__label--top">Audience</span>
          <span className="results__label results__label--mid">Qualified leads</span>
          <span className="results__label results__label--bottom">Site visits</span>
        </div>
        <div className="results__copy">
          <SectionHeading eyebrow="Results" title={results.title} sub={results.sub} />
          <div className="results__stats">
            {results.stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="stat__figure">
                  {s.prefix}
                  <span className="stat__value">{format(s.value, s.decimals)}</span>
                  {s.suffix}
                </div>
                <p className="stat__label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

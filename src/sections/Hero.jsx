import { lazy, Suspense, useRef } from 'react'
import { gsap, useGSAP, SplitText, prefersReducedMotion } from '../lib/gsap'
import { hero } from '../content'
import MagneticButton from '../components/MagneticButton'

const CityCanvas = lazy(() => import('../three/CityCanvas'))

export default function Hero() {
  const ref = useRef(null)
  const sceneRef = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      // autoSplit re-splits once web fonts load or the width changes, keeping line masks accurate.
      SplitText.create('.hero__title', {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.words, { yPercent: 110, duration: 1.1, stagger: 0.06, delay: 0.6, ease: 'power4.out' }),
      })
      gsap
        .timeline({ delay: 0.35 })
        .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from('.hero__sub', { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out' }, 0.9)
        .from('.hero__ctas > *', { y: 24, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, 1.1)
        .from('.hero__foot > *', { opacity: 0, y: 12, stagger: 0.1, duration: 0.8 }, 1.4)

      // Pin the hero while the camera climbs above the city and the copy drifts away.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: '+=80%',
            pin: true,
            scrub: true,
            onUpdate: (self) => sceneRef.current?.setScroll(self.progress),
          },
        })
        .to('.hero__content', { y: -120, opacity: 0, ease: 'none' }, 0)
        .to('.hero__foot', { opacity: 0, ease: 'none', duration: 0.4 }, 0)
        .to('.hero__shade', { opacity: 0.55, ease: 'none', duration: 0.5 }, 0.5)
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="hero" id="home">
      <div className="hero__stage">
        <Suspense fallback={null}>
          <CityCanvas sceneRef={sceneRef} className="hero__canvas" />
        </Suspense>
        <div className="hero__vignette" />
        <div className="hero__shade" />
      </div>

      <div className="container hero__content">
        <p className="hero__eyebrow eyebrow">
          <span className="pulse-dot" />
          {hero.eyebrow}
        </p>
        <h1 className="hero__title">
          {hero.title} <em>{hero.highlight}</em>
        </h1>
        <p className="hero__sub">{hero.sub}</p>
        <div className="hero__ctas">
          <MagneticButton href={hero.primary.href}>{hero.primary.label}</MagneticButton>
          <MagneticButton href={hero.secondary.href} variant="ghost" icon={null}>
            {hero.secondary.label}
          </MagneticButton>
        </div>
      </div>

      <div className="container hero__foot">
        <div className="hero__scroll">
          <span className="hero__scroll-line" />
          Scroll to explore
        </div>
        <p className="hero__for">For developers · brokers · channel partners</p>
      </div>
    </section>
  )
}

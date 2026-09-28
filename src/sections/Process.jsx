import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { process } from '../content'
import Icon from '../components/Icon'
import SectionHeading from '../components/SectionHeading'

export default function Process() {
  const ref = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Wide screens: pin the section and scroll the steps sideways.
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const track = ref.current.querySelector('.process__track')
        const distance = () => track.scrollWidth - track.parentElement.clientWidth
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.process__pin',
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        gsap.to('.process__bar-fill', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.process__pin', start: 'top top', end: () => `+=${distance()}`, scrub: true },
        })
        gsap.from('.step', {
          x: 160,
          opacity: 0,
          stagger: 0.1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.process__pin', start: 'top 65%' },
        })
        // Step numbers drift against the scroll for a touch of depth.
        gsap.utils.toArray('.step').forEach((step) => {
          gsap.fromTo(
            step.querySelector('.step__num'),
            { xPercent: 30 },
            {
              xPercent: -30,
              ease: 'none',
              scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
            }
          )
        })
      })

      // Narrow screens: a simple vertical stack that fades in.
      mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.step').forEach((step) => {
          gsap.from(step, { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 88%' } })
        })
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="process" id="process">
      <div className="process__pin">
        <div className="container process__head">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                From first ad to <em>site visit</em> in four moves.
              </>
            }
          />
          <div className="process__bar" aria-hidden="true">
            <span className="process__bar-fill" />
          </div>
        </div>
        <div className="process__viewport">
          <div className="process__track">
            {process.map((s) => (
              <article className="step" key={s.step}>
                <span className="step__num">{s.step}</span>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__body">{s.body}</p>
                <ul className="step__points">
                  {s.points.map((p) => (
                    <li key={p}>
                      <Icon name="check" size={16} />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

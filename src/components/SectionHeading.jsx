import { useRef } from 'react'
import { gsap, useGSAP, SplitText, prefersReducedMotion } from '../lib/gsap'

export default function SectionHeading({ eyebrow, title, sub, align = 'left' }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      SplitText.create('.heading__title', {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.words, {
            yPercent: 110,
            stagger: 0.04,
            duration: 1,
            ease: 'power4.out',
            scrollTrigger: { trigger: ref.current, start: 'top 85%' },
          }),
      })
      gsap.from(['.eyebrow', '.heading__sub'], {
        y: 20,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%' },
      })
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={`heading heading--${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="heading__title">{title}</h2>
      {sub && <p className="heading__sub">{sub}</p>}
    </div>
  )
}

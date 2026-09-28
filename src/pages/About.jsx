import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { gsap, useGSAP, ScrollTrigger, SplitText, prefersReducedMotion } from '../lib/gsap'
import { aboutHero, chapters, values, week, difference, aboutClosing } from '../aboutContent'
import MagneticButton from '../components/MagneticButton'
import SectionHeading from '../components/SectionHeading'
import '../styles/about.css'

const TowerCanvas = lazy(() => import('../three/TowerCanvas'))

const FLOORS = 18

// The About page uses the light theme; the rest of the site stays dark.
function useLightTheme() {
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = 'light'
    return () => delete root.dataset.theme
  }, [])
}

function Story() {
  const ref = useRef(null)
  const sceneRef = useRef(null)
  const floorRef = useRef(null)
  const [active, setActive] = useState(-1)

  useGSAP(
    () => {
      const reduced = prefersReducedMotion()

      // Scroll progress through the story builds the tower.
      ScrollTrigger.create({
        trigger: '.story__text',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = reduced ? 1 : 0.05 + self.progress * 0.95
          sceneRef.current?.setProgress(p)
          if (floorRef.current) floorRef.current.textContent = String(Math.round(p * FLOORS)).padStart(2, '0')
        },
      })

      gsap.utils.toArray('.chapter').forEach((chapter, i) => {
        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 60%',
          end: 'bottom 40%',
          onToggle: (self) => self.isActive && setActive(i),
          onLeaveBack: () => i === 0 && setActive(-1),
        })
        if (reduced) return
        gsap.from(chapter.querySelectorAll('.chapter__label, .chapter__title, .chapter__body'), {
          y: 50,
          opacity: 0,
          stagger: 0.12,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: chapter, start: 'top 75%' },
        })
      })

      if (reduced) return
      SplitText.create('.about-hero__title', {
        type: 'lines,words',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.words, { yPercent: 110, stagger: 0.05, duration: 1.1, delay: 0.3, ease: 'power4.out' }),
      })
      gsap.from(['.about-hero .eyebrow', '.about-hero__sub', '.about-hero__hint', '.story__hud'], {
        y: 24,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        delay: 0.8,
        ease: 'power3.out',
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="story">
      <div className="story__stage">
        <Suspense fallback={null}>
          <TowerCanvas sceneRef={sceneRef} className="story__canvas" />
        </Suspense>
        <div className="story__hud" aria-hidden="true">
          <span className="story__floor">
            Floor <b ref={floorRef}>01</b> / {FLOORS}
          </span>
          <span className="story__chapter">{active >= 0 ? chapters[active].label : 'Breaking ground'}</span>
        </div>
      </div>

      <div className="story__text">
        <header className="about-hero">
          <p className="eyebrow">{aboutHero.eyebrow}</p>
          <h1 className="about-hero__title">
            {aboutHero.title} <em>{aboutHero.highlight}</em>
          </h1>
          <p className="about-hero__sub">{aboutHero.sub}</p>
          <p className="about-hero__hint">
            <span className="about-hero__hint-line" /> Scroll to build the story
          </p>
        </header>

        {chapters.map((c, i) => (
          <article className={`chapter ${active === i ? 'is-active' : ''}`} key={c.title}>
            <p className="chapter__label">
              <span>Chapter {String(i + 1).padStart(2, '0')}</span> — {c.label}
            </p>
            <h2 className="chapter__title">{c.title}</h2>
            <p className="chapter__body">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Values() {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Each card settles back into the stack as the next one slides over it.
      const cards = gsap.utils.toArray('.value')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.to(card, {
          scale: 0.93,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true },
        })
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section values">
      <div className="container values__grid">
        <div className="values__intro">
          <SectionHeading
            eyebrow="What we believe"
            title={
              <>
                Five promises we <em>keep to ourselves.</em>
              </>
            }
            sub="Not a poster on the wall — the rules we actually use to make decisions when a campaign, a client or a deadline gets hard."
          />
        </div>
        <div className="values__stack">
          {values.map((v, i) => (
            <article className="value" key={v.title} style={{ '--i': i }}>
              <span className="value__num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="value__title">{v.title}</h3>
                <p className="value__body">{v.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Week() {
  const ref = useRef(null)
  const today = new Date().getDay() // 0 = Sunday
  const todayIndex = today >= 1 && today <= 5 ? today - 1 : -1

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.day', {
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.week__days', start: 'top 85%' },
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section week">
      <div className="container">
        <SectionHeading
          eyebrow="Culture"
          title={
            <>
              A week <em>inside.</em>
            </>
          }
          sub={
            todayIndex >= 0
              ? `It’s ${new Date().toLocaleDateString('en-IN', { weekday: 'long' })}, so right now we’re probably doing this:`
              : 'It’s the weekend, so we’re mostly offline. Here’s what the week looks like:'
          }
        />
        <ol className="week__days">
          {week.map((d, i) => (
            <li className={`day ${i === todayIndex ? 'is-today' : ''}`} key={d.day}>
              <span className="day__name">{d.day}</span>
              {i === todayIndex && <span className="day__now">Today</span>}
              <h3 className="day__title">{d.title}</h3>
              <p className="day__body">{d.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Difference() {
  const ref = useRef(null)
  const [ours, setOurs] = useState(false)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.diff__row', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.diff__table', start: 'top 85%' },
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section diff">
      <div className="container">
        <div className="diff__head">
          <SectionHeading eyebrow="Our approach" title={difference.title} sub={difference.sub} />
          <div className="diff__toggle" role="group" aria-label="Compare approaches">
            <button className={!ours ? 'is-on' : ''} onClick={() => setOurs(false)} aria-pressed={!ours}>
              Typical agency
            </button>
            <button className={ours ? 'is-on' : ''} onClick={() => setOurs(true)} aria-pressed={ours}>
              SquashCode
            </button>
            <span className={`diff__thumb ${ours ? 'is-right' : ''}`} aria-hidden="true" />
          </div>
        </div>
        <div className={`diff__table ${ours ? 'is-ours' : ''}`} aria-live="polite">
          {difference.rows.map((r) => (
            <div className="diff__row" key={r.topic}>
              <span className="diff__topic">{r.topic}</span>
              <span className="diff__cell">
                <span className="diff__text diff__text--typical" aria-hidden={ours}>
                  {r.typical}
                </span>
                <span className="diff__text diff__text--ours" aria-hidden={!ours}>
                  {r.ours}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Closing() {
  const ref = useRef(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      SplitText.create('.about-close__title', {
        type: 'lines,chars',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 110,
            stagger: 0.02,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: { trigger: '.about-close__title', start: 'top 85%' },
          }),
      })
      gsap.to('.about-close__badge', {
        rotate: 360,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    },
    { scope: ref }
  )

  return (
    <section ref={ref} className="section about-close">
      <div className="container about-close__inner">
        <img className="about-close__badge" src="/apple-touch-icon.png" alt="" width="180" height="180" />
        <h2 className="about-close__title">{aboutClosing.title}</h2>
        <p className="about-close__sub">{aboutClosing.sub}</p>
        <div className="about-close__ctas">
          <MagneticButton href={aboutClosing.primary.href}>{aboutClosing.primary.label}</MagneticButton>
          <MagneticButton href={aboutClosing.secondary.href} variant="ghost" icon={null}>
            {aboutClosing.secondary.label}
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  useLightTheme()

  return (
    <div className="about">
      <Story />
      <Values />
      <Week />
      <Difference />
      <Closing />
    </div>
  )
}

import { useRef, useState } from 'react'
import { gsap, useGSAP, SplitText, prefersReducedMotion } from '../lib/gsap'
import { contact } from '../content'
import MagneticButton from '../components/MagneticButton'

const encode = (data) => new URLSearchParams(data).toString()

export default function Contact() {
  const ref = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      SplitText.create('.contact__title', {
        type: 'lines,chars',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 110,
            stagger: 0.015,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: { trigger: '.contact__title', start: 'top 85%' },
          }),
      })
      gsap.from('.contact__form', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__form', start: 'top 90%' },
      })
      gsap.to('.contact__glow', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    },
    { scope: ref }
  )

  // Submissions go to Netlify Forms (see the static form stub in index.html).
  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...Object.fromEntries(new FormData(form)) }),
      })
      if (!res.ok) throw new Error(`Form submission failed: ${res.status}`)
      form.reset()
      setStatus('sent')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <section ref={ref} className="section contact" id="contact">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container contact__grid">
        <div className="contact__copy">
          <p className="eyebrow">Start a project</p>
          <h2 className="contact__title">{contact.title}</h2>
          <p className="contact__sub">{contact.sub}</p>
          <ul className="contact__list">
            <li>Free audit of your current ads and funnel</li>
            <li>Channel plan and budget for your project</li>
            <li>Clear next steps, whatever you decide</li>
          </ul>
        </div>

        <form className="contact__form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit}>
          <input type="hidden" name="form-name" value="contact" />
          <p hidden>
            <label>
              Don’t fill this out: <input name="bot-field" />
            </label>
          </p>
          <div className="field">
            <input id="f-name" name="name" required placeholder=" " autoComplete="name" />
            <label htmlFor="f-name">Your name</label>
          </div>
          <div className="field-row">
            <div className="field">
              <input id="f-phone" name="phone" type="tel" required placeholder=" " autoComplete="tel" />
              <label htmlFor="f-phone">Phone</label>
            </div>
            <div className="field">
              <input id="f-email" name="email" type="email" placeholder=" " autoComplete="email" />
              <label htmlFor="f-email">Email</label>
            </div>
          </div>
          <div className="field">
            <input id="f-company" name="company" placeholder=" " autoComplete="organization" />
            <label htmlFor="f-company">Company / project name</label>
          </div>
          <div className="field">
            <select id="f-budget" name="budget" defaultValue="" required>
              <option value="" disabled>
                Select a range
              </option>
              {contact.budgets.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <label htmlFor="f-budget" className="is-fixed">
              Monthly ad budget
            </label>
          </div>
          <div className="field">
            <textarea id="f-message" name="message" rows="3" placeholder=" " />
            <label htmlFor="f-message">Tell us about the project</label>
          </div>
          <MagneticButton type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Get my free audit'}
          </MagneticButton>
          <p className={`contact__status contact__status--${status}`} role="status" aria-live="polite">
            {status === 'sent' && 'Thanks! We will be in touch shortly.'}
            {status === 'error' && 'Something went wrong. Please try again in a moment.'}
          </p>
        </form>
      </div>
    </section>
  )
}

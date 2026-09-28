# SquashCode — Website

Marketing site for SquashCode, a digital marketing agency for real estate.
Built with React + Vite, Three.js for the 3D scenes and GSAP (ScrollTrigger, SplitText) with Lenis for motion.

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build   # outputs dist/
```

Netlify builds and publishes `dist/` via `netlify.toml`, which also rewrites every path to `index.html` for client-side routing.

## Structure

```
src/
  content.js          All home-page copy, services, process steps, stats and FAQ
  pages/Home.jsx      Section order for the home page
  sections/           Hero, Marquee, Manifesto, Services, Process, Results, Faq, Contact
  components/         Nav, Footer, MagneticButton, Cursor, SectionHeading, Icon
  three/
    CityScene.js      Hero: procedural night city (instanced buildings, shader windows, street grid, beacon)
    FunnelScene.js    Results: particle "lead funnel"
    SceneCanvas.jsx   Mounts a scene, renders only while on screen, forwards pointer
  lib/                GSAP plugin registration and Lenis smooth scroll
  styles/global.css   Design tokens and all styles
public/               Logo (light + dark-background variant), favicon
```

Three.js is loaded lazily, so text and layout render before the 3D chunk arrives.
Visitors with "reduce motion" enabled get static scenes and no scroll animation.

## Contact form

The form in `sections/Contact.jsx` posts to [Netlify Forms](https://docs.netlify.com/forms/setup/).
A hidden copy of the form in `index.html` lets Netlify detect it at deploy time — keep the field names in sync if you change them.
Submissions appear under **Forms** in the Netlify dashboard.

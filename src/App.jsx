import { lazy, Suspense, useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Cursor from './components/Cursor'
import Home from './pages/Home'
import { useSmoothScroll, scrollToHash } from './lib/smoothScroll'
import { ScrollTrigger } from './lib/gsap'

const About = lazy(() => import('./pages/About'))

// On navigation: jump to the top (or the requested anchor) and re-measure scroll triggers.
function useRouteScroll() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    scrollToHash('body', { immediate: true })
    const id = setTimeout(() => {
      ScrollTrigger.refresh()
      if (hash) scrollToHash(hash)
    }, 120)
    return () => clearTimeout(id)
  }, [pathname, hash])
}

export default function App() {
  useSmoothScroll()
  useRouteScroll()

  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

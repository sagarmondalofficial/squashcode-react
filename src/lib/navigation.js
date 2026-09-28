import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToHash } from './smoothScroll'

// Handles in-page anchors ("#faq"), cross-page anchors ("/#faq") and routes ("/about").
export function useGo() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback(
    (href, e) => {
      if (!href || /^(https?:|mailto:|tel:)/.test(href)) return
      e?.preventDefault()
      const [path, hash] = href.split('#')
      const target = path || pathname
      if (target === pathname) {
        if (hash) scrollToHash(`#${hash}`)
        else scrollToHash('body')
      } else {
        navigate(hash ? `${target}#${hash}` : target)
      }
    },
    [navigate, pathname]
  )
}

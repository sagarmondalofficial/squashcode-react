import SceneCanvas from './SceneCanvas'
import CityScene from './CityScene'
import { gsap } from '../lib/gsap'

export default function CityCanvas({ sceneRef, className }) {
  return (
    <SceneCanvas
      Scene={CityScene}
      className={className}
      onReady={(scene, { reducedMotion }) => {
        sceneRef.current = scene
        if (reducedMotion) return () => (sceneRef.current = null)

        gsap.to(scene.intro, { rise: 1, duration: 3.4, delay: 0.15, ease: 'power2.out' })
        gsap.to(scene.intro, { fly: 1, duration: 4, ease: 'power3.out' })
        return () => {
          gsap.killTweensOf(scene.intro)
          sceneRef.current = null
        }
      }}
    />
  )
}

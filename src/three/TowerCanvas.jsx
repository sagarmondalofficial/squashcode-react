import SceneCanvas from './SceneCanvas'
import TowerScene from './TowerScene'

export default function TowerCanvas({ sceneRef, className }) {
  return (
    <SceneCanvas
      Scene={TowerScene}
      className={className}
      onReady={(scene) => {
        sceneRef.current = scene
        scene.setProgress(0.05)
        return () => (sceneRef.current = null)
      }}
    />
  )
}

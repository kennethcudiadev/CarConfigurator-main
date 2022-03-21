import { useState, useCallback, useRef } from 'react'
import { Scene } from './components/Scene'
import { ConfiguratorUI } from './components/ConfiguratorUI'
import { LoadingPage } from './components/LoadingPage'

const defaultConfig = {
  partColors: {},
}

export default function App() {
  const [config, setConfig] = useState(defaultConfig)
  const [rotationY, setRotationY] = useState(0)
  const [colorPanelPart, setColorPanelPart] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  const pointerPosRef = useRef({ x: 0, y: 0 })

  const onConfigChange = useCallback((updater) => {
    setConfig((c) => (typeof updater === 'function' ? updater(c) : updater))
  }, [])

  const openColorPanel = useCallback((meshName) => {
    setPopupPosition(pointerPosRef.current)
    setColorPanelPart(meshName)
  }, [])
  const closeColorPanel = useCallback(() => setColorPanelPart(null), [])

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={(e) => { pointerPosRef.current = { x: e.clientX, y: e.clientY } }}
    >
      <LoadingPage loaded={loaded} />
      <Scene config={config} rotationY={rotationY} onPartClick={openColorPanel} onLoaded={() => setLoaded(true)} />
      <ConfiguratorUI
        config={config}
        onConfigChange={onConfigChange}
        colorPanelPart={colorPanelPart}
        popupPosition={popupPosition}
        onCloseColorPanel={closeColorPanel}
      />
    </div>
  )
}

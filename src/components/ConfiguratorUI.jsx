import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ColorPicker } from './ColorPicker'

const POPUP_OFFSET = 20
const POPUP_WIDTH = 240
const POPUP_HEIGHT = 280

function clampPopupPosition(x, y) {
  if (typeof window === 'undefined') return { left: x, top: y }
  return {
    left: Math.max(POPUP_OFFSET, Math.min(x, window.innerWidth - POPUP_WIDTH - POPUP_OFFSET)),
    top: Math.max(POPUP_OFFSET, Math.min(y, window.innerHeight - POPUP_HEIGHT - POPUP_OFFSET)),
  }
}

export function ConfiguratorUI({ config, onConfigChange, colorPanelPart, popupPosition, onCloseColorPanel }) {
  const popupRef = useRef(null)

  useEffect(() => {
    if (!popupRef.current || !colorPanelPart) return
    gsap.fromTo(
      popupRef.current,
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' }
    )
  }, [colorPanelPart])

  useEffect(() => {
    if (!colorPanelPart) return
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onCloseColorPanel()
      }
    }
    const handlePointerUpInPanel = (e) => {
      if (popupRef.current && popupRef.current.contains(e.target)) {
        onCloseColorPanel()
      }
    }
    const t = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside)
      document.addEventListener('pointerup', handlePointerUpInPanel)
    }, 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('pointerup', handlePointerUpInPanel)
    }
  }, [colorPanelPart, onCloseColorPanel])

  const partColors = config.partColors || {}
  const initialColor = colorPanelPart ? (partColors[colorPanelPart] || '#1a1a1a') : '#1a1a1a'
  const [pickingColor, setPickingColor] = useState(initialColor)
  const popupPos = clampPopupPosition(popupPosition.x + POPUP_OFFSET, popupPosition.y + POPUP_OFFSET)

  useEffect(() => {
    if (colorPanelPart) setPickingColor(partColors[colorPanelPart] || '#1a1a1a')
  }, [colorPanelPart])

  if (!colorPanelPart) return null

  const handleColorChange = (hex) => {
    setPickingColor(hex)
    onConfigChange((c) => ({
      ...c,
      partColors: { ...(c.partColors || {}), [colorPanelPart]: hex },
    }))
  }

  return (
    <div
      ref={popupRef}
      className="color-popup"
      style={{
        position: 'fixed',
        left: popupPos.left,
        top: popupPos.top,
        zIndex: 1000,
        width: 220,
        padding: 14,
        background: 'var(--panel)',
        borderRadius: 12,
        border: '1px solid var(--panel-border)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--accent)',
          marginBottom: 10,
        }}
      >
        {colorPanelPart}
      </div>
      <ColorPicker value={pickingColor} onChange={handleColorChange} />
    </div>
  )
}

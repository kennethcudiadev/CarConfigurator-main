import { useRef, useState, useCallback, useEffect } from 'react'

function hexToRgb(hex) {
  const m = hex.replace(/^#/, '').match(/^([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/)
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 }
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, v = max
  const d = max - min
  s = max === 0 ? 0 : d / max
  if (max === min) h = 0
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, v: v * 100 }
}

function hsvToRgb(h, s, v) {
  s /= 100; v /= 100
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  let r, g, b
  switch (i) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    default: r = v; g = p; b = q
  }
  return { r: r * 255, g: g * 255, b: b * 255 }
}

const HUE_STOPS = 'red 0%, yellow 17%, lime 33%, cyan 50%, blue 67%, magenta 83%, red 100%'

export function ColorPicker({ value, onChange }) {
  const rgb = hexToRgb(value || '#000000')
  const [hsv, setHsv] = useState(() => rgbToHsv(rgb.r, rgb.g, rgb.b))
  const svAreaRef = useRef(null)
  const hueStripRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const isInitialMount = useRef(true)

  const syncFromHex = useCallback((hex) => {
    const r = hexToRgb(hex)
    setHsv(rgbToHsv(r.r, r.g, r.b))
  }, [])

  useEffect(() => {
    syncFromHex(value)
    isInitialMount.current = true
  }, [value, syncFromHex])

  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
  const { r, g, b } = currentRgb
  const currentHex = rgbToHex(r, g, b)
  const hueColor = rgbToHex(...Object.values(hsvToRgb(hsv.h, 100, 100)))

  const updateFromSv = useCallback((clientX, clientY) => {
    const el = svAreaRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    setHsv((prev) => ({ ...prev, s: x * 100, v: y * 100 }))
  }, [])

  const updateFromHue = useCallback((clientX) => {
    const el = hueStripRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setHsv((prev) => ({ ...prev, h: x * 360 }))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      if (dragging === 'sv') updateFromSv(e.clientX, e.clientY)
      else if (dragging === 'hue') updateFromHue(e.clientX)
    }
    const onUp = () => setDragging(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, updateFromSv, updateFromHue])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    onChange?.(currentHex)
  }, [currentHex, onChange])

  const handleRgbChange = (channel, v) => {
    const num = Math.max(0, Math.min(255, parseInt(v, 10) || 0))
    const next = { ...currentRgb, [channel]: num }
    setHsv(rgbToHsv(next.r, next.g, next.b))
  }
  const displayRgb = { r: Math.round(r), g: Math.round(g), b: Math.round(b) }

  const handleEyedropper = async () => {
    if (!window.EyeDropper) return
    try {
      const picker = new window.EyeDropper()
      const { sRGBHex } = await picker.open()
      syncFromHex(sRGBHex)
      onChange?.(sRGBHex)
    } catch (_) {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {/* Saturation / Value area */}
      <div
        ref={svAreaRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          borderRadius: 8,
          background: `linear-gradient(to top, #000, ${hueColor}), linear-gradient(to right, #fff, transparent)`,
          cursor: 'crosshair',
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          setDragging('sv')
          updateFromSv(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (e.buttons === 0) updateFromSv(e.clientX, e.clientY)
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Bottom row: eyedropper, swatch, hue strip, RGB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleEyedropper}
          title="Pick color from screen"
          style={{
            width: 28,
            height: 28,
            padding: 0,
            border: '1px solid var(--panel-border)',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
            cursor: window.EyeDropper ? 'pointer' : 'default',
            opacity: window.EyeDropper ? 1 : 0.5,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: 'auto', display: 'block' }}>
            <path d="M20 3v3c0 .5-.2 1-.6 1.4L15 12l-2 2 4 4 2-2 4.6-4.4c.4-.4.6-.9.6-1.4V3h-4zM4 20l4-4" />
          </svg>
        </button>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: currentHex,
            border: '2px solid var(--panel-border)',
            flexShrink: 0,
          }}
        />
        <div
          ref={hueStripRef}
          style={{
            flex: 1,
            minWidth: 80,
            height: 12,
            borderRadius: 6,
            background: `linear-gradient(to right, ${HUE_STOPS})`,
            cursor: 'pointer',
            position: 'relative',
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            setDragging('hue')
            updateFromHue(e.clientX)
          }}
          onPointerMove={(e) => {
            if (e.buttons === 0) updateFromHue(e.clientX)
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: `${(hsv.h / 360) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['r', 'g', 'b'].map((ch) => (
            <div key={ch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <input
                type="number"
                min={0}
                max={255}
                value={displayRgb[ch]}
                onChange={(e) => handleRgbChange(ch, e.target.value)}
                style={{
                  width: 40,
                  padding: '4px 6px',
                  fontSize: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 4,
                  color: 'var(--text)',
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{ch.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function LoadingPage({ loaded }) {
  const wrapRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    gsap.to(barRef.current, {
      scaleX: 1,
      duration: 1.8,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
    })
  }, [])

  useEffect(() => {
    if (!loaded || !wrapRef.current) return
    gsap.to(wrapRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        if (wrapRef.current) wrapRef.current.style.pointerEvents = 'none'
      },
    })
  }, [loaded])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        background: 'var(--bg-dark)',
        opacity: 1,
        transition: 'opacity 0.4s ease-out',
      }}
      className="loading-page"
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '3px solid var(--panel-border)',
          borderTopColor: 'var(--accent)',
          animation: 'loading-spin 0.9s linear infinite',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 6,
          }}
        >
          Watch Configurator
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading model…</div>
      </div>
      <div
        style={{
          width: 160,
          height: 4,
          borderRadius: 2,
          background: 'var(--panel-border)',
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--accent)',
            transformOrigin: 'left',
            transform: 'scaleX(0.2)',
          }}
        />
      </div>
      <style>{`@keyframes loading-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

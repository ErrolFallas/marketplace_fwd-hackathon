'use client'

import Image from 'next/image'
import { useRef, useState, useCallback, useEffect } from 'react'

const MAX_TILT = 14

export function ButterflyHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      setTilt({ rx: -dy * MAX_TILT, ry: dx * MAX_TILT })
    })
  }, [])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setIsHovered(false)
    setTilt({ rx: 0, ry: 0 })
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full select-none cursor-crosshair"
      style={{ perspective: '900px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Div exterior: float siempre activo, nunca se interrumpe */}
      <div
        className="w-full max-w-[420px]"
        style={{
          animation: 'butterflyFloat 5s ease-in-out infinite',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Div interior: solo aplica el tilt 3D */}
        <div
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${isHovered ? 1.05 : 1})`,
            transition: isHovered
              ? 'transform 120ms var(--ease-out)'
              : 'transform 700ms var(--ease-out)',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <Image
            src="/images/brand/butterfly-1.png"
            alt="FWD Marketplace"
            width={500}
            height={500}
            sizes="(max-width: 1024px) 80vw, 34vw"
            className="w-full h-auto object-contain"
            style={{
              filter: isHovered
                ? 'drop-shadow(0 8px 40px rgba(0,0,0,0.3)) drop-shadow(0 0 80px rgba(255,255,255,0.24))'
                : 'drop-shadow(0 4px 32px rgba(0,0,0,0.22)) drop-shadow(0 0 56px rgba(255,255,255,0.14))',
              transition: 'filter 300ms var(--ease-out)',
            }}
            priority
          />
        </div>
      </div>
    </div>
  )
}

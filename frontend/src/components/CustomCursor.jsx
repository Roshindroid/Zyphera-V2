import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const mouse = useRef({ x: -200, y: -200 })
  const ringPos = useRef({ x: -200, y: -200 })
  const raf = useRef(null)

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const tick = () => {
      dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`

      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.1)
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.1)
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`

      raf.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}

'use client'
// 가로 줄 자동 넘김(인기 순위 띠와 같은 움직임) — 한 화면씩 · 끝에 닿으면 처음부터 · 마우스 올림·손댐이면 잠시 쉼
import { useEffect, useRef } from 'react'

export function useAutoRail<T extends HTMLElement>(enabled: boolean, everyMs: number, resumeMs = 8000) {
  const rail = useRef<T>(null)
  const hold = useRef(0)
  const hover = useRef(false)
  useEffect(() => {
    if (!enabled) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const id = window.setInterval(() => {
      const el = rail.current
      if (!el || document.hidden || hover.current || Date.now() < hold.current) return
      if (el.scrollWidth <= el.clientWidth + 4) return
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.style.transition = 'opacity 200ms'
        el.style.opacity = '0'
        window.setTimeout(() => { el.style.scrollBehavior = 'auto'; el.scrollLeft = 0; el.style.scrollBehavior = ''; el.style.opacity = '1' }, 200)
      } else el.scrollBy({ left: el.clientWidth + gap, behavior: reduce ? 'auto' : 'smooth' })
    }, everyMs)
    return () => window.clearInterval(id)
  }, [enabled, everyMs])
  const pause = () => { hold.current = Date.now() + resumeMs }
  const page = (dir: 1 | -1) => {
    pause()
    const el = rail.current
    if (el) el.scrollBy({ left: dir * (el.clientWidth + (parseFloat(getComputedStyle(el).columnGap) || 0)), behavior: 'smooth' })
  }
  const bind = {
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === 'mouse') hover.current = true },
    onPointerLeave: () => { hover.current = false },
    onTouchStart: pause,
    onWheel: pause,
    onFocus: pause,
  }
  return { rail, page, pause, bind }
}

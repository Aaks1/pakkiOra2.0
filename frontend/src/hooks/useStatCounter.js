import { useEffect, useState } from 'react'

export default function useStatCounter(target, { delay = 0, duration = 500 } = {}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const end = Number(target) || 0
    if (end === 0) {
      setValue(0)
      return undefined
    }

    let frame
    let start
    const timeout = setTimeout(() => {
      const tick = (ts) => {
        if (start === undefined) start = ts
        const elapsed = ts - start
        const progress = Math.min(elapsed / duration, 1)
        setValue(Math.round(end * progress))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [target, delay, duration])

  return value
}

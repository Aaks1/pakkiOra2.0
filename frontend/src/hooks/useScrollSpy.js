import { useEffect, useState } from 'react'

function getHeaderOffset() {
  const header = document.querySelector('.site-header')
  return (header?.offsetHeight ?? 68) + 16
}

export function useScrollSpy(sectionIds) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (!sectionIds.length) return undefined

    const handleScroll = () => {
      const scrollPosition = window.scrollY + getHeaderOffset()
      const firstSection = document.getElementById(sectionIds[0])

      if (firstSection && scrollPosition < firstSection.offsetTop) {
        setActiveId('')
        return
      }

      let current = ''

      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (element && element.offsetTop <= scrollPosition) {
          current = id
        }
      }

      setActiveId(current)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [sectionIds])

  return activeId
}

export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

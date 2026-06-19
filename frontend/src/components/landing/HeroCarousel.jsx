import { useCallback, useEffect, useRef, useState } from 'react'
import { FALLBACK_IMAGE } from './landingData'
const AUTOPLAY_MS = 3500
const SWIPE_THRESHOLD = 48

export default function HeroCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [loadedSlides, setLoadedSlides] = useState({})
  const [failedSlides, setFailedSlides] = useState({})
  const touchStartX = useRef(null)

  const goTo = useCallback((index) => {
    const next = (index + slides.length) % slides.length
    setActiveIndex(next)
  }, [slides.length])

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (isPaused || slides.length <= 1) return undefined
    const timer = window.setInterval(goNext, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [goNext, isPaused, slides.length])

  const handleImageLoad = (index) => {
    setLoadedSlides((prev) => ({ ...prev, [index]: true }))
  }

  const handleImageError = (index) => {
    setFailedSlides((prev) => ({ ...prev, [index]: true }))
    setLoadedSlides((prev) => ({ ...prev, [index]: true }))
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  const isLoading = !loadedSlides[activeIndex]

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Healthcare highlights"
    >
      <div className="hero-carousel__viewport">
        <div
          className="hero-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <article
              key={slide.headline}
              className="hero-carousel__slide"
              aria-hidden={index !== activeIndex}
            >
              <img
                src={failedSlides[index] ? FALLBACK_IMAGE : slide.image}
                alt=""
                className="hero-carousel__image"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
              />
              <div
                className={`hero-carousel__caption${index === activeIndex ? ' hero-carousel__caption--visible' : ''}`}
                aria-live={index === activeIndex ? 'polite' : 'off'}
              >
                <h3 className="hero-carousel__headline">{slide.headline}</h3>
                <p className="hero-carousel__description">{slide.description}</p>
              </div>
            </article>
          ))}
        </div>

        {isLoading && (
          <div className="hero-carousel__loader" role="status" aria-label="Loading image">
            <span className="hero-carousel__loader-text">Loading image</span>
          </div>
        )}

        {slides.length > 1 && (
          <div className="hero-carousel__controls">
            {slides.map((slide, index) => (
              <button
                key={slide.headline}
                type="button"
                className={`hero-carousel__dot${index === activeIndex ? ' hero-carousel__dot--active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>
        )}      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Catalogue from '../../components/Catalogue/Catalogue.jsx'
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton.jsx'
import RequestState from '../../components/RequestState/RequestState.jsx'
import useApi from '../../hooks/useApi.js'
import { imageUrl, titleUrl } from '../../lib/api.js'
import './MainPage.css'

function CarouselTitle({ title, active }) {
  const [failed, setFailed] = useState(false)
  const Heading = active ? 'h1' : 'h2'
  const logo = imageUrl(title.logoPath, 'original')
  return (
    <Heading className="hero-logo-title" aria-label={title.title}>
      {logo && !failed ? (
        <img
          className="hero-logo"
          src={logo}
          alt={title.title}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="hero-logo-fallback">{title.title}</span>
      )}
    </Heading>
  )
}

export default function MainPage() {
  const request = useApi('/api/popular?type=movie&include_logos=true')
  const location = useLocation()
  const returnState = {
    returnTo: location.pathname + location.search + location.hash,
  }
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const titles = request.data?.results.slice(0, 5) || []

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const motionChanged = () => setReducedMotion(media.matches)
    const visibilityChanged = () => setHidden(document.hidden)
    media.addEventListener('change', motionChanged)
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      media.removeEventListener('change', motionChanged)
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [])

  useEffect(() => {
    if (titles.length < 2 || focused || hidden || reducedMotion)
      return
    const timer = setTimeout(
      () => setFeaturedIndex((index) => (index + 1) % titles.length),
      6000
    )
    return () => clearTimeout(timer)
  }, [titles.length, featuredIndex, focused, hidden, reducedMotion])

  return (
    <>
      {titles.length ? (
        <section
          className="hero"
          aria-label="Popular movies"
          aria-roledescription="carousel"
          onFocusCapture={(event) => {
            setFocused(event.target.matches(':focus-visible'))
          }}
          onPointerDownCapture={() => setFocused(false)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setFocused(false)
          }}
        >
          {titles.map((featured, index) => {
            const active = index === featuredIndex
            return (
              <div
                key={featured.key}
                className={`hero-slide ${active ? 'is-active' : ''}`}
                inert={!active}
                aria-hidden={!active}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${titles.length}`}
                style={{
                  '--hero-backdrop': imageUrl(featured.backdropPath, 'w1280')
                    ? `url("${imageUrl(featured.backdropPath, 'w1280')}")`
                    : 'none',
                }}
              >
                <div className="hero-copy">
                  <CarouselTitle title={featured} active={active} />
                  <div className="badges">
                    <span>{featured.year || 'Year unavailable'}</span>
                    {featured.genres.map((genre) => (
                      <span key={genre.id}>{genre.name}</span>
                    ))}
                  </div>
                  <p className="hero-description">
                    {featured.overview || 'No description available yet.'}
                  </p>
                  <div className="hero-actions">
                    <Link
                      className="primary-button"
                      to={titleUrl(featured)}
                      state={returnState}
                    >
                      Read More
                    </Link>
                    <FavoriteButton movie={featured} hero />
                  </div>
                </div>
              </div>
            )
          })}
          <div className="hero-dots" aria-label="Select featured title">
            <div className="dot-buttons">
              {titles.map((title, index) => (
                <button
                  key={title.key}
                  aria-label={`Featured title ${index + 1}: ${title.title}`}
                  aria-pressed={featuredIndex === index}
                  onClick={() => setFeaturedIndex(index)}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="hero hero-loading" aria-label="Popular movies">
          <RequestState {...request} />
          {request.data && <p>No popular movies available.</p>}
        </section>
      )}
      <Catalogue />
    </>
  )
}

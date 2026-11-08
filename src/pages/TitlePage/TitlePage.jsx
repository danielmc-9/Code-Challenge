import { useRef, useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import useApi from '../../hooks/useApi.js'
import { imageUrl } from '../../lib/api.js'
import { genres } from '../../data/genres.js'
import { useLibrary } from '../../context/LibraryContext.jsx'
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton.jsx'
import { PosterImage } from '../../components/MovieCard/MovieCard.jsx'
import RequestState from '../../components/RequestState/RequestState.jsx'
import './TitlePage.css'
function CastPortrait({ person }) {
  const [failed, setFailed] = useState(false)
  const src = imageUrl(person.profilePath, 'w185')
  return (
    <div className="cast-portrait">
      {src && !failed ? (
        <img
          src={src}
          alt={person.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          role="img"
          aria-label={`No portrait available for ${person.name}`}
        >
          {person.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')}
        </span>
      )}
    </div>
  )
}

export default function TitlePage({ mediaType }) {
  const { favorites } = useLibrary()
  const drag = useRef(null)
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  function returnToPrevious() {
    const origin = location.state?.returnTo
    if (origin && window.history.state?.idx > 0) navigate(-1)
    else
      navigate(
        typeof origin === 'string' &&
          origin.startsWith('/') &&
          !origin.startsWith('//')
          ? origin
          : '/',
        { replace: true }
      )
  }
  const returnButton = (
    <button className="back-link" onClick={returnToPrevious}>
      ← Return
    </button>
  )
  const request = useApi(`/api/titles/${mediaType}/${encodeURIComponent(id)}`)
  const title = request.data
  if (!title)
    return (
      <div className="browse-page">
        <RequestState {...request} />
        {returnButton}
      </div>
    )
  return (
    <article
      className="title-page"
      style={{
        '--title-backdrop': imageUrl(title.backdropPath, 'w1280')
          ? `url("${imageUrl(title.backdropPath, 'w1280')}")`
          : 'none',
      }}
    >
      {returnButton}
      <div className="title-summary">
        <div className="detail-poster">
          <PosterImage key={title.key} title={title} eager />
        </div>
        <div className="title-info">
          <div className="title-heading-row">
            <h1>{title.title}</h1>
            <div className="mobile-title-favorite">
              <FavoriteButton movie={title} hero />
            </div>
          </div>
          <div className="badges">
            <span>{title.year || 'Release year unavailable'}</span>
            <span>{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
            {title.runtime && <span>{title.runtime} min</span>}
            {title.rating && <span>{title.rating.toFixed(1)} / 10</span>}
          </div>
          <div className="detail-genres">
            {title.genres.map((genre) => {
              const mapped = genres.find((item) => item[mediaType] === genre.id)
              return mapped ? (
                <Link
                  key={genre.id}
                  to={`/genres/${mapped.slug}?type=${mediaType}`}
                >
                  {genre.name}
                </Link>
              ) : (
                <span key={genre.id}>{genre.name}</span>
              )
            })}
          </div>
          <p className="title-overview">
            {title.overview || 'No description available yet.'}
          </p>
          <dl>
            {mediaType === 'tv' && (
              <>
                <dt>Creators</dt>
                <dd>{title.creators.join(', ') || 'Not listed'}</dd>
              </>
            )}
            {mediaType !== 'tv' && (
              <>
                <dt>Directors</dt>
                <dd>{title.directors.join(', ') || 'Not listed'}</dd>
              </>
            )}
            {title.seasons && (
              <>
                <dt>Seasons / episodes</dt>
                <dd>
                  {title.seasons} / {title.episodes || 'Not listed'}
                </dd>
              </>
            )}
            {/* {title.status && (
              <>
                <dt>Status</dt>
                <dd>{title.status}</dd>
              </>
            )} */}
          </dl>
          <div className="save-title">
            <FavoriteButton movie={title} hero />
            <span>
              {favorites.some((item) => item.key === title.key)
                ? 'Remove from My Favorites'
                : 'Add to My Favorites'}
            </span>
          </div>
        </div>
      </div>
      <section className="cast-section">
        <h2>Actors</h2>
        {title.cast.length ? (
          <div
            className="cast-row"
            onDragStart={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              if (event.pointerType !== 'mouse' || event.button !== 0) return
              drag.current = {
                x: event.clientX,
                scrollLeft: event.currentTarget.scrollLeft,
              }
              event.currentTarget.setPointerCapture(event.pointerId)
              event.currentTarget.classList.add('is-dragging')
            }}
            onPointerMove={(event) => {
              if (drag.current)
                event.currentTarget.scrollLeft =
                  drag.current.scrollLeft - (event.clientX - drag.current.x)
            }}
            onPointerUp={(event) => {
              drag.current = null
              event.currentTarget.classList.remove('is-dragging')
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerCancel={(event) => {
              drag.current = null
              event.currentTarget.classList.remove('is-dragging')
            }}
            onLostPointerCapture={(event) => {
              drag.current = null
              event.currentTarget.classList.remove('is-dragging')
            }}
            tabIndex={0}
            role="region"
            aria-label="Actors, scroll horizontally"
          >
            {title.cast.map((person, index) => (
              <div className="cast-person" key={`${person.id}-${index}`}>
                <CastPortrait person={person} />
                <strong>{person.name}</strong>
                <span>{person.character || 'Role not listed'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No cast information available.</p>
        )}
      </section>
      {title.trailerKey && (
        <section className="trailer-section">
          <h2>Trailer</h2>
          <iframe
            title={`${title.title} trailer`}
            src={`https://www.youtube-nocookie.com/embed/${title.trailerKey}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </section>
      )}
    </article>
  )
}

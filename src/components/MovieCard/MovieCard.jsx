import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import FavoriteButton from '../FavoriteButton/FavoriteButton.jsx'
import { imageUrl, titleUrl } from '../../lib/api.js'
import './MovieCard.css'
export function PosterImage({ title, className = '', eager = false }) {
  const [failed, setFailed] = useState(false)
  const src = imageUrl(title.posterPath)
  return src && !failed ? (
    <img
      className={`cover-image ${className}`}
      src={src}
      alt={`${title.title} poster`}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  ) : (
    <Icon name="film" />
  )
}
export default function MovieCard({ movie }) {
  const location = useLocation()
  const returnState = {
    returnTo: location.pathname + location.search + location.hash,
  }
  return (
    <article className="movie-card">
      <div className="poster">
        <Link
          className="poster-open"
          to={titleUrl(movie)}
          state={returnState}
          aria-label={`Read more about ${movie.title}`}
        >
          <PosterImage title={movie} />
        </Link>
        {/* <FavoriteButton movie={movie} /> */}
      </div>
      <Link
        className="movie-title"
        to={titleUrl(movie)}
        state={returnState}
        title={movie.title}
      >
        {movie.title}
      </Link>
      <p className="movie-meta">
        {movie.mediaType === 'tv' ? 'Series' : 'Movie'} ·{' '}
        {movie.year || 'Year unavailable'}
      </p>
    </article>
  )
}

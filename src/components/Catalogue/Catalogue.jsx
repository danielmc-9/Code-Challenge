import { useState } from 'react'
import { Link } from 'react-router-dom'
import { genres } from '../../data/genres.js'
import useApi from '../../hooks/useApi.js'
import RequestState from '../RequestState/RequestState.jsx'
import Icon from '../Icon/Icon.jsx'
import MovieCard from '../MovieCard/MovieCard.jsx'
import './Catalogue.css'

function GenreRow({ genre, mediaType }) {
  const request = useApi(
    `/api/genre-feed?genre=${genre.slug}&type=${mediaType}`
  )
  const { data } = request
  const countLabel =
    mediaType === 'movie' ? 'movies' : mediaType === 'tv' ? 'series' : 'titles'
  return (
    <section
      className="genre-section"
      aria-labelledby={`heading-${genre.slug}`}
    >
      <div className="section-header">
        <div className="section-heading">
          <div className="section-title-row">
            <h2 id={`heading-${genre.slug}`}>{genre.name}</h2>
            <Link
              className="see-all"
              to={`/genres/${genre.slug}?type=${mediaType === 'tv' ? 'tv' : 'movie'}`}
            >
              See all
              <Icon name="arrow-right" />
            </Link>
          </div>
          {data && (
            <span title="Total reported by TMDB">
              {data.totalResults.toLocaleString()} {countLabel}
            </span>
          )}
        </div>
      </div>
      <RequestState {...request} />
      {data && (
        <>
          <div className="movie-row">
            {data.results.map((movie) => (
              <MovieCard key={movie.key} movie={movie} />
            ))}
          </div>
          {data.results.length === 0 && (
            <p className="request-state">No titles available in this genre.</p>
          )}
        </>
      )}
    </section>
  )
}
export default function Catalogue({ mediaType = 'all' }) {
  const [selectedGenre, setSelectedGenre] = useState('all')
  const available = genres.filter(
    (genre) => mediaType === 'all' || genre[mediaType]
  )
  return (
    <>
      <nav className="genre-tabs" aria-label="Filter by genre">
        <button
          aria-pressed={selectedGenre === 'all'}
          onClick={() => setSelectedGenre('all')}
        >
          All
        </button>
        {available.map((genre) => (
          <button
            key={genre.slug}
            aria-pressed={selectedGenre === genre.slug}
            onClick={() => setSelectedGenre(genre.slug)}
          >
            {genre.name}
          </button>
        ))}
      </nav>
      <div className="catalogue">
        {available
          .filter(
            (genre) => selectedGenre === 'all' || selectedGenre === genre.slug
          )
          .map((genre) => (
            <GenreRow key={genre.slug} genre={genre} mediaType={mediaType} />
          ))}
      </div>
    </>
  )
}

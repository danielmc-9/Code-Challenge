import { useState } from 'react'
import { Link } from 'react-router-dom'
import { genres } from '../../data/catalogue.js'
import Icon from '../Icon/Icon.jsx'
import MovieCard from '../MovieCard/MovieCard.jsx'
import './Catalogue.css'

export default function Catalogue({
  movies,
  showSavedCount = false,
  emptyTitle = 'No titles found',
  emptyDescription = 'Try another genre.',
}) {
  const [genre, setGenre] = useState('All')
  const visible = movies.filter(
    (movie) => genre === 'All' || movie.genre === genre
  )

  return (
    <>
      <nav className="genre-tabs" aria-label="Filter by genre">
        {['All', ...genres].map((item) => (
          <button
            key={item}
            aria-pressed={genre === item}
            onClick={() => setGenre(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="catalogue">
        {genres.map((name) => {
          const titles = visible.filter((movie) => movie.genre === name)
          if (titles.length === 0) return null
          return (
            <section
              className="genre-section"
              key={name}
              aria-labelledby={`heading-${name}`}
            >
              <div className="section-header">
                <div className="section-heading">
                  <h2 id={`heading-${name}`}>{name}</h2>
                  <span>
                    {showSavedCount ? `${titles.length} saved` : 'X amount'}
                  </span>
                </div>
                <button
                  className="see-all"
                  onClick={() => setGenre(genre === name ? 'All' : name)}
                >
                  {genre === name ? 'All genres' : 'See all'}
                  <Icon name="arrow-right" />
                </button>
              </div>
              <div className="movie-row">
                {titles.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          )
        })}
        {visible.length === 0 && (
          <div className="empty-state">
            <h1>{emptyTitle}</h1>
            <p>{emptyDescription}</p>
            <Link className="primary-button" to="/">
              Browse titles
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

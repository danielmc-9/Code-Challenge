import { Link, useParams, useSearchParams } from 'react-router-dom'
import { genres } from '../../data/genres.js'
import useApi from '../../hooks/useApi.js'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
import RequestState from '../../components/RequestState/RequestState.jsx'
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx'
import './GenrePage.css'

function GenreResults({ genre }) {
  const [params, setParams] = useSearchParams()
  const mediaType = params.get('type') === 'tv' && genre.tv ? 'tv' : 'movie'
  const rawPage = Number(params.get('page') || 1)
  const page =
    Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 500 ? rawPage : 1
  const request = useApi(
    `/api/discover?genre=${genre.slug}&type=${mediaType}&page=${page}`
  )
  const { data } = request
  function changePage(value) {
    setParams({ type: mediaType, page: String(value) })
    window.scrollTo(0, 0)
  }
  return (
    <section className="browse-page genre-page">
      <Link className="back-link" to="/">
        ← Home
      </Link>
      <header className="browse-heading">
        <h1>{genre.name}</h1>
        <p>
          {data
            ? `${data.totalResults.toLocaleString()} ${mediaType === 'tv' ? 'series' : 'movies'}`
            : 'Browse titles'}
        </p>
      </header>
      <nav className="type-tabs" aria-label="Title type">
        {['movie', 'tv']
          .filter((type) => genre[type])
          .map((type) => (
            <button
              key={type}
              aria-pressed={mediaType === type}
              onClick={() => setParams({ type, page: '1' })}
            >
              {type === 'movie' ? 'Movies' : 'Series'}
            </button>
          ))}
      </nav>
      {mediaType === 'tv' && ['action', 'war'].includes(genre.slug) && (
        <p className="source-note">
          Series category:{' '}
          {genre.slug === 'action' ? 'Action & Adventure' : 'War & Politics'}
        </p>
      )}
      <RequestState {...request} />
      {data && (
        <>
          <div className="title-grid">
            {data.results.map((movie) => (
              <MovieCard key={movie.key} movie={movie} />
            ))}
          </div>
          {!data.results.length && (
            <p className="request-state">No titles found on this page.</p>
          )}
          <nav className="pagination" aria-label="Pagination">
            <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.max(data.totalPages, 1)}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => changePage(page + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </section>
  )
}
export default function GenrePage() {
  const { genreSlug } = useParams()
  const genre = genres.find((item) => item.slug === genreSlug)
  return genre ? (
    <GenreResults key={genre.slug} genre={genre} />
  ) : (
    <NotFoundPage />
  )
}

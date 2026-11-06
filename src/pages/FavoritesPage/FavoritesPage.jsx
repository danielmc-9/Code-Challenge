import { Link } from 'react-router-dom'
import { useLibrary } from '../../context/LibraryContext.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
export default function FavoritesPage() {
  const { favorites } = useLibrary()
  return (
    <section className="browse-page">
      <header className="browse-heading">
        <h1>My Favorites</h1>
        <p>
          {favorites.length} saved {favorites.length === 1 ? 'title' : 'titles'}
        </p>
      </header>
      {favorites.length ? (
        <div className="title-grid">
          {favorites.map((movie) => (
            <MovieCard key={movie.key} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No favorites yet</h2>
          <p>Tap a heart on a title to save it here.</p>
          <Link className="primary-button" to="/">
            Browse titles
          </Link>
        </div>
      )}
    </section>
  )
}

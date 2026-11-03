import Icon from '../Icon/Icon.jsx'
import FavoriteButton from '../FavoriteButton/FavoriteButton.jsx'
import { useLibrary } from '../../context/LibraryContext.jsx'
import './MovieCard.css'

export default function MovieCard({ movie }) {
  const { openTitle: onOpen } = useLibrary()
  return (
    <article className="movie-card">
      <div className="poster">
        <button
          className="poster-open"
          aria-label={`Read more about ${movie.title} ${movie.id}`}
          onClick={() => onOpen(movie)}
        >
          <Icon name="film" />
        </button>
        <FavoriteButton movie={movie} />
      </div>
      <button className="movie-title" onClick={() => onOpen(movie)}>
        {movie.title}
      </button>
      <p className="movie-meta">Movie · Year · Genre</p>
    </article>
  )
}

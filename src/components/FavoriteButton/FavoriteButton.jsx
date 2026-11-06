import { useLibrary } from '../../context/LibraryContext.jsx'
import './FavoriteButton.css'
export default function FavoriteButton({ movie, hero = false }) {
  const { favorites, toggleFavorite } = useLibrary()
  const saved = favorites.some((item) => item.key === movie.key)
  return (
    <button
      className={`favorite-button ${hero ? 'hero-favorite' : ''}`}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Add'} ${movie.title} ${saved ? 'from' : 'to'} favorites`}
      onClick={() => toggleFavorite(movie)}
    >
      <svg className="heart-icon" viewBox="0 0 14 14" aria-hidden="true">
        <use className="heart-fill" href="/assets/heart.svg#heart" />
        <use className="heart-outline" href="/assets/heart.svg#heart" />
      </svg>
    </button>
  )
}

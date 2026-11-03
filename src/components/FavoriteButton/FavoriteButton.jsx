import Icon from '../Icon/Icon.jsx'
import { useLibrary } from '../../context/LibraryContext.jsx'
import './FavoriteButton.css'

export default function FavoriteButton({ movie, hero = false }) {
  const { favorites, toggleFavorite: toggle } = useLibrary()
  const saved = favorites.includes(movie.id)
  return (
    <button
      className={`favorite-button ${hero ? 'hero-favorite' : ''}`}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Add'} ${movie.title} ${movie.id} ${saved ? 'from' : 'to'} favorites`}
      onClick={() => toggle(movie.id)}
    >
      <Icon name="heart" />
    </button>
  )
}

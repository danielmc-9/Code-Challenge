import Catalogue from '../../components/Catalogue/Catalogue.jsx'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { catalogue } from '../../data/catalogue.js'

export default function FavoritesPage() {
  const { favorites } = useLibrary()
  return (
    <Catalogue
      movies={catalogue.filter((movie) => favorites.includes(movie.id))}
      showSavedCount
      emptyTitle="No favorites yet"
      emptyDescription="Tap a heart on a title to save it here."
    />
  )
}

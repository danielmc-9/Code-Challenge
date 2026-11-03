import Catalogue from '../../components/Catalogue/Catalogue.jsx'
import { catalogue } from '../../data/catalogue.js'

export default function MoviesPage() {
  return (
    <Catalogue movies={catalogue.filter((movie) => movie.type === 'Movie')} />
  )
}

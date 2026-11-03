import Catalogue from '../../components/Catalogue/Catalogue.jsx'
import { catalogue } from '../../data/catalogue.js'

export default function SeriesPage() {
  return (
    <Catalogue
      movies={catalogue.filter((movie) => movie.type === 'Series')}
      emptyTitle="No series yet"
      emptyDescription="Series will appear here when they are added."
    />
  )
}

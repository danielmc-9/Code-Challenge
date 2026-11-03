import { Route, Routes } from 'react-router-dom'
import { LibraryProvider } from './context/LibraryContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import MainPage from './pages/MainPage/MainPage.jsx'
import MoviesPage from './pages/MoviesPage/MoviesPage.jsx'
import SeriesPage from './pages/SeriesPage/SeriesPage.jsx'
import FavoritesPage from './pages/FavoritesPage/FavoritesPage.jsx'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx'

export default function App() {
  return (
    <LibraryProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<MainPage />} />
          <Route path="movies" element={<MoviesPage />} />
          <Route path="series" element={<SeriesPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LibraryProvider>
  )
}

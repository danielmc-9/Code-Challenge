import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation/Navigation.jsx'
import MovieDetails from '../components/MovieDetails/MovieDetails.jsx'
import { useLibrary } from '../context/LibraryContext.jsx'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { openTitle } = useLibrary()

  useEffect(() => {
    window.scrollTo(0, 0)
    openTitle(null)
  }, [pathname, openTitle])

  return (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <MovieDetails />
    </>
  )
}

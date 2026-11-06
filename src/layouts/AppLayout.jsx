import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navigation from '../components/Navigation/Navigation.jsx'
export default function AppLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p><strong>
          WEXO - Code Challenge
        </strong></p>
        <p>
          Daniel Mejer Christensen
        </p>
      </footer>
    </>
  )
}

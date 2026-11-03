import { NavLink } from 'react-router-dom'
import './Navigation.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/favorites', label: 'My Favorites' },
]

export default function Navigation() {
  return (
    <header className="navbar">
      <nav aria-label="Main navigation">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} end>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

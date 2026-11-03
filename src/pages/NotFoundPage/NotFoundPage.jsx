import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <section className="not-found-page">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="primary-button" to="/">
        Back to home
      </Link>
    </section>
  )
}

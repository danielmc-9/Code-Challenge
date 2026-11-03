import { useState } from 'react'
import Catalogue from '../../components/Catalogue/Catalogue.jsx'
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { catalogue, description } from '../../data/catalogue.js'
import './MainPage.css'

export default function MainPage() {
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const { openTitle } = useLibrary()
  const featured = catalogue[featuredIndex]

  return (
    <>
      <section className="hero" aria-label="Featured titles">
        <div className="hero-copy">
          <h1>{featured.title}</h1>
          <div className="badges">
            <span>Year</span>
            <span>Genre</span>
          </div>
          <p className="hero-description">{description}</p>
          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => openTitle(featured)}
            >
              Read More
            </button>
            <FavoriteButton movie={featured} hero />
          </div>
        </div>
        <div className="hero-poster">
          <Icon name="film" width="28" height="28" />
        </div>
        <div className="hero-dots" aria-label="Select featured title">
          {featuredIndex === 0 && <Icon name="hero-dots" />}
          <div
            className={`dot-buttons ${featuredIndex === 0 ? 'original-dots' : ''}`}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <button
                key={index}
                aria-label={`Featured title ${index + 1}`}
                aria-pressed={featuredIndex === index}
                onClick={() => setFeaturedIndex(index)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </section>
      <Catalogue movies={catalogue} />
    </>
  )
}

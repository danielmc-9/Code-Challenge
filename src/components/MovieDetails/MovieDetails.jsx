import { useEffect, useRef } from 'react'
import { useLibrary } from '../../context/LibraryContext.jsx'
import { description } from '../../data/catalogue.js'
import FavoriteButton from '../FavoriteButton/FavoriteButton.jsx'
import './MovieDetails.css'

export default function MovieDetails() {
  const { selectedTitle: selected, openTitle } = useLibrary()
  const dialog = useRef(null)

  useEffect(() => {
    if (selected) dialog.current.showModal()
    else if (dialog.current.open) dialog.current.close()
  }, [selected])

  return (
    <dialog
      ref={dialog}
      onClose={() => openTitle(null)}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close()
      }}
      aria-labelledby="detail-title"
    >
      {selected && (
        <div className="detail-content">
          <form method="dialog">
            <button className="close-button" aria-label="Close title details">
              ×
            </button>
          </form>
          <h2 id="detail-title">{selected.title}</h2>
          <div className="badges">
            <span>Year</span>
            <span>{selected.genre}</span>
          </div>
          <p>{description}</p>
          <p className="detail-note">
            More details will be available when this title is added.
          </p>
          <FavoriteButton movie={selected} hero />
        </div>
      )}
    </dialog>
  )
}

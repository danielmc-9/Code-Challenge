import { createContext, useContext, useEffect, useState } from 'react'
const LibraryContext = createContext(null)
const storageKey = 'my-favorites'

export function LibraryProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return Array.isArray(saved)
        ? saved.filter(
            (item) =>
              item &&
              ['movie', 'tv'].includes(item.mediaType) &&
              Number.isInteger(item.id) &&
              item.key === `${item.mediaType}:${item.id}` &&
              typeof item.title === 'string'
          )
        : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch {
      /* Favorites remain available in memory when storage is unavailable. */
    }
  }, [favorites])
  function toggleFavorite(title) {
    setFavorites((current) =>
      current.some((item) => item.key === title.key)
        ? current.filter((item) => item.key !== title.key)
        : [
            ...current,
            {
              id: title.id,
              key: title.key,
              mediaType: title.mediaType,
              title: title.title,
              year: title.year,
              posterPath: title.posterPath,
              genreIds: title.genreIds,
            },
          ]
    )
  }
  return (
    <LibraryContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </LibraryContext.Provider>
  )
}
export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context)
    throw new Error('useLibrary must be used inside LibraryProvider')
  return context
}

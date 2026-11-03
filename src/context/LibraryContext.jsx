import { createContext, useContext, useEffect, useState } from 'react'

const LibraryContext = createContext(null)

export function LibraryProvider({ children }) {
  const [selectedTitle, setSelectedTitle] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wexo-favorites') || '[]')
      return Array.isArray(saved)
        ? saved.filter((id) => typeof id === 'string')
        : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('wexo-favorites', JSON.stringify(favorites))
    } catch {
      /* Keep favorites in memory if storage is unavailable. */
    }
  }, [favorites])

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  return (
    <LibraryContext.Provider
      value={{
        favorites,
        toggleFavorite,
        selectedTitle,
        openTitle: setSelectedTitle,
      }}
    >
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

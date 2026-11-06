export const titleUrl = (title) =>
  `/${title.mediaType === 'tv' ? 'series' : 'movies'}/${title.id}`
export function imageUrl(path, size = 'w500') {
  return typeof path === 'string' && /^\/[\w.-]+$/.test(path)
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : null
}
export async function getJson(path, signal) {
  const response = await fetch(path, { signal })
  const data = await response.json()
  if (!response.ok)
    throw new Error(data.error || 'Could not load titles. Please try again.')
  return data
}

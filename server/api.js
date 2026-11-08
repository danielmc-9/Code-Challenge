import { genres } from '../src/data/genres.js'

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function createTmdbApi({
  token,
  fetchImpl = fetch,
  now = Date.now,
} = {}) {
  const cache = new Map()
  const pending = new Map()
  let active = 0
  const queue = []
  async function limited(work) {
    if (active >= 4) await new Promise((resolve) => queue.push(resolve))
    else active++
    try {
      return await work()
    } finally {
      if (queue.length) queue.shift()()
      else active--
    }
  }
  async function tmdb(path, params = {}, ttl = 900_000) {
    if (!token) throw new ApiError(503, 'The movie service is not configured.')
    const query = new URLSearchParams({ language: 'en-US', ...params })
    const key = `${path}?${query}`
    const saved = cache.get(key)
    if (saved && saved.expires > now()) return saved.data
    if (pending.has(key)) return pending.get(key)
    const promise = limited(async () => {
      const headers = { Accept: 'application/json' }
      if (token.startsWith('eyJ')) headers.Authorization = `Bearer ${token}`
      else query.set('api_key', token)
      let response
      try {
        response = await fetchImpl(
          `https://api.themoviedb.org/3/${path}?${query}`,
          { headers, signal: AbortSignal.timeout(12000) }
        )
      } catch {
        throw new ApiError(
          502,
          'The movie service could not be reached. Please try again.'
        )
      }
      if (!response.ok) {
        if (response.status === 404)
          throw new ApiError(404, 'This title was not found.')
        if (response.status === 429)
          throw new ApiError(
            429,
            'The movie service is busy. Please try again shortly.'
          )
        throw new ApiError(502, 'The movie service is temporarily unavailable.')
      }
      let data
      try {
        data = await response.json()
      } catch {
        throw new ApiError(
          502,
          'The movie service returned an invalid response.'
        )
      }
      if (cache.size >= 500) cache.delete(cache.keys().next().value)
      cache.set(key, { data, expires: now() + ttl })
      return data
    }).finally(() => pending.delete(key))
    pending.set(key, promise)
    return promise
  }
  function normalize(item, mediaType) {
    return {
      id: item.id,
      key: `${mediaType}:${item.id}`,
      mediaType,
      title: item.title || item.name || 'Untitled',
      overview: item.overview || '',
      year: (item.release_date || item.first_air_date || '').slice(0, 4),
      posterPath: item.poster_path || null,
      backdropPath: item.backdrop_path || null,
      genreIds: item.genre_ids || item.genres?.map((genre) => genre.id) || [],
      genres: item.genres || [],
      popularity: item.popularity || 0,
    }
  }
  function type(value) {
    if (!['movie', 'tv'].includes(value))
      throw new ApiError(400, 'Choose movie or tv.')
    return value
  }
  return async function api(req, res, next) {
    const url = new URL(req.url, 'http://localhost')
    if (!url.pathname.startsWith('/api/')) return next?.()
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    try {
      if (req.method !== 'GET')
        throw new ApiError(405, 'Only GET requests are supported.')
      let result
      if (url.pathname === '/api/genres') result = genres
      else if (url.pathname === '/api/genre-feed') {
        const genre = genres.find(
          (item) => item.slug === url.searchParams.get('genre')
        )
        const mode = url.searchParams.get('type') || 'all'
        if (!genre || !['all', 'movie', 'tv'].includes(mode))
          throw new ApiError(400, 'Invalid genre or type.')
        const types = (mode === 'all' ? ['movie', 'tv'] : [mode]).filter(
          (value) => genre[value]
        )
        const feeds = await Promise.all(
          types.map(async (mediaType) => {
            const data = await tmdb(`discover/${mediaType}`, {
              with_genres: String(genre[mediaType]),
              page: '1',
              sort_by: 'popularity.desc',
              include_adult: 'false',
            })
            return {
              mediaType,
              total: data.total_results,
              results: data.results
                .filter((item) => !item.adult)
                .map((item) => normalize(item, mediaType)),
            }
          })
        )
        const results = []
        for (let index = 0; index < 20; index++)
          for (const feed of feeds)
            if (feed.results[index]) results.push(feed.results[index])
        result = {
          results: results.slice(0, 20),
          totalResults: feeds.reduce((sum, feed) => sum + feed.total, 0),
          counts: Object.fromEntries(
            feeds.map((feed) => [feed.mediaType, feed.total])
          ),
        }
      } else if (
        url.pathname === '/api/popular' ||
        url.pathname === '/api/discover'
      ) {
        const mediaType = type(url.searchParams.get('type') || 'movie')
        const pageText = url.searchParams.get('page') || '1'
        if (
          !/^\d+$/.test(pageText) ||
          Number(pageText) < 1 ||
          Number(pageText) > 500
        )
          throw new ApiError(400, 'Page must be between 1 and 500.')
        const params = { page: pageText, include_adult: 'false' }
        let path = `${mediaType}/popular`
        if (url.pathname === '/api/discover') {
          path = `discover/${mediaType}`
          params.sort_by = 'popularity.desc'
          const slug = url.searchParams.get('genre')
          if (slug) {
            const genre = genres.find((item) => item.slug === slug)
            if (!genre?.[mediaType])
              throw new ApiError(
                400,
                'This genre is not available for the selected type.'
              )
            params.with_genres = String(genre[mediaType])
          }
        }
        const data = await tmdb(path, params)
        const titles = data.results
          .filter((item) => !item.adult)
          .map((item) => normalize(item, mediaType))
        if (
          url.pathname === '/api/popular' &&
          url.searchParams.get('include_logos') === 'true'
        ) {
          const taxonomy = await tmdb(`genre/${mediaType}/list`, {}, 86_400_000)
          const genreNames = new Map(
            (taxonomy.genres || []).map((genre) => [genre.id, genre])
          )
          for (const title of titles) {
            title.genres = title.genreIds
              .map((id) => genreNames.get(id))
              .filter(Boolean)
          }
          await Promise.all(
            titles.slice(0, 5).map(async (title) => {
              try {
                const images = await tmdb(
                  `${mediaType}/${title.id}/images`,
                  { include_image_language: 'en,null' },
                  86_400_000
                )
                const logos = (images.logos || []).filter(
                  (logo) => logo.iso_639_1 === 'en' || !logo.iso_639_1
                )
                logos.sort(
                  (a, b) =>
                    Number(b.iso_639_1 === 'en') -
                      Number(a.iso_639_1 === 'en') ||
                    (b.vote_average || 0) - (a.vote_average || 0)
                )
                title.logoPath = logos[0]?.file_path || null
              } catch {
                title.logoPath = null
              }
            })
          )
        }
        result = {
          results: titles,
          page: data.page,
          totalResults: data.total_results,
          totalPages: Math.min(data.total_pages, 500),
        }
      } else {
        const match = url.pathname.match(/^\/api\/titles\/(movie|tv)\/(\d+)$/)
        if (!match || Number(match[2]) < 1)
          throw new ApiError(404, 'API endpoint not found.')
        const mediaType = match[1]
        const data = await tmdb(
          `${mediaType}/${match[2]}`,
          { append_to_response: 'credits,videos' },
          3_600_000
        )
        const trailer = (data.videos?.results || [])
          .filter(
            (video) =>
              video.site === 'YouTube' &&
              video.type === 'Trailer' &&
              /^[\w-]{11}$/.test(video.key)
          )
          .sort((a, b) => Number(b.official) - Number(a.official))[0]
        result = {
          ...normalize(data, mediaType),
          cast: (data.credits?.cast || []).map((person) => ({
            id: person.id,
            name: person.name,
            character: person.character,
            profilePath: person.profile_path,
          })),
          directors: [
            ...new Set(
              (data.credits?.crew || [])
                .filter((person) => person.job === 'Director')
                .map((person) => person.name)
            ),
          ],
          creators: (data.created_by || []).map((person) => person.name),
          runtime: data.runtime || data.episode_run_time?.[0] || null,
          seasons: data.number_of_seasons || null,
          episodes: data.number_of_episodes || null,
          rating: data.vote_average || null,
          status: data.status,
          trailerKey: trailer?.key || null,
        }
      }
      res.statusCode = 200
      res.end(JSON.stringify(result))
    } catch (error) {
      res.statusCode = error instanceof ApiError ? error.status : 502
      res.end(
        JSON.stringify({
          error:
            error instanceof ApiError
              ? error.message
              : 'The movie service is temporarily unavailable.',
        })
      )
    }
  }
}

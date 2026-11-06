import test from 'node:test'
import assert from 'node:assert/strict'
import { createTmdbApi } from './api.js'

async function request(api, url, method = 'GET') {
  let body
  const res = {
    statusCode: 200,
    setHeader() {},
    end(value) {
      body = JSON.parse(value)
    },
  }
  await api({ url, method }, res)
  return { status: res.statusCode, body }
}
const sample = {
  id: 12,
  title: 'Example movie',
  name: 'Example series',
  poster_path: '/poster.jpg',
  release_date: '2025-01-01',
  first_air_date: '2024-02-01',
  genre_ids: [28],
}
const response = (data) => ({ ok: true, json: async () => data })

test('popular requests are cached and coalesced, and expire', async () => {
  let calls = 0,
    time = 0
  const api = createTmdbApi({
    token: 'test-secret',
    now: () => time,
    fetchImpl: async (url) => {
      calls++
      assert.equal(new URL(url).pathname, '/3/movie/popular')
      assert.equal(new URL(url).searchParams.get('api_key'), 'test-secret')
      return response({
        results: [sample],
        page: 1,
        total_results: 1,
        total_pages: 1,
      })
    },
  })
  const results = await Promise.all([
    request(api, '/api/popular'),
    request(api, '/api/popular'),
  ])
  assert.equal(calls, 1)
  assert.equal(results[0].body.results[0].key, 'movie:12')
  assert(!JSON.stringify(results).includes('test-secret'))
  await request(api, '/api/popular')
  assert.equal(calls, 1)
  time = 900001
  await request(api, '/api/popular')
  assert.equal(calls, 2)
})

test('genre feed maps movie and TV genres and counts both', async () => {
  const paths = []
  const api = createTmdbApi({
    token: 'test',
    fetchImpl: async (url) => {
      const parsed = new URL(url)
      paths.push([parsed.pathname, parsed.searchParams.get('with_genres')])
      return response({
        results: [sample],
        page: 1,
        total_results: 100,
        total_pages: 5,
      })
    },
  })
  const { body } = await request(api, '/api/genre-feed?genre=action')
  assert.equal(body.totalResults, 200)
  assert.deepEqual(
    body.results.map((item) => item.key),
    ['movie:12', 'tv:12']
  )
  assert.deepEqual(paths, [
    ['/3/discover/movie', '28'],
    ['/3/discover/tv', '10759'],
  ])
  paths.length = 0
  await request(api, '/api/genre-feed?genre=horror')
  assert.deepEqual(paths, [['/3/discover/movie', '27']])
})

test('pagination is validated, forwarded, and capped', async () => {
  const api = createTmdbApi({
    token: 'test',
    fetchImpl: async (url) => {
      assert.equal(new URL(url).searchParams.get('page'), '2')
      return response({
        results: [],
        page: 2,
        total_results: 20001,
        total_pages: 1001,
      })
    },
  })
  assert.equal(
    (await request(api, '/api/discover?genre=action&type=movie&page=2')).body
      .totalPages,
    500
  )
  for (const url of [
    '/api/discover?page=501',
    '/api/discover?page=-1',
    '/api/discover?page=2.3',
    '/api/discover?type=unknown',
    '/api/discover?genre=horror&type=tv',
    '/api/unknown',
  ]) {
    assert((await request(api, url)).status >= 400)
  }
  assert.equal((await request(api, '/api/popular', 'POST')).status, 405)
})

test('details normalize credits and allow only valid YouTube trailers', async () => {
  const api = createTmdbApi({
    token: 'eyJ-test',
    fetchImpl: async (url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer eyJ-test')
      assert.equal(
        new URL(url).searchParams.get('append_to_response'),
        'credits,videos'
      )
      return response({
        ...sample,
        genres: [{ id: 28, name: 'Action' }],
        credits: {
          cast: [{ id: 1, name: 'Actor', character: 'Lead' }],
          crew: [
            { name: 'Director', job: 'Director' },
            { name: 'Writer', job: 'Writer' },
          ],
        },
        videos: {
          results: [
            { site: 'YouTube', type: 'Trailer', key: 'bad<script>' },
            {
              site: 'YouTube',
              type: 'Trailer',
              key: 'abcdefghijk',
              official: true,
            },
          ],
        },
      })
    },
  })
  const { body } = await request(api, '/api/titles/movie/12')
  assert.deepEqual(body.directors, ['Director'])
  assert.equal(body.cast[0].name, 'Actor')
  assert.equal(body.trailerKey, 'abcdefghijk')
})

test('missing credentials and upstream failures are safe and not cached', async () => {
  assert.equal((await request(createTmdbApi(), '/api/popular')).status, 503)
  let calls = 0
  const api = createTmdbApi({
    token: 'private-key',
    fetchImpl: async () => {
      calls++
      throw new Error('private-key')
    },
  })
  for (let i = 0; i < 2; i++) {
    const result = await request(api, '/api/popular')
    assert.equal(result.status, 502)
    assert(!JSON.stringify(result).includes('private-key'))
  }
  assert.equal(calls, 2)
  for (const status of [404, 429, 401]) {
    const failing = createTmdbApi({
      token: 'test',
      fetchImpl: async () => ({ ok: false, status }),
    })
    assert.equal(
      (await request(failing, '/api/titles/movie/12')).status,
      status === 401 ? 502 : status
    )
  }
})

test('carousel logos prefer English artwork, use caching, and tolerate missing images', async () => {
  let imageCalls = 0
  const api = createTmdbApi({ token: 'test', fetchImpl: async url => {
    if (new URL(url).pathname.endsWith('/images')) {
      imageCalls++
      return response({ logos: [
        { file_path: '/neutral.png', iso_639_1: null, vote_average: 9 },
        { file_path: '/english.png', iso_639_1: 'en', vote_average: 5 },
        { file_path: '/french.png', iso_639_1: 'fr', vote_average: 10 },
      ] })
    }
    return response({ results: [sample], page: 1, total_results: 1, total_pages: 1 })
  } })
  const path = '/api/popular?type=movie&include_logos=true'
  assert.equal((await request(api, path)).body.results[0].logoPath, '/english.png')
  await request(api, path)
  assert.equal(imageCalls, 1)
  const unavailable = createTmdbApi({ token: 'test', fetchImpl: async url => {
    if (new URL(url).pathname.endsWith('/images')) throw new Error('Unavailable')
    return response({ results: [sample], page: 1, total_results: 1, total_pages: 1 })
  } })
  const result = await request(unavailable, path)
  assert.equal(result.status, 200)
  assert.equal(result.body.results[0].logoPath, null)
})

test('carousel resolves every genre, including genres outside homepage categories', async () => {
  let taxonomyCalls = 0
  const movieGenres = [
    { id: 16, name: 'Animation' },
    { id: 12, name: 'Adventure' },
    { id: 14, name: 'Fantasy' },
  ]
  const api = createTmdbApi({
    token: 'test',
    fetchImpl: async (url) => {
      const path = new URL(url).pathname
      if (path === '/3/genre/movie/list') {
        taxonomyCalls++
        return response({ genres: movieGenres })
      }
      if (path.endsWith('/images')) return response({ logos: [] })
      return response({
        results: [{ ...sample, genre_ids: [16, 12, 14] }],
        page: 1,
        total_results: 1,
        total_pages: 1,
      })
    },
  })
  const path = '/api/popular?type=movie&include_logos=true'
  const result = await request(api, path)
  assert.equal(result.status, 200)
  assert.deepEqual(result.body.results[0].genres, movieGenres)
  await request(api, path)
  assert.equal(taxonomyCalls, 1)
})

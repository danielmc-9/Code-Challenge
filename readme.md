# Code Challenge
### Daniel Mejer Christensen

## Development

```sh
nvm use
npm install
npm run dev
```

Add `API_KEY_THEMOVIEDB` to `.env` before starting the server (see `.env.example`). It accepts either a TMDB API key or an API read access token. The value is only read by the backend; do not prefix it with `VITE_`.

`npm run dev` runs Vite with the backend API middleware on the same port. `npm test` runs backend tests. `npm run build` creates the frontend production build, and `npm run preview` serves it with the API for local verification.

For production, run `npm run build` followed by `npm start` on a Node 24 host, with `API_KEY_THEMOVIEDB` set in the host environment. The server serves both the compiled frontend and API, supports direct route visits, and listens on `PORT` (default 3000). A static-only deployment will not run this backend.

## Structure

- `src/App.jsx` defines the routes.
- `src/pages/MainPage/` contains the home page and its carousel styles.
- `src/pages/MoviesPage/`, `SeriesPage/`, `GenrePage/`, `TitlePage/`, `FavoritesPage/`, and `NotFoundPage/` contain the other pages.
- `src/components/` contains shared UI, with CSS next to each component.
- `src/layouts/AppLayout.jsx` contains the shared navigation and page outlet.
- `src/context/LibraryContext.jsx` manages saved favorites in localStorage (no account required).
- `src/data/genres.js` maps the requested genres to TMDB movie/series categories.
- `src/hooks/useApi.js` handles cancellable requests and retries.
- `server/api.js` validates requests, calls TMDB, and caches responses.
- `src/styles/global.css` contains global styles and shared design tokens.
- `public/assets/` contains the shared SVG icons.

## Routes

| URL | Page |
| --- | --- |
| `/` | Main / front page |
| `/movies` | Movies |
| `/series` | Series |
| `/favorites` | My Favorites |
| `/genres/:genreSlug?type=movie&page=1` | Paginated genre list (type can also be `tv`) |
| `/movies/:id` | Movie details |
| `/series/:id` | Series details |

Unknown URLs show a not-found page. The included production server handles the SPA fallback.

## TMDB behavior

- The carousel uses the first five entries from `GET /movie/popular`. `GET /genre/movie/list` resolves all of their genres, and `GET /movie/{id}/images` supplies title logos, preferring English artwork, then language-neutral artwork. Missing logos fall back to the title text.
- Each genre row shows up to 20 titles from the first discovery results page. Home alternates movies and series when both categories exist; Movies and Series pages show their respective feeds. Rows scroll horizontally on all screen sizes.
- Genre rows and paginated lists use `GET /discover/movie` and `GET /discover/tv`, filtered by genre and sorted by popularity.
- Action maps to TV's Action & Adventure; War maps to War & Politics. Thriller, Romance, and Horror have no matching TV genre and remain movie-only.
- Counts come from TMDB's `total_results`, summed across media types for mixed Home rows. Genre pages show one media type at a time and respect the 500-page browsing limit.
- Details use `GET /movie/{id}` or `GET /tv/{id}` with `append_to_response=credits,videos`, so credits and videos are included in the same request. Pages show the overview, year, genres, available runtime and rating, cast and character names, movie directors, or series creators and season/episode counts. 
- Trailers use the returned YouTube key in an embedded player, preferring official trailers. Unavailable trailers are omitted.
- Images load directly from TMDB's image CDN: posters at `w500`, backdrops at `w1280`, actor portraits at `w185`, and carousel logos at `original`. Poster and backdrop paths come from popular/discovery/details responses; actor portrait paths come from credits.
- Favorites store compact title records under `my-favorites`, keyed by both media type and ID. Changes update immediately and persist in localStorage when available; otherwise they remain in memory for the current session.
- Catalogue responses are cached for 15 minutes, details for one hour, and genre lists and carousel image responses for one day, with a maximum of 500 entries per server process. Concurrent identical requests share one upstream call; at most four TMDB requests run at once. Cache resets on restart and is not shared between server instances.
- Missing imagery, empty results, and API failures have fallback or retry states.

Backend endpoints used by the site: `GET /api/popular?type=movie&include_logos=true`, `GET /api/genre-feed?genre=:slug&type=all|movie|tv`, `GET /api/discover?genre=:slug&type=movie|tv&page=:page`, and `GET /api/titles/:type/:id` (`type` is `movie` or `tv`).

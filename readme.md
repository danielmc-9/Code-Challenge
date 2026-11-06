# Code Challenge
### Daniel Mejer Christensen

## Development

```sh
nvm use
npm install
npm run dev
```

Add `API_KEY_THEMOVIEDB` to `.env` (see `.env.example`). It accepts either a TMDB API key or an API read access token. The value is only read by the backend; do not prefix it with `VITE_`.

`npm run dev` runs Vite with the backend API middleware on the same port. `npm test` runs backend tests. `npm run build` creates the frontend production build, and `npm run preview` serves it with the API for local verification.

For production, run `npm run build` followed by `npm start` on a Node 24 host, with `API_KEY_THEMOVIEDB` set in the host environment. The server serves both the compiled frontend and API, supports direct route visits, and listens on `PORT` (default 3000). A static-only deployment will not run this backend.

## Structure

- `src/App.jsx` defines the routes.
- `src/pages/MainPage/` contains the home page and its carousel styles.
- `src/pages/MoviesPage/`, `SeriesPage/`, and `FavoritesPage/` contain the other pages.
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
| `/` | Main page |
| `/movies` | Movies |
| `/series` | Series |
| `/favorites` | My Favorites |
| `/genres/:genreSlug?type=movie&page=1` | Paginated genre list (type can also be `tv`) |
| `/movies/:id` | Movie details |
| `/series/:id` | Series details |

Unknown URLs show a not-found page. The included production server handles the SPA fallback.

## TMDB behavior

- The carousel uses the first five entries from `GET /movie/popular`.
- Each home genre feed shows up to eight titles, alternating movies and series when both categories exist. Movies and Series pages show their respective feeds.
- Action maps to TV's Action & Adventure; War maps to War & Politics. Thriller, Romance, and Horror have no matching TV genre and remain movie-only.
- Counts come from TMDB's `total_results`. Genre pages show one media type at a time and respect TMDB's 500-page browsing limit.
- Details include credits and available YouTube trailers. Series show creators and series-level directing credits where provided.
- Favorites store compact title records under `wexo-favorites-v2`, keyed by both media type and ID. Old placeholder favorites are not migrated.
- Catalogue responses are cached for 15 minutes, details for one hour, with a maximum of 500 entries per server process. Concurrent identical requests share one upstream call; at most four TMDB requests run at once. Cache resets on restart and is not shared between server instances.
- Missing imagery, empty results, API failures, and unavailable trailers have fallbacks. Images load directly from TMDB's image CDN.

Backend endpoints: `GET /api/genres`, `/api/popular`, `/api/genre-feed`, `/api/discover`, and `/api/titles/:type/:id`.

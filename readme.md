Code Challenge

## Development

```sh
nvm use
npm install
npm run dev
```

`npm run build` creates the production build. `npm run preview` serves it locally.

## Structure

- `src/App.jsx` defines the routes.
- `src/pages/MainPage/` contains the home page and its carousel styles.
- `src/pages/MoviesPage/`, `SeriesPage/`, and `FavoritesPage/` contain the other pages.
- `src/components/` contains shared UI, with CSS next to each component.
- `src/layouts/AppLayout.jsx` contains the shared navigation and page outlet.
- `src/context/LibraryContext.jsx` manages saved favorites and the title dialog.
- `src/data/catalogue.js` contains the placeholder titles and genres.
- `src/styles/global.css` contains global styles and shared design tokens.
- `public/assets/` contains the shared SVG icons.

## Routes

| URL | Page |
| --- | --- |
| `/` | Main page |
| `/movies` | Movies |
| `/series` | Series |
| `/favorites` | My Favorites |

Unknown URLs show a not-found page. For production hosting, configure an SPA fallback to `index.html` so direct visits and refreshes work on all routes.

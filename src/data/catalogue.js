export const genres = [
  'Action',
  'Comedy',
  'Thriller',
  'War',
  'Romance',
  'Drama',
  'Crime',
  'Documentary',
  'Horror',
]
export const catalogue = genres.flatMap((genre) =>
  Array.from({ length: 8 }, (_, index) => ({
    id: `${genre}-${index}`,
    genre,
    title: 'Movie Title',
    type: 'Movie',
  }))
)
export const description =
  'Short description of the featured title goes here. Add something compelling about the plot or theme.'

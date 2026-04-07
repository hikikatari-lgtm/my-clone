import { MovieCardGrid } from "@/components/MovieCardGrid";
import { fetchMovies } from "@/lib/notion";

export const revalidate = 60;

export default async function MoviesPage() {
  const movies = await fetchMovies().catch((e) => {
    console.error("Failed to fetch movies:", e);
    return [];
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <MovieCardGrid movies={movies} />
    </main>
  );
}

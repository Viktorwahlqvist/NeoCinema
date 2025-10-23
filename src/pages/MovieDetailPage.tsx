import React from "react";
import useFetch from "../hook/useFetch";
import Trailer from "../components/Trailer";
import { Movie } from "../types/movie";
import MovieTags from "../components/MovieTags";

export default function MovieDetailPage() {
  const {
    data: movies,
    isLoading: movieLoading,
    error: movieError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch<Movie[]>("api/moviesWithGenres?id=1");
  const {
    data: screenings,
    isLoading: screeningLoading,
    error: screeningError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch("api/movieScreenings?movie_id=1&LIMIT=10");

  const movie = movies?.[0] ?? null;

  if (!movie) return <p>No movie found</p>;
  return (
    <main>
      {movieError && <p>Error loading movie</p>}
      {movieLoading && <p>Movie loading...</p>}
      {movie && (
        <>
          <Trailer videoId={movie.info.trailer} title={movie.title} />{" "}
          <MovieTags
            actors={movie.info.actors}
            ageLimit={movie.info.ageLimit}
            duration={movie.info.duration}
            genrer={movie.genres}
          />
        </>
      )}
    </main>
  );
}

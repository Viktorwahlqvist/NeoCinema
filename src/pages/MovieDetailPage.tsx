import React from "react";
import useFetch from "../hook/useFetch";
import Trailer from "../components/Trailer";
import { Movie } from "../types/movie";
import MovieTags from "../components/MovieTags";
import MovieDescription from "../components/MovieDescription";
import { useParams } from "react-router-dom";
import { Stack } from "react-bootstrap";

export default function MovieDetailPage() {
  const { id } = useParams();

  if (typeof id === "undefined") {
    return <p>Loading movie...</p>;
  }

  const {
    data: movies,
    isLoading: movieLoading,
    error: movieError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch<Movie[]>(`/api/moviesWithGenres?id=${id}`);
  const {
    data: screenings,
    isLoading: screeningLoading,
    error: screeningError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch(`/api/movieScreenings?movie_id=${id}&limit=10`);

  const movie = movies?.[0] ?? null;

  console.log(screenings);

  if (!movie) return <p>No movie found</p>;
  return (
    <Stack gap={3}>
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
          <MovieDescription
            title={movie.title}
            description={movie.info.description}
            director={movie.info.director}
          />
        </>
      )}
    </Stack>
  );
}

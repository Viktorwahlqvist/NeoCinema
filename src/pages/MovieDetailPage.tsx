import React from "react";
import useFetch from "../hook/useFetch";
import Trailer from "../components/Trailer";
import { Movie } from "../types/movie";
import MovieTags from "../components/MovieTags";
import MovieDescription from "../components/MovieDescription";
import { useParams } from "react-router-dom";
import { Stack } from "react-bootstrap";
import DateTimeSelector from "../components/DateTimeSelector";
import "../styles/date-time-selector.scss";
import MovieReviews from "../components/MovieReviews";

export default function MovieDetailPage() {
  const { id } = useParams();
  const movieId = id;

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

  console.log(movie, screenings);

  if (!movie) return <p>No movie found</p>;

  return (
    <div className="container py-3">
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

<div className="container my-4">
  <div className="row align-items-start">
    <div className="col-lg-7 col-md-12 mb-4">
      <DateTimeSelector
        movieId={Number(id)}
        limit={50}
        onSelect={(screening) => console.log("Vald visning:", screening)}
      />
    </div>

    <div className="col-lg-5 col-md-12">
      <MovieReviews movie={movie} />
    </div>
  </div>
</div>

    </div>
  );
}

import React from "react";
import useFetch from "../hook/useFetch";

export default function MovieDetailPage() {
  const {
    data: movie,
    isLoading: movieLoading,
    error: movieError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch("api/moviesWithGenres?id=1");
  const {
    data: screenings,
    isLoading: screeningLoading,
    error: screeningError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch("api/movieScreenings?movie_id=1");
  console.log(movie, screenings);

  return <div>MovieDetailPage</div>;
}

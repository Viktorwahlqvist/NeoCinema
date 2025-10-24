import React from "react";
import useFetch from "../hook/useFetch";
import DateTimeSelector from "../components/DateTimeSelector";
import "../styles/date-time-selector.scss";


export default function MovieDetailPage() {
const movieId = 1;

  const {
    data: movie,
    isLoading: movieLoading,
    error: movieError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch("api/moviesWithGenres?id=1");
  const {
    data: screenings,
    isLoading: screeningLoading,
    error: screeningError /*Hårdkodad id för att fixa sidan ändra senare */,
  } = useFetch("api/movieScreenings?movie_id=1?limit=12");
  console.log(movie, screenings);



  return <div className="container py-3">
      {/* ... övrigt innehåll: bild, text, recensioner ... */}

      {/* Sektionen är isolerad i egen komponent */}
      <DateTimeSelector
        movieId={movieId}
        limit={50}
        onSelect={(screening) => {
          // valfritt: här kan du sätta state eller navigera vidare till stolval
          console.log("Vald visning:", screening);
        }}
      />
    </div>;
}





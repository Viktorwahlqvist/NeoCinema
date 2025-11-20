import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Stack, Spinner } from "react-bootstrap";
import useFetch from "../hook/useFetch";
import Trailer from "../components/Trailer";
import MovieTags from "../components/MovieTags";
import MovieDescription from "../components/MovieDescription";
import DateTimeSelector from "../components/DateTimeSelector";
import MovieReviews from "../components/MovieReviews";
import "../Styles/Date-time-selector.scss";
import { Movie } from "../types/movie";

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Visa text/”no movie” först efter 4s
  const [showDelay, setShowDelay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowDelay(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const { data: movies, isLoading: movieLoading } =
    useFetch<Movie[]>(`/api/moviesWithGenres?id=${id}`);
  const movie = movies?.[0] ?? null;


  const LoadingUI = (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-light"
      style={{ minHeight: "60vh" }}
    >
      <Spinner animation="border" role="status" />
      {showDelay && <p className="mt-3 neon-text-booking">Laddar film...</p>}
    </div>
  );

 
  if (movieLoading) return LoadingUI;

  if (!movie) return showDelay ? <p className="text-center mt-5 text-light">No movie found</p> : LoadingUI;

  return (
    <div className="container py-3">
      <Stack gap={3}>
        <Trailer videoId={movie.info.trailer} title={movie.title} />
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
      </Stack>

      <Stack
        direction="horizontal"
        gap={3}
        className="movie-layout__stack flex-column flex-lg-row my-4"
      >
        <div className="flex-grow-1 date-time-container">
          <DateTimeSelector
            movieId={Number(id)}
            limit={50}
            onSelect={(s) => navigate(`/booking/${s.screening_id}`)}
          />
        </div>
        <div className="reviews-container">
          <MovieReviews movie={movie} />
        </div>
      </Stack>
    </div>
  );
}
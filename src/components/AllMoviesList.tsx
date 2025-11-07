import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie } from "../types/movie";
import FilterBtn from "../components/filter/FilterBtn";
import "./Style/allmovieslist.scss";
import { Col, Row } from "react-bootstrap";

export interface ScreeningsInfo extends Omit<Movie, "id"> {
  auditoriumName: string;
  screeningId: number;
  startTime: string;
  movieId: string;
}

interface AllMoviesListPRops {
  movies: ScreeningsInfo[];
}

export default function AllMoviesList({ movies }: AllMoviesListPRops) {
  const navigate = useNavigate();

  return (
    <>
      {movies.map((movie, index) => (
        <Row
          key={index}
          className="flex-md-row align-items-md-center gap-md-3 my-5"
        >
          <Col
            xs={2}
            md={1}
            lg={1}
            className="d-none d-md-flex justify-content-end ms-md-2"
          >
            <p>{movie.startTime.slice(11, 16)}</p>
          </Col>
          <Col xs={12} md={3} lg={4}>
            <img
              className="img-fluid mb-4 mb-md-0 text-center"
              src={movie.info.desktopImg}
              alt={`Picture of movie ${movie.title}`}
            />
          </Col>
          <Col>
            <Row className="d-flex justify-content-center text-center">
              <p>{movie.title}</p>
              <p>{movie.genres.sort().join("/")}</p>
              <p>{`${Math.floor(movie.info.duration / 60)}h ${
                movie.info.duration % 60
              }m`}</p>
            </Row>
          </Col>
          <Col
            xs={6}
            md={2}
            lg={2}
            className="text-mobil d-flex flex-column flex-md-row align-items-start align-items-md-center text-center"
          >
            <p>Salong {movie.auditoriumName}</p>
            <p className=" d-md-none">{movie.startTime.slice(11, 16)}</p>
          </Col>

          <Col
            xs={12}
            md={2}
            lg={2}
            className="d-flex flex-row flex-md-column gap-3 my-4"
          >
            <FilterBtn
              className="flex-fill flex-md-grow-0 mx-2"
              btnName={["Mer info"]}
              onClick={() => navigate(`/movie/${movie.movieId}`)}
            />
            <FilterBtn
              className="flex-fill flex-md-grow-0 mx-2"
              btnName={["Köp biljetter"]}
              onClick={() => navigate(`/booking/${movie.screeningId}`)}
            />
          </Col>
          {index !== movies.length - 1 && <hr className="hr-line" />}
        </Row>
      ))}
    </>
  );
}

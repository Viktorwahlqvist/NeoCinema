import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie } from "../types/movie";
import FilterBtn from "../components/filter/FilterBtn";
import "./allmovieslist.scss";
import { Col, Row } from "react-bootstrap";

export interface ScreeningsInfo extends Omit<Movie, "id"> {
  auditoriumName: string;
  screeningId: number;
  startTime: string;
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
          className="align-items-center gap-3 my-5 flex-column flex-md-row"
        >
          <Col
            xs={2}
            md={1}
            lg={1}
            className="d-flex justify-content-end ms-md-2"
          >
            <p>{movie.startTime.slice(11, 16)}</p>
          </Col>
          <Col xs={11} md={3} lg={4}>
            <img className="img-fluid" src={movie.info.desktopImg} alt="" />
          </Col>
          <Col xs={12} md={2} lg={2}>
            <Row className="d-flex justify-content-center text-center">
              <p>{movie.title}</p>
              <p>{movie.genres.join("/")}</p>
              {`${Math.floor(movie.info.duration / 60)}h ${
                movie.info.duration % 60
              }m`}
            </Row>
          </Col>
          <Col xs={3} md={2} lg={2}>
            <p>Salong {movie.auditoriumName}</p>
          </Col>
          <Col xs={6} md={2} lg={2}>
            <FilterBtn
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

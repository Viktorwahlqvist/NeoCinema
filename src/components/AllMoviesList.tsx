import React from "react";
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
  return (
    <>
      {movies.map((movie, index) => (
        <Row key={index} className="align-items-center gap-3 my-5 ">
          <Col className="d-flex justify-content-end col-1 mx-5">
            <p>{movie.startTime.slice(11, 16)}</p>
          </Col>
          <Col>
            <img src={movie.info.desktopImg} alt="" />
          </Col>
          <Col>
            <Row className="d-flex justify-content-center text-center">
              <p>{movie.title}</p>
              <p>{movie.genres.join("/")}</p>
              {`${Math.floor(movie.info.duration / 60)}h ${
                movie.info.duration % 60
              }m`}
            </Row>
          </Col>
          <Col>
            <p>Salong {movie.auditoriumName}</p>
          </Col>
          <Col>
            <FilterBtn
              btnName={["Köp biljetter"]}
              onClick={() => {} /*useNavigate senare med screeningId */}
            />
          </Col>
          {index !== movies.length - 1 && <hr className="hr-line" />}
        </Row>
      ))}
    </>
  );
}

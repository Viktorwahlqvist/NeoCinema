import React from 'react';
import { Movie, MovieInfo } from '../types/movie';

type PosterProps = Pick<Movie, "title"> & Pick<MovieInfo, "mobileImg">;

export default function PosterBox({ mobileImg, title }: PosterProps) {
  return (
    <div className="movie-poster-box">
      <img
        src={mobileImg || "/placeholder.jpg"}
        alt={title}
        className="movie-poster"
      />
    </div>
  );
}

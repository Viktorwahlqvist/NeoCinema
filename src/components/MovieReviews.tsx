import React from "react";
import { Card } from "react-bootstrap";
import type { Movie, Review } from "../types/movie";
import "../Styles/MovieReviews.scss";


interface MovieReviewsProps {
  movie: Movie;
}

const reviewTemplate: Review = {
  source: "Expressen",
  text: "är en väldigt imponerande film. Den är mäktig, spännande, intensiv och otroligt välgjord med den absoluta skådespelareliten i Hollywood just nu.",
  rating: 5,
};

const MovieReviews: React.FC<MovieReviewsProps> = ({ movie }) => {
  const review: Review = {
    ...reviewTemplate,
    text: `${movie.title} ${reviewTemplate.text}`,
  };

  return (
    <div className="movie-reviews mt-4">
      <div className="review-card">
        <h3 className="review-title">{review.source}</h3>
        <p className="review-text">{review.text}</p>
        <div className="stars">
          {Array.from({ length: review.rating }).map((_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
      </div>
    </div>
  );

};

export default MovieReviews;


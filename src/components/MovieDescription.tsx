import React from "react";
import "./moviedescription.scss";

interface MovieDescriptionProps {
  title: string;
  description: string;
  director: string[] | string;
}

export default function MovieDescription({
  description,
  director,
  title,
}: MovieDescriptionProps) {
  return (
    <>
      <h1 className="movie-title">{title}</h1>
      <article className="descsription-container">
        <p className="movie-description">{description}</p>
        <p className="movie-director">
          {Array.isArray(director) ? director.join(" & ") : director}
        </p>
      </article>
    </>
  );
}

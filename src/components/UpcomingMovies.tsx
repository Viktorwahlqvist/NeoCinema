import React from "react";
import "./Style/UpcomingMovies.scss";

interface UpcomingMovie {
  id: number;
  title: string;
  screening: string;
  genre: string;
  coverArtUrl: string;
}

export default function UpcomingMovies() {
  const upcomingMovies: UpcomingMovie[] = [
    {
      id: 1,
      title: "MARIO GALAXY:",
      screening: "3 APR 2026",
      coverArtUrl: "/169glxy.png",
      genre: "Äventyr",
    },
    {
      id: 2,
      title: "MANDALORIAN:",
      screening: "22 MAJ 2026",
      coverArtUrl: "/169mandalorian.png",
      genre: "Sci-Fi",
    },
    {
      id: 3,
      title: "MASTERS OF THE UNIVERSE:",
      screening: "5 JUN 2026",
      coverArtUrl: "/169masters.png",
      genre: "Sci-Fi",
    },
    {
      id: 4,
      title: "ODDYSEY:",
      screening: "17 JUL 2026",
      coverArtUrl: "/169oddysey.png",
      genre: "Action",
    },
    {
      id: 5,
      title: "DUNE 3:",
      screening: "18 DEC 2026",
      coverArtUrl: "/169dune.png",
      genre: "Sci-Fi",
    },
    {
      id: 6,
      title: "STAR WARS THE NEW ORDER:",
      screening: "TBA 2026",
      coverArtUrl: "/169starwars.png",
      genre: "Sci-Fi",
    },

  ];

  return (
    <div className="upcoming-movies">
      <h2 className="upcoming-movies__title mt-2 mb-4">Kommande filmer</h2>

      <div className="upcoming-movies__container">
        {/* Scrollable container for movies */}
        <div className="upcoming-movies__scroll-container">
          {upcomingMovies.map((movie) => (
            <div key={movie.id} className="upcoming-movies__card">
              <div className="upcoming-movies__poster">
                <img
                  src={movie.coverArtUrl}
                  alt={movie.title}
                  className="upcoming-movies__image"
                />
              </div>

              <div className="upcoming-movies__info">
                <p className="upcoming-movies__premiere">{movie.screening}</p>
                <p className="upcoming-movies__genre">{movie.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

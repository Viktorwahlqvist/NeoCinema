import React from 'react';
import './UpcomingMovies.scss';

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
      title: 'Ballerina:',
      screening: '19.00 - 3 DEC',
      coverArtUrl: '/ballerinaCard.png',
      genre: 'Action',
    },
    {
      id: 2,
      title: 'Oldboy:',
      screening: '21.00 - 3 DEC',
      coverArtUrl: '/oldBoyCard.png',
      genre: 'Thriller',
    },
    {
      id: 3,
      title: 'Tron:',
      screening: '20:00 - 4 DEC',
      coverArtUrl: '/tronCard.png',
      genre: 'Sci-Fi',
    },
  ];

  return (
    <div className="upcoming-movies">
      <h2 className="upcoming-movies__title">Kommande filmer</h2>

      <div className="upcoming-movies__container">
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
              <p className="upcoming-movies__movie-title">{movie.title}</p>
              <p className="upcoming-movies__genre">{movie.genre}</p>
              <p className="upcoming-movies__premiere">{movie.screening}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import './Style/UpcomingMovies.scss';

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
      title: 'Star Shrek:',
      screening: 'JAN 2028',
      coverArtUrl: '/starShrek.jpg',
      genre: 'Sci-Fi',
    },
    {
      id: 2,
      title: 'Zucc:',
      screening: 'FEB 2028',
      coverArtUrl: '/zucc.png',
      genre: 'Drama',
    },
    {
      id: 3,
      title: 'Zoo:',
      screening: 'JUN 2028',
      coverArtUrl: '/zoo.jpg',
      genre: 'Family',
    },
    {
      id: 4,
      title: 'Paddington:',
      screening: 'OKT 2028',
      coverArtUrl: '/paddington.jpg',
      genre: 'Action',
    },
    {
      id: 5,
      title: 'Attack of..:',
      screening: 'DEC 2028',
      coverArtUrl: '/devitos.jpg',
      genre: 'Horror',
    },
    {
      id: 6,
      title: 'Blue fast:',
      screening: 'DEC 2028',
      coverArtUrl: '/blue.jpg',
      genre: 'Action',
    },
  ];

  return (
    <div className="upcoming-movies">
      <h2 className="upcoming-movies__title">Kommande premiärer</h2>

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
import Carousel from 'react-bootstrap/Carousel';
import type { Movie } from '../types/movie';
import '../styles/components/MovieCarousel.scss';


interface MovieCarouselProps {
  movies: Movie[];
}

export const MovieCarousel = ({ movies }: MovieCarouselProps) => {
  if (!movies.length) {
    return (
      <div className="movie-carousel">
        <p style={{ textAlign: 'center', color: '#00ffff' }}>Laddar filmer...</p>
      </div>
    );
  }

  return (
    <div className="movie-carousel">
      <Carousel fade interval={4000} controls={true} indicators={false}>
        {movies.map((movie) => (
          <Carousel.Item key={movie.id}>
            <img
              className="d-block w-100 carousel-img"
              src={movie.info.desktopImg || '/fallback-image.jpg'}
              alt={movie.title}
            />
            <Carousel.Caption>
              <h3>{movie.title}</h3>
              <p>{movie.info.description}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="genre-buttons">
        <button className="genre-btn">Action</button>
        <button className="genre-btn">Drama</button>
        <button className="genre-btn">Thriller</button>
        <button className="genre-btn">Sci/Fi</button>
      </div>
    </div>
  );
};

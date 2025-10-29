export interface MovieInfo {
  ageLimit: number;
  duration: number;
  mobileImg: string;
  desktopImg: string;
  description: string;
  trailer: string;
  actors: string[];
  director: string | string[];
}

export interface Movie {
  id: number;
  title: string;
  info: MovieInfo;
  genres: string[];
}

export interface Review {
  source: string;
  text: string;
  rating: number; 
}

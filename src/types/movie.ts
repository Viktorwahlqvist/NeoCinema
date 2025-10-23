export interface MovieInfo {
  ageLimit: number;
  duration: number;
  mobileImg: string;
  desktopImg: string;
  description: string;
  trailer: string;
  actors: string[];
}

export interface Movie {
  id: number;
  title: string;
  info: MovieInfo;
  genres: string[];
}

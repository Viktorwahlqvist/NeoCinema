export type Screening = {
  screening_id: number;
  movie_id: number;
  auditorium: string;
  start_time: string;
};

export type Props = {
  movieId: number;
  limit?: number;
  onSelect?: (screening: Screening) => void;
};

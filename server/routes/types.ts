export type SeatStatus = 'available' | 'taken';

export interface Seat {
  auditoriumId: number;
  auditoriumName: string;
  rowNum:       number;
  seatNum:      number;
  status:       SeatStatus;
  updatedAt:    string;          // ISO-8601
}

export interface AuditoriumShape {
  id:        number;
  name:      string;
  seatShape: number[];           // [8,9,10 …]
}

/* PUT /auditoriums/:id/seats  body */
export interface SeatPutBody {
  row:    number;
  seat:   number;
  action: 'reserve' | 'release';
}
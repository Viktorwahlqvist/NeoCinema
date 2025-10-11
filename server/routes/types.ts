export type SeatStatus = 'available' | 'taken';

export interface Seat {
  auditoriumsId: number;
  auditoriumsName: string;
  rowNum:       number;
  seatNum:      number;
  status:       SeatStatus;
  updatedAt:    string;          // ISO-8601
}

export interface auditoriumsShape {
  id:        number;
  name:      string;
  seatShape: number[];           // [8,9,10 …]
}

/* PUT /auditoriumss/:id/seats  body */
export interface SeatPutBody {
  row:    number;
  seat:   number;
  action: 'reserve' | 'release';
}
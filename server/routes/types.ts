export type SeatStatus = 'available' | 'taken';

export interface Seat {
  auditoriumsId: number;
  auditoriumsName: string;
  rowNum:       number;
  seatNum:      number;
  status:       SeatStatus;
  updatedAt:    string;         
}

export interface auditoriumsShape {
  id:        number;
  name:      string;
  seatShape: number[];           
}

/* PUT /auditoriumss/:id/seats  Vad som ska in i body*/
export interface SeatPutBody {
  row:    number;
  seat:   number;
  action: 'reserve' | 'release';
}
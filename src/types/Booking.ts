import { RowDataPacket } from "mysql2";
export type TicketLine = {
  ticketType: string;
  price: number;
  qty: number;
};

export type Booking = {
  bookingId: number;
  bookingNumber: string;
  date: string;
  movieTitle: string;
  screeningTime: string;
  auditoriumName: string;
  email: string;
  totalPrice: string | number;
  tickets: TicketLine[];
  seatNumbers: string[]; 
};

export interface Seat {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
  auditoriumName: string;
  screeningId: number;
  start_time: string;
}
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
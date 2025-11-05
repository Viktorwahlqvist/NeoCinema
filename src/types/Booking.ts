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
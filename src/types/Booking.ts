import { RowDataPacket } from "mysql2";
export interface Booking {
  bookingId: number;
  bookingNumber: string;
  email: string;
  movieTitle: string;
  screeningTime: string;
  auditoriumName: string;
  totalPrice: number;
  tickets?: {
    ticketType: string;
    quantity: number;
    price: number;
  }[];
}

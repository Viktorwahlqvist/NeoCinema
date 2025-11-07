
import type { RowDataPacket } from "mysql2/promise";
      
export type Seat = {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
};

export type SeatInput = { seatId: number; ticketType: number };

export interface auditoriumsShape {
  id:        number;
  name:      string;
  seatShape: number[];           
}

export interface SeatPutBody {
  row:    number;
  seat:   number;
  action: 'reserve' | 'release';
}


export type TicketType = "Barn" | "Pensionär" | "Vuxen";

export interface PriceLine extends RowDataPacket {
  bookingId: number;
  seatId: number;
  ticket_type: TicketType;
  price_kr: number;           
}

export interface PriceTotals extends RowDataPacket {
  bookingId: number;
  tickets_count: number;
  total_price_kr: number;       
}

export interface PriceByType extends RowDataPacket {
  bookingId: number;
  ticket_type: TicketType;
  qty: number;
  subtotal_kr: number;       
} 



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
export type SeatStatus = 'available' | 'taken';
import type { RowDataPacket } from "mysql2/promise";

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

// src/types/Booking.ts

// 1. Definiera den nästlade typen för en biljett-rad
export type TicketLine = {
  ticketType: string;
  price: number;
  qty: number; // Se till att den heter 'qty' som i din databas-respons
};

// 2. Uppdatera din huvudsakliga Booking-typ
export type Booking = {
  bookingId: number;
  bookingNumber: string;
  date: string;
  movieTitle: string;
  screeningTime: string;
  auditoriumName: string;
  email: string;
  totalPrice: string | number; // Kan vara antingen
  tickets: TicketLine[]; // <-- Använder typen ovan
  seatNumbers: string[]; // <-- Det nya fältet för stolar
};
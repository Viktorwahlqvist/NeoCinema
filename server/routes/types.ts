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

/* PUT /auditoriumss/:id/seats  Vad som ska in i body*/
export interface SeatPutBody {
  row:    number;
  seat:   number;
  action: 'reserve' | 'release';
}

// --- Pricing ---

export type TicketType = "Barn" | "Pensionär" | "Vuxen";

export interface PriceLine extends RowDataPacket {
  bookingId: number;
  seatId: number;
  ticket_type: TicketType;
  price_kr: number;             // funkar tack vare decimalNumbers: true
}

export interface PriceTotals extends RowDataPacket {
  bookingId: number;
  tickets_count: number;
  total_price_kr: number;       // funkar tack vare decimalNumbers: true
}

export interface PriceByType extends RowDataPacket {
  bookingId: number;
  ticket_type: TicketType;
  qty: number;
  subtotal_kr: number;          // funkar tack vare decimalNumbers: true
}



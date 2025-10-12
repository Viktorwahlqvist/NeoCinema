import type { RowDataPacket } from 'mysql2';

export type TicketType = 'Barn' | 'Pensionär' | 'Vuxen';

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
  qty: number;           // eller "antal" om du döpte kolumnen så i vyn
  subtotal_kr: number;
}

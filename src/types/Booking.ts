export interface Booking {
  bookingId: number;
  rNumber: string;
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


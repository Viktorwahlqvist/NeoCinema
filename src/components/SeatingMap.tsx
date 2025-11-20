import React from 'react';
import { Seat } from '../types/Booking';

interface SeatingMapProps {
  seats: Seat[];
  selectedSeats: number[];
  handleSeatClick: (seatId: number, seatStatus: "available" | "booked") => void;
}

export default function SeatingMap({ seats, selectedSeats, handleSeatClick }: SeatingMapProps) {
  return (
    <div className="seating-area">
      {Object.entries(
        seats.reduce((acc: Record<number, Seat[]>, seat) => {
          if (!acc[seat.row_num]) acc[seat.row_num] = [];
          acc[seat.row_num].push(seat);
          return acc;
        }, {})
      )
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([row, rowSeats]) => (
          <div key={row} className="seat-row">
            {rowSeats
              .sort((a, b) => a.seat_num - b.seat_num)
              .map((seat) => (
                <button
                  key={seat.seatId}
                  className={`seat ${seat.seatStatus === "booked" ? "booked" : ""
                    } ${selectedSeats.includes(seat.seatId) ? "selected" : ""
                    }`}
                  onClick={() =>
                    handleSeatClick(seat.seatId, seat.seatStatus)
                  }
                >
                  {seat.seatId}
                </button>
              ))}
          </div>
        ))}
    </div>
  );
}

import React from 'react';

interface BookingButtonProps {
  isBookDisabled: boolean;
  handleBooking: () => void;
  isInvalidEmail: boolean;
  totalTickets: number;
}

export default function BookingButton({ isBookDisabled, handleBooking, isInvalidEmail, totalTickets }: BookingButtonProps) {

  return (
    <button
      className={`btn neo-btn mt-4 ${isBookDisabled || isInvalidEmail ? "neo-btn--disabledEmail" : ""
        }`}
      onClick={handleBooking}
      disabled={isBookDisabled || isInvalidEmail}
    >
      Boka {totalTickets} biljett(er)
    </button>
  );
}

import { useState, useEffect } from "react";
import { Seat } from "../types/Booking";
import findAdjacentSeats from "../utils/findAdjacentSeats";
import emailRegex from "../utils/emailValidate";

//useSeatSelection – handles auto-selecting seats and manual seat clicks

export function useSeatSelection(seats: Seat[], totalTickets: number) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatError, setSeatError] = useState<string | null>(null);
  
  // Auto-select seats whenever seats or ticket count changes

  useEffect(() => {
    setSeatError(null);

    if (totalTickets === 0) {
      setSelectedSeats([]);
      return;
    }
    // If wrong number of seats selected, find best adjacent seats
    if (selectedSeats.length !== totalTickets) {
      const best = findAdjacentSeats(seats, totalTickets);
      setSelectedSeats(best);

      if (best.length === 0 && seats.length > 0) {
        setSeatError(
          `Kunde tyvärr inte hitta ${totalTickets} sammanhängande platser.`
        );
      }
    }
  }, [seats, totalTickets]);

  // Manual seat selection
  const handleSeatClick = (seatId: number, status: string) => {
    if (status === "booked" || !seats) return;

    setSeatError(null);
    
    // Try to find adjacent seats starting from clicked seat
    const best = findAdjacentSeats(seats, totalTickets, seatId);
    if (best.length === totalTickets) {
      setSelectedSeats(best);
    } else {
      setSeatError(
        `Kunde inte hitta ${totalTickets} platser i rad från den valda platsen.`
      );
      setSelectedSeats([]);
    }
  };

  return { selectedSeats, setSelectedSeats, seatError, handleSeatClick };
}

//useGuestEmail – handles guest email input and validation
export function useGuestEmail() {
  const [guestEmail, setGuestEmail] = useState("");

  // Update email state on input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestEmail(e.target.value);
  };

  // Check if email is valid
  const isValidEmail = guestEmail.trim() !== "" && emailRegex.test(guestEmail);

  return { guestEmail, setGuestEmail, handleEmailChange, isValidEmail };
}

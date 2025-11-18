import { Seat } from "../types/Booking";
/**
 * Finds a contiguous block of 'n' available seats.
 * If 'startSeatId' is provided, it tries to find a block adjacent to that seat.
 */
export default function findAdjacentSeats(
  seats: Seat[],
  n: number,
  startSeatId?: number
): number[] {
  // Group seats by row
  const rows = seats.reduce((acc: Record<number, Seat[]>, seat) => {
    if (!acc[seat.row_num]) acc[seat.row_num] = [];
    acc[seat.row_num].push(seat);
    return acc;
  }, {});

  // Logic for when a user clicks a specific seat
  if (startSeatId) {
    const clickedSeat = seats.find((s) => s.seatId === startSeatId);
    if (!clickedSeat) return [];

    // Filter for available seats on the *same row* as the clicked seat
    const rowSeats = rows[clickedSeat.row_num]
      .filter((s) => s.seatStatus === "available")
      .sort((a, b) => a.seat_num - b.seat_num);

    const index = rowSeats.findIndex((s) => s.seatId === clickedSeat.seatId);

    // If the clicked seat is not available (index = -1), stop
    if (index === -1) return [];

    // Try to find 'n' seats to the right (including the clicked one)
    const right = rowSeats.slice(index, index + n);
    const isContiguousRight = right.every(
      (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
    );
    if (right.length === n && isContiguousRight) {
      return right.map((s) => s.seatId);
    }

    // Try to find 'n' seats to the left (including the clicked one)
    const leftStart = Math.max(0, index - n + 1);
    const left = rowSeats.slice(leftStart, index + 1);
    const isContiguousLeft = left.every(
      (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
    );
    if (left.length === n && isContiguousLeft) {
      return left.map((s) => s.seatId);
    }
  }

  // Logic for automatic selection (find the best available block)
  for (const row of Object.values(rows)) {
    const available = row
      .filter((s) => s.seatStatus === "available")
      .sort((a, b) => a.seat_num - b.seat_num);

    for (let i = 0; i <= available.length - n; i++) {
      const segment = available.slice(i, i + n);
      const contiguous = segment.every(
        (s, j, arr) => j === 0 || s.seat_num === arr[j - 1].seat_num + 1
      );
      if (contiguous) return segment.map((s) => s.seatId);
    }
  }

  return [];
}
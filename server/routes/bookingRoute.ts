import express from "express";
import { db } from "../db.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import randomNumber from "../utils/randomNumber.js";

const router = express.Router();

const rNumber = randomNumber();
const bookingDate = new Date();

type Seat = RowDataPacket & {
  seatId: number;
  row_num: number;
  seat_num: number;
  seatStatus: "available" | "booked";
};

type SeatInput = {
  seatId: number;
  ticketType: number;
};

router.post("/bookings", async (req, res) => {
  const { screeningId, userId, seats } = req.body;
  try {
    // Get all seats with screening id
    const [seatsRow] = await db.query<Seat[]>(
      "SELECT * FROM seatStatusView WHERE screeningId = ?",
      [screeningId]
    );

    // Gets all available seats.
    const availableSeats = seatsRow.filter((r) => r.seatStatus === "available");

    // checks if the choosen seat is available
    const isAllAvailable = seats.every((seats: SeatInput) =>
      availableSeats.some((s) => s.seatId === seats.seatId)
    );

    if (!isAllAvailable) {
      return res
        .status(400)
        .json({ message: "One or more seats are already booked" });
    }
    // Insert userid and screening id to bookings
    const [newBooking] = await db.query<ResultSetHeader>(
      "INSERT INTO bookings(bookingNumber, userId, screeningId, date) VALUES(?, ?, ?, ?)",
      [rNumber, userId, screeningId, bookingDate]
    );

    if (!newBooking || newBooking.affectedRows === 0) {
      return res.status(400).json({ message: "Booking could not be created" });
    }

    const bookingId = newBooking.insertId;
    // Incase its more then 1 tickets/seats.
    const seatValues = seats.map((seat: Seat) => [
      bookingId,
      seat.seatId,
      seat.ticketType,
    ]);
    await db.query(
      "INSERT INTO bookingXSeats (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatValues]
    );

    res.status(201).json({
      message: "Booking created successfully",
      rNumber,
      bookingId,
      bookedSeats: seats.map((seat: Seat) => seat.seatId),
      ticketTypes: seats.map((seat: Seat) => seat.ticketType),
    });
  } catch (err) {
    console.error("Booking could not be processed.", err);
    res.status(500).json({ error: "Booking could not be processed." });
  }
});


router.delete('/bookings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id); 

    const [result] = await db.query<ResultSetHeader>(
      'DELETE FROM bookings WHERE id = ? LIMIT 1',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking was removed successfully!' });
  } catch (err: any) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
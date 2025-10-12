import { Router, Request, Response } from 'express';
import { db } from '../db'; 
import type { PriceLine, PriceTotals, PriceByType } from '../types/prices';

export const prices = Router();

// GET /bookings/:id/prices  → v_price_lines + v_price_totals
prices.get('/bookings/:id/prices', async (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) return res.status(400).json({ error: 'Invalid bookingId' });

  const [lines] = await db.query<PriceLine[]>(
    'SELECT bookingId, seatId, ticket_type, price_kr FROM v_price_lines WHERE bookingId = ?',
    [bookingId]
  );
  if ((lines as PriceLine[]).length === 0) return res.status(404).json({ error: 'Booking not found' });

  const [[totals]] = await db.query<PriceTotals[]>(
    'SELECT bookingId, tickets_count, total_price_kr FROM v_price_totals WHERE bookingId = ?',
    [bookingId]
  );

  return res.json({ bookingId, lines, totals });
});

// GET /bookings/:id/prices/by-type  → v_booking_type_totals
prices.get('/bookings/:id/prices/by-type', async (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) return res.status(400).json({ error: 'Invalid bookingId' });

  const [rows] = await db.query<PriceByType[]>(
    'SELECT bookingId, ticket_type, qty, subtotal_kr FROM v_booking_type_totals WHERE bookingId = ?',
    [bookingId]
  );
  if ((rows as PriceByType[]).length === 0) return res.status(404).json({ error: 'Booking not found' });

  return res.json({ bookingId, byType: rows });
});
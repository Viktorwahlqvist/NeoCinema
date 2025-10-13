// server/routes/prices.ts
import { Router } from 'express';
import { db } from '../db';
import type { PriceLine, PriceTotals, PriceByType } from "./types";

const pricesRouter = Router();

pricesRouter.get('/:id/prices', async (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) return res.status(400).json({ error: 'Invalid bookingId' });

  const [lines] = await db.query<PriceLine[]>(
    'SELECT bookingId, seatId, ticket_type, price_kr FROM v_price_lines WHERE bookingId = ?',
    [bookingId]
  );
  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(404).json({ error: 'Booking not found', bookingId });
  }

  const [[totals]] = await db.query<PriceTotals[]>(
    'SELECT bookingId, tickets_count, total_price_kr FROM v_price_totals WHERE bookingId = ?',
    [bookingId]
  );

  return res.json({ bookingId, lines, totals: totals ?? null });
});

pricesRouter.get('/:id/prices/by-type', async (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) return res.status(400).json({ error: 'Invalid bookingId' });

  const [rows] = await db.query<PriceByType[]>(
    'SELECT bookingId, ticket_type, qty, subtotal_kr FROM v_booking_type_totals WHERE bookingId = ?',
    [bookingId]
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(404).json({ error: 'Booking not found', bookingId });
  }

  return res.json({ bookingId, byType: rows });
});

export default pricesRouter;



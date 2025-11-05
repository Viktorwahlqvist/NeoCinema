import { Request, Response } from "express";

// Array to hold all SSE connections.
export const seatConnections: {
  req: Request;
  res: Response;
  screeningId: number;
}[] = [];

// idk
import { Request, Response } from "express";

const clients = new Map<string, Set<Response>>();

export function addClient(screeningId: string, res: Response) {
  if (!clients.has(screeningId)) clients.set(screeningId, new Set());
  clients.get(screeningId)!.add(res);
}

export function removeClient(screeningId: string, res: Response) {
  const set = clients.get(screeningId);
  if (set) {
    set.delete(res);
    if (set.size === 0) clients.delete(screeningId);
  }
}

export function sendUpdate(screeningId: string, data: any) {
  const set = clients.get(screeningId);
  if (!set) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of set) res.write(payload);
}

export function setupSSEEndpoint(
  app: any,
  getSeatsFromDB: (screeningId: string) => Promise<any>
) {
  app.get("/api/seatStatusUpdates", async (req: Request, res: Response) => {
    const { screeningId } = req.query as { screeningId: string };

    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    });
    res.flushHeaders();

    // Skicka initial data
    const initialSeats = await getSeatsFromDB(screeningId);
    res.write(`data: ${JSON.stringify(initialSeats)}\n\n`);

    // Lägg till klient
    addClient(screeningId, res);

    // Ta bort när anslutningen stängs
    req.on("close", () => {
      removeClient(screeningId, res);
      res.end();
    });
  });
}

export async function broadcastSeatUpdate(
  screeningId: string,
  getSeatsFromDB: (screeningId: string) => Promise<any>
) {
  const seats = await getSeatsFromDB(screeningId);
  sendUpdate(screeningId, seats);
}

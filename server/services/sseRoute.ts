import { Express } from "express";
import { seatConnections } from "./seatSse";

// create endpoint
export function initSeatSse(app: Express) {
  app.get("/api/seats-sse", (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.flushHeaders();

    // Initial ping
    res.write(": connected\n\n");

    // Store connection
    const screeningId = Number(req.query.screeningId);
    seatConnections.push({ req, res, screeningId });

    // Cleanup when client disconnects
    req.on("close", () => {
      const index = seatConnections.findIndex((c) => c.req === req);
      if (index !== -1) seatConnections.splice(index, 1);
    });
  });
}

// broadcast update to every connected users
export function broadcastSeatUpdate(seatData: {
  seatId: number;
  status: "booked" | "available";
  screeningId: number;
}) {
  for (const connection of seatConnections) {
    if (connection.screeningId === seatData.screeningId)
      connection.res.write(`data: ${JSON.stringify(seatData)}\n\n`);
  }
}

// send ping every 15 sec so connnection keeep alive
export function startKeepAlive() {
  setInterval(() => {
    for (const connection of seatConnections) {
      connection.res.write(": keep-alive\n\n");
    }
  }, 15000);
}

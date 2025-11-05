import { useEffect } from "react";

interface Props {
  onSeatUpdate: (seatId: number, status: "booked") => void;
}

export default function SeatSSE({ onSeatUpdate }: Props) {
  useEffect(() => {
    const eventSource = new EventSource("/api/seats-sse");

    eventSource.onmessage = (event) => {
      const data: { seatId: number; status: "booked" } = JSON.parse(event.data);

      onSeatUpdate(data.seatId, data.status);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return null;
}

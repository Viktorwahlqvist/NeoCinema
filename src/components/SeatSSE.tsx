import { useEffect } from "react";

type SeatStatus = "booked" | "available";
interface Props {
  onSeatUpdate: (seatId: number[], status: SeatStatus) => void;
  screeningId: number;
}

export default function SeatSSE({ onSeatUpdate, screeningId }: Props) {
  useEffect(() => {
    // only starts event for users with correct screening
    const eventSource = new EventSource(
      `/api/seats-sse?screeningId=${screeningId}`
    );

    // Listen for incoming SSE messages, parse the JSON string,
    eventSource.onmessage = (event) => {
      const data: { seatIds: number[]; status: SeatStatus } = JSON.parse(
        event.data
      );

      console.log(data);
      

      // and pass it as an object to our callback
      onSeatUpdate(data.seatIds, data.status);
    };

    return () => {
      eventSource.close();
    };
  }, [screeningId]);

  return null;
}

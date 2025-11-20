import { useEffect, useState } from "react";
import useFetch from "../hook/useFetch";
import "./Style/TicketSelector.scss";

interface Ticket {
  id: number;
  ticketType: string;
  price: number;
}

interface Props {
  onTicketChange: (selected: { id: number; count: number; }[]) => void;
}

export default function TicketSelector({ onTicketChange }: Props) {
  const { data: tickets, isLoading, error } = useFetch<Ticket[]>("/api/tickets");
  const [selected, setSelected] = useState<{ id: number; count: number; }[]>([]);

  useEffect(() => {
    if (tickets && selected.length === 0) {
      setSelected([{ id: 3, count: 2 }]);
    }
  }, [tickets]);


  useEffect(() => {
    const selectedWithPrice = selected.map((sel) => {
      const ticketInfo = tickets?.find((t) => t.id === sel.id);
      return { ...sel, price: ticketInfo?.price ?? 0 };
    });

    onTicketChange(selectedWithPrice);
  }, [selected, tickets]);


  const updateCount = (id: number, delta: number) => {
    setSelected((prev) => {
      const found = prev.find((t) => t.id === id);
      if (!found) return delta > 0 ? [...prev, { id, count: delta }] : prev;

      const newCount = Math.max(0, found.count + delta);
      return newCount > 0
        ? prev.map((t) => (t.id === id ? { ...t, count: newCount } : t))
        : prev.filter((t) => t.id !== id);
    });
  };


  if (isLoading) return <p>Laddar biljetter...</p>;
  if (error) return <p>Fel vid hämtning av biljetter: {error}</p>;
  if (!tickets) return null;

  return (
    <div className="ticket-selector">
      {tickets.map((t) => {
        const count = selected.find((sel) => sel.id === t.id)?.count || 0;
        return (
          <div key={t.id} className="ticket-row">
            <span>
              {t.ticketType} ({t.price} kr)
            </span>
            <div className="ticket-buttons">
              <button onClick={() => updateCount(t.id, -1)}>-</button>
              <span>{count}</span>
              <button onClick={() => updateCount(t.id, 1)}>+</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

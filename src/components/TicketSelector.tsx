import { useEffect, useState } from "react";
import useFetch from "../hook/useFetch";

interface Ticket {
  id: number;
  ticketType: string;
  price: number;
}

interface Props {
  onTicketChange: (selected: { id: number; count: number }[]) => void;
}

export default function TicketSelector({ onTicketChange }: Props) {
  const { data: tickets, isLoading, error } = useFetch<Ticket[]>("/api/tickets");
  const [selected, setSelected] = useState<{ id: number; count: number }[]>([]);

  useEffect(() => {
    if (tickets) {
      // Förifyll två vuxenbiljetter 
      setSelected([{ id: 3, count: 2 }]);
    }
  }, [tickets]);

  useEffect(() => {
    onTicketChange(selected);
  }, [selected]);

  const updateCount = (id: number, delta: number) => {
    setSelected((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (!existing) return [...prev, { id, count: Math.max(0, delta) }];
      const newCount = Math.max(0, existing.count + delta);
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

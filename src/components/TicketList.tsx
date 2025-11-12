import React from 'react'
import { TicketLine } from '../types/Booking';

interface TicketListProps {
  tickets: TicketLine[];
  totalPrice: number;
}

function TicketList({tickets, totalPrice } : TicketListProps  ) {
   if (!tickets || tickets.length === 0) return null;

  return (
    <>
      <div className="block">
          <h4 className="block-title">Biljetter</h4>
            <ul className="ticket-list">
              {tickets?.map((t, i) => (
                <li key={i}>
                  {t.qty} × {t.ticketType} ({t.qty * t.price} kr)
                  </li>
                  ))}
                  <li className="total-row">
                    Totalt: <span>{totalPrice} kr</span>
                  </li>
                </ul>
              </div>
            

            </>
  )
}

export default TicketList
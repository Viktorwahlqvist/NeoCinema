import React from 'react';
import TicketSelector from './TicketSelector';

export default function BookingLeft({ screening, setTickets, totalTickets, totalPrice }) {


  return (
    <aside className="booking-left">
      {screening?.[0] && (
        <div className="movie-poster-box">
          <img
            src={screening[0].info?.mobileImg || "/placeholder.jpg"}
            alt={screening[0].title}
            className="movie-poster"
          />
        </div>
      )}

      <div className="ticket-section">
        <h5 className="neo-text">Välj biljetter</h5>
        <TicketSelector onTicketChange={setTickets} />
      </div>

      {totalTickets > 0 && (
        <div className="ticket-total-box mt-3">
          <p className="text-light">Totalt pris</p>
          <h4 className="neo-text">{totalPrice} kr</h4>
        </div>
      )}
    </aside>
  );
}

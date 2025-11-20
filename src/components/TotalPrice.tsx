import React from 'react';

export default function TotalPrice({ totalPrice }: { totalPrice: number; }) {
  return (
    <div className="ticket-total-box mt-3">
      <p className="text-light">Totalt pris</p>
      <h4 className="neo-text">{totalPrice} kr</h4>
    </div>
  );
}

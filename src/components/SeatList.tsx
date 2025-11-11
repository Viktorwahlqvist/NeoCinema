import React from 'react'

export default function SeatList({seatNumbers}: {seatNumbers : string[]}) {

   if (!seatNumbers || seatNumbers.length === 0) return null;
  return (
    <>
     {seatNumbers.length > 0 && (
              <div className="block">
                <h4 className="block-title">Platser</h4>
                <ul className="seat-list">
                  {seatNumbers.map((seat, i) => (
                    <li key={i}>{seat}</li>
                  ))}
                </ul>
              </div>
            )}
    </>
  )
}

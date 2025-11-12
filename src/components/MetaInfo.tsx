import React from 'react'

interface MetaProps {
  email: string;
  bookingNumber: string
}

export default function MetaInfo({email, bookingNumber}: MetaProps) {
   if (!email || email.length === 0 || !bookingNumber || bookingNumber.length === 0) return null;
  return (
    <>
      <div className="block meta-block">
        <p className="meta-line">Bokningsid: <strong>{bookingNumber}</strong></p>
        <p className="meta-line">Bekräftelse skickad till:
            <br />
            <strong>{email}</strong></p>
      </div>
              
    </>
  )
}

import React from 'react';

interface GuestEmailProps {
  guestEmail: string,
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GuestEmailInput({ guestEmail, handleEmailChange }: GuestEmailProps) {

  return (
    <div className="guest-email mb-3">
      <label className="form-label text-light">E-post</label>
      <input
        type="email"
        className="form-control"
        placeholder="namn@exempel.se"
        value={guestEmail}
        onChange={handleEmailChange}
      />
    </div>
  );
}

import React from 'react';
import { AdminBookingListType } from '../../types/Booking';
import { Row, Col, Button, Table } from 'react-bootstrap';

interface AdminBookingListProps {
  bookings: AdminBookingListType[];
  onClick: (bookingId: number) => void;
}

export default function AdminBookingList({ bookings, onClick }: AdminBookingListProps) {


  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>First Name</th>
            <th>Email</th>
            <th>Film & Visnings tid</th>
            <th>Avboka</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, index) => {
            return (
              <tr key={b.bookingId}>
                <td>{b.bookingId}</td>
                <td>{b.name ? b.name : " - Gäst"}</td>
                <td>{b.email}</td>
                <td>{b.movieTitle} <br /> {`${b.screeningTime.split("T")[0]}, Kl: ${b.screeningTime.split("T")[1].slice(0, 5)}`}</td>
                <td><Button onClick={() => onClick(b.bookingId)} variant='danger'>Avboka</Button></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

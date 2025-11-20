import React from 'react';
import { AdminBookingListType } from '../../types/Booking';
import { Row, Col, Button, Table, Card } from 'react-bootstrap';

interface AdminBookingListProps {
  bookings: AdminBookingListType[];
  onClick: (bookingId: number) => void;
}

export default function AdminBookingList({ bookings, onClick }: AdminBookingListProps) {


  return (
    <>
      <section className="table-responsive d-none d-md-block">
        <Table striped bordered hover responsive="sm">
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
                  <td><Button onClick={() => onClick(b.bookingId)} variant='danger' size="sm">Avboka</Button></td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </section>
      <section className="d-block d-md-none">
        <Row className="g-3">
          {bookings.map((b) => (
            <Col xs={12} key={b.bookingId}>
              <Card>
                <Card.Body>
                  <Card.Title>Booking ID: {b.bookingId}</Card.Title>
                  <Card.Text>
                    <strong>Name:</strong> {b.name || " - Gäst"} <br />
                    <strong>Email:</strong> {b.email} <br />
                    <strong>Film:</strong> {b.movieTitle} <br />
                    <strong>Tid:</strong> {`${b.screeningTime.split("T")[0]}, Kl: ${b.screeningTime.split("T")[1].slice(0, 5)}`}
                  </Card.Text>
                  <Button onClick={() => onClick(b.bookingId)} variant="danger" size="sm">
                    Avboka
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
}

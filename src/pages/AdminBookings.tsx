import { Container } from 'react-bootstrap';
import AdminBookingList from '../components/admin/AdminBookingList';
import useFetch from '../hook/useFetch';
import { AdminBookingListType } from '../types/Booking';
import { useState } from 'react';


export default function AdminBookings() {
  const { data: bookingData, isLoading, error } = useFetch<AdminBookingListType[]>("/api/AdminBookingView");
  const [filteredData, setFilteredData] = useState<AdminBookingListType[]>();


  const handleFilter = (formData) => {
    setFilteredData();

  };

  return (
    <Container className='mt-4'>
      <form action={handleFilter}>
        <input name='datePicker' type='date' />
      </form>
      <AdminBookingList bookings={bookingData || []} />
    </Container>
  );
}



import { Container, Form, Stack } from 'react-bootstrap';
import AdminBookingList from '../components/admin/AdminBookingList';
import useFetch from '../hook/useFetch';
import { AdminBookingListType } from '../types/Booking';
import { useEffect, useState } from 'react';
import NotificationToast from '../components/NotificationToast';

export default function AdminBookings() {
  const { data: initialData } = useFetch<AdminBookingListType[]>("/api/AdminBookingView");
  const [bookingData, setBookingData] = useState<AdminBookingListType[]>([]);
  const [show, setShow] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    email: "",
    title: ""
  });

  useEffect(() => {
    if (initialData) {
      setBookingData(initialData);
    }
  }, [initialData]);

  const handleDelete = async (bookingId: number) => {
    if (!bookingId) return;
    setToastMessage("");

    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Något gick fel vid borttagning");
      }


      setBookingData(prev => prev.filter(b => b.bookingId !== bookingId));
      setToastMessage(`Bokning med Boknings ID: ${bookingId} togs bort`);
      setShow(true);

    } catch (err: any) {
      setToastMessage(err.message || "Kunde inte ta bort bokningen");
      setShow(true);
    }
  };

  type FormControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  const handleChange = (e: React.ChangeEvent<FormControlElement>) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const uniqueTitles = bookingData
    ? [...new Set(bookingData.map(b => b.movieTitle))]
    : [];

  const filteredData = bookingData?.filter(b => {

    const matchesDate =
      filters.date === "" || b.screeningTime.split("T")[0] === filters.date;

    const matchesEmail =
      filters.email === "" ||
      b.email?.toLowerCase().includes(filters.email.toLowerCase());

    const matchesTitle =
      filters.title === "" || b.movieTitle === filters.title;

    return matchesDate && matchesEmail && matchesTitle;
  }) || [];

  return (
    <Container className='mt-4'>

      <Stack direction="horizontal" gap={3} className='mb-2 flex-wrap flex-md-nowrap'>

        <Form.Control
          type="date"
          name="date"
          value={filters.date}
          onChange={handleChange}
        />

        <Form.Control
          type="text"
          name="email"
          placeholder="sök email"
          value={filters.email}
          onChange={handleChange}
        />

        <Form.Select
          name="title"
          value={filters.title}
          onChange={handleChange}
        >
          <option value="">All movies</option>
          {uniqueTitles.map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </Form.Select>

      </Stack>

      <AdminBookingList onClick={handleDelete} bookings={filteredData} />

      <NotificationToast setShow={setShow} show={show} toastMessage={toastMessage} />
    </Container>
  );
};

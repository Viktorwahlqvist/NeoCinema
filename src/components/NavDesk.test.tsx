import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import NavDesk from './NavDesk';

//Pages to verify navigation
function Home() {return <h1>Hem</h1>}
function Movies() {return <h1>Filmer</h1>}
function Kiosk() {return <h1>Kiosk</h1>}
function AboutUs() {return <h1>Om oss</h1>}
function Account() {return <h1>Konto</h1>}

describe('NavDesk', () => {
  it('shows all the links', () => {
    render(
      <MemoryRouter>
        <NavDesk />
      </MemoryRouter>
    );

    expect(screen.getByText('Filmer')).toBeInTheDocument();
    expect(screen.getByText('Kiosk')).toBeInTheDocument();
    expect(screen.getByText('Om oss')).toBeInTheDocument();
    expect(screen.getByText('Hem')).toBeInTheDocument();
    expect(screen.getByText('Konto')).toBeInTheDocument();
  });

  it('navigate to the right page when clicking on the link'), async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <NavDesk />
        <Routes>
          <Route path="/" element={Home />} />
          <Route path="/Movies" element={Movies />} />
          <Route path="/kiosk" element={Kiosk />} />
          <Route path="/AboutUs" element={AboutUs />} />
          <Route path="/konto" element={Account />} />
        </Routes>
      </MemoryRouter>
    );
    await user.click(screen.getByRole('link', { name: 'Filmer' }));
    expect(screen.getByRole('heading', { name: 'Filmer' })).toBeInTheDocument();
  }
});
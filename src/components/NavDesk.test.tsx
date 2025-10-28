import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import NavDesk from './NavDesk';

// mock pages to verify navigation
//each one just return a heading for a easy check
function Home() { return <h1>Hem</h1>; }
function Movies() { return <h1>Filmer</h1>; }
function Kiosk() { return <h1>Kiosk</h1>; }
function AboutUs() { return <h1>Om oss</h1>; }
function Account() { return <h1>Konto</h1>; }

describe('NavDesk', () => {
  //This test checks and verify that all links are rendered in the navbar
  it('visar alla huvudlänkar', () => {
    render(
      <MemoryRouter>
        <NavDesk />
      </MemoryRouter>
    );
    // checks for the presence of each navigation link by its accessible role and name
    expect(screen.getByRole('link', { name: 'Hem' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Filmer' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kiosk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Om oss' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Konto' })).toBeInTheDocument();
  });

  //This test simulates user clicking on the links and ensure that the navigation uppdates correctly
  it('navigerar till rätt sida när man klickar på en länk', async () => {
    const user = userEvent.setup(); //sets up a simulated user interaction

    render(
      //MemoryRouter simulates routing in tests without using the real browser URL
      <MemoryRouter initialEntries={['/']}>
        <NavDesk />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Movies" element={<Movies />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/konto" element={<Account />} />
        </Routes>
      </MemoryRouter>
    );

    // Click the filmer link to verify that the movies page is displayed
    await user.click(screen.getByRole('link', { name: 'Filmer' }));
    expect(screen.getByRole('heading', { name: 'Filmer' })).toBeInTheDocument();

    // Klicka på "Kiosk" link to verify navigation
    await user.click(screen.getByRole('link', { name: 'Kiosk' }));
    expect(screen.getByRole('heading', { name: 'Kiosk' })).toBeInTheDocument();

 
    await user.click(screen.getByRole('link', { name: 'Om oss' }));
    expect(screen.getByRole('heading', { name: 'Om oss' })).toBeInTheDocument();

    
    await user.click(screen.getByRole('link', { name: 'Hem' }));
    expect(screen.getByRole('heading', { name: 'Hem' })).toBeInTheDocument();

 
    await user.click(screen.getByRole('link', { name: 'Konto' }));
    expect(screen.getByRole('heading', { name: 'Konto' })).toBeInTheDocument();
  });
});
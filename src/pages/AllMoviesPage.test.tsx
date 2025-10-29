// src/pages/AllMoviesPage.test.tsx
import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

//Hoisted shared state used across mocks and tests 
const h = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  // two screenings different auditoriums and different screeningIds
  useFetchValue: {
    data: [
      {
        screeningId: 1,
        startTime: '2025-10-24T18:00:00',
        auditoriumName: 'Neo Lilla',
        info: { title: 'Oldboy', ageLimit: '15' },
      },
      {
        screeningId: 2,
        startTime: '2025-10-25T20:00:00',
        auditoriumName: 'Neo Stora',
        info: { title: 'Blade Runner', ageLimit: '11' },
      },
    ],
    isLoading: false,
    error: null,
  },
}));

//Mock reactrouterdom keep real Router, stub only useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => h.mockNavigate };
});

//Mock useFetch AllMoviesPage gets immediate mock data
vi.mock('../hook/useFetch', () => ({ __esModule: true, default: () => h.useFetchValue }));

//Mock AllMoviesList renders movie rows and Buy Ticket buttons
vi.mock('../components/AllMoviesList', () => {
  const React = require('react');
  type Row = {
    screeningId: number;
    auditoriumName: string;
    info: { title: string; ageLimit: string };
  };
  const List: React.FC<{ movies: Row[] }> = ({ movies }) => (
    <div data-testid="movies-list">
      {movies.map((m) => (
        <div key={m.screeningId} data-testid="movie-row">
          <span data-testid="title">{m.info.title}</span>{' '}
          <span data-testid="aud">{m.auditoriumName}</span>{' '}
          <button
            type="button"
            aria-label="Köp biljett"
            onClick={() => h.mockNavigate(`/booking/${m.screeningId}`)}
          >
            Köp biljett
          </button>
        </div>
      ))}
    </div>
  );
  return { __esModule: true, default: List };
});

//Mock FilterDropdown renders simple buttons for each option
vi.mock('../components/filter/FilterDropdown', () => {
  const React = require('react');
  const DD: React.FC<{ label: string; options: string[]; onClick: (v: string) => void }> = ({
    label,
    options,
    onClick,
  }) => (
    <div aria-label={label}>
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onClick(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
  return { __esModule: true, default: DD };
});

//Import the page AFTER all mocks
import AllMoviesPage from './AllMoviesPage';

// Helper for consistent rendering
const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <AllMoviesPage />
    </MemoryRouter>
  );

beforeEach(() => vi.clearAllMocks());

//TEST SUITE 
describe('AllMoviesPage', () => {
  test('renders heading and filter buttons', () => {
    renderWithRouter();
    expect(screen.getByText('På bio just nu')).toBeInTheDocument();
    expect(screen.getByLabelText('Välj ett datum')).toBeInTheDocument();
    expect(screen.getByLabelText('Välj en salong')).toBeInTheDocument();
    // The Under/Over 15 toggle button from FilterBtn
    expect(screen.getByText(/Under 15|Över 15/)).toBeInTheDocument();
    // Mocked movie list should render two rows
    expect(screen.getAllByTestId('movie-row')).toHaveLength(2);
  });

  test('toggles Under 15 ↔ Over 15 (FilterBtn triggers state change)', () => {
    renderWithRouter();
    const toggleBtn = screen.getByText(/Under 15|Över 15/);
    const before = toggleBtn.textContent;
    fireEvent.click(toggleBtn);
    const after = toggleBtn.textContent;
    expect(after).not.toEqual(before);
  });

  test('filters by auditorium: Neo Lilla and Neo Stora', () => {
    renderWithRouter();

    // Click Neo Lilla
    fireEvent.click(screen.getByRole('button', { name: 'Neo Lilla' }));
    let rows = screen.getAllByTestId('movie-row');
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByTestId('aud').textContent).toBe('Neo Lilla');

    // Click Neo Stora
    fireEvent.click(screen.getByRole('button', { name: 'Neo Stora' }));
    rows = screen.getAllByTestId('movie-row');
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByTestId('aud').textContent).toBe('Neo Stora');
  });

  test('navigates to booking page when "Köp biljett" is clicked', () => {
    renderWithRouter();
    const firstBuy = screen.getAllByRole('button', { name: /köp biljett/i })[0];
    fireEvent.click(firstBuy);
    expect(h.mockNavigate).toHaveBeenCalledWith('/booking/1');
  });

  test('filters by date: shows only screenings for selected date', () => {
    renderWithRouter();

    // Find our mock date dropdown
    const dateSection = screen.getByLabelText('Välj ett datum');

    // Click the first date button Fredag 24/10
    const dateButtons = within(dateSection).getAllByRole('button');
    fireEvent.click(dateButtons[0]);

    // Only one screening should remain first date 2025-10-24
    const rows = screen.getAllByTestId('movie-row');
    expect(rows).toHaveLength(1);

    //verify correct movie title
    expect(within(rows[0]).getByTestId('title').textContent).toBe('Oldboy');
  });
});
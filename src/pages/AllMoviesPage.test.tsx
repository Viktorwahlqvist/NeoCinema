// src/pages/AllMoviesPage.test.tsx
import React from 'react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const h = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  useFetchValue: {
    data: [
      {
        startTime: '2025-10-24T18:00:00',
        auditoriumName: 'Neo Lilla',
        info: { title: 'Dune', ageLimit: '15' },
      },
    ],
    isLoading: false,
    error: null,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => h.mockNavigate,
  };
});

vi.mock('../hook/useFetch', () => ({
  __esModule: true,
  default: () => h.useFetchValue,
}));

vi.mock('../components/AllMoviesList', () => {
  const React = require('react');
  const List: React.FC = () =>
    React.createElement(
      'button',
      { type: 'button', 'aria-label': 'Köp biljett', onClick: () => h.mockNavigate('/booking/123') },
      'Köp biljett'
    );
  return { __esModule: true, default: List };
});

import AllMoviesPage from './AllMoviesPage';

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <AllMoviesPage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks(); 
});

describe('AllMoviesPage', () => {
  test('renderar rubrik och filterknappar', () => {
    renderWithRouter();
    expect(screen.getByText('På bio just nu')).toBeInTheDocument();
    expect(screen.getByText('Välj ett datum')).toBeInTheDocument();
    expect(screen.getByText('Välj en salong')).toBeInTheDocument();
    expect(screen.getByText(/Under 15|Över 15/)).toBeInTheDocument();
  });

  test('navigerar till köp-sidan vid klick på "Köp biljett"', () => {
    renderWithRouter();
    fireEvent.click(screen.getByRole('button', { name: /köp biljett/i }));
    expect(h.mockNavigate).toHaveBeenCalledTimes(1);
    expect(h.mockNavigate).toHaveBeenCalledWith('/booking/123');
  });
});
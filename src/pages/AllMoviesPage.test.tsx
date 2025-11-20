// src/pages/AllMoviesPage.test.tsx
import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Hoisted state 
const h = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  useFetchValue: {
    data: [
      {
        screeningId: 1,
        startTime: '2099-11-24T18:00:00',
        auditoriumName: 'Neo Lilla',
        info: { title: 'Oldboy', ageLimit: '15' },
      },
      {
        screeningId: 2,
        startTime: '2099-11-25T20:00:00',
        auditoriumName: 'Neo Stora',
        info: { title: 'Blade Runner', ageLimit: '11' },
      },
    ],
    isLoading: false,
    error: null,
  },
}))

//  Mocks 

// react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom'
  )
  return { ...actual, useNavigate: () => h.mockNavigate }
})

// useFetch
vi.mock('../hook/useFetch', () => ({
  __esModule: true,
  default: () => h.useFetchValue,
}))

// AllMoviesList
vi.mock('../components/AllMoviesList', () => {
  const React = require('react')
  const List: React.FC<{ movies: any[] }> = ({ movies }) => (
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
  )
  return { __esModule: true, default: List }
})

// FilterDropdown
vi.mock('../components/filter/FilterDropdown', () => {
  const React = require('react')
  const DD: React.FC<{
    label: string
    options?: string[]
    onClick: (v: string) => void
  }> = ({ label, options = [], onClick }) => {
    const renderedOptions = options.length
      ? options
      : ['Fredag 24/11', 'Lördag 25/11'] // fallback mock-datum
    return (
      <div aria-label={label}>
        {renderedOptions.map((opt) => (
          <button key={opt} type="button" onClick={() => onClick(opt)}>
            {opt}
          </button>
        ))}
      </div>
    )
  }
  return { __esModule: true, default: DD }
})

// FilterBtn
vi.mock('../components/filter/FilterBtn', () => {
  const React = require('react')
  const Btn: React.FC<{ btnName: string[]; onClick: () => void }> = ({
    btnName,
    onClick,
  }) => (
    <button type="button" className="overall-button" onClick={onClick}>
      {btnName[0]}
    </button>
  )
  return { __esModule: true, default: Btn }
})

// Import page after mocks
import AllMoviesPage from './AllMoviesPage'

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <AllMoviesPage />
    </MemoryRouter>
  )

beforeEach(() => vi.clearAllMocks())

// Tests 
describe('AllMoviesPage', () => {
  test('renderar rubrik och filterknappar', () => {
    renderWithRouter()
    expect(screen.getByText('På bio just nu')).toBeInTheDocument()
    expect(screen.getByLabelText('Välj ett datum')).toBeInTheDocument()
    expect(screen.getByLabelText('Välj en salong')).toBeInTheDocument()
    expect(screen.getByText(/Under 15|Över 15/)).toBeInTheDocument()
    expect(screen.getAllByTestId('movie-row')).toHaveLength(2)
  })

  test('växlar Under 15 ↔ Över 15', () => {
    renderWithRouter()
    const toggleBtn = screen.getByText(/Under 15|Över 15/)
    const before = toggleBtn.textContent
    fireEvent.click(toggleBtn)
    const after = toggleBtn.textContent
    expect(after).not.toEqual(before)
  })

  test('filtrerar på salong: Neo Lilla och Neo Stora', () => {
    renderWithRouter()
    fireEvent.click(screen.getByRole('button', { name: 'Neo Lilla' }))
    let rows = screen.getAllByTestId('movie-row')
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByTestId('aud').textContent).toBe('Neo Lilla')

    fireEvent.click(screen.getByRole('button', { name: 'Neo Stora' }))
    rows = screen.getAllByTestId('movie-row')
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByTestId('aud').textContent).toBe('Neo Stora')
  })

  test('navigerar till bokningssidan vid "Köp biljett"', () => {
    renderWithRouter()
    const firstBuy = screen.getAllByRole('button', { name: /köp biljett/i })[0]
    fireEvent.click(firstBuy)
    expect(h.mockNavigate).toHaveBeenCalledWith('/booking/1')
  })

  test('filtrerar på datum: visar bara filmer för valt datum', () => {
    renderWithRouter()
    const dateSection = screen.getByLabelText('Välj ett datum')
    const dateButtons = within(dateSection).getAllByRole('button')
    expect(dateButtons.length).toBeGreaterThan(0)
    fireEvent.click(dateButtons[0])
    const rows = screen.getAllByTestId('movie-row')
    expect(rows).toHaveLength(1)
    expect(within(rows[0]).getByTestId('title').textContent).toBe('Oldboy')
  })
})
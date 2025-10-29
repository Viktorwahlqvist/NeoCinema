// src/pages/HomePage.test.tsx
import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Hoisted state
const h = vi.hoisted(() => ({
  useFetchValue: {
    data: [
      { id: 1, title: 'Inception', genres: ['Sci-Fi', 'Thriller'] },
      { id: 2, title: 'Dune',      genres: ['Sci-Fi', 'Adventure'] },
    ],
    isLoading: false,
    error: null as string | null,
  },
  isMobile: true,
  alertSpy: vi.fn(),
}))

vi.mock('../hook/useFetch', () => ({
  __esModule: true,
  default: () => h.useFetchValue,
}))

vi.mock('../hook/useIsMobile', () => ({
  __esModule: true,
  useIsMobile: () => h.isMobile,
}))

vi.mock('react-bootstrap/Carousel', () => {
  const React = require('react')
  const Carousel: React.FC<any> & { Item: React.FC<any> } = (props: any) => (
    <div data-testid="carousel">{props.children}</div>
  )
  Carousel.Item = ({ children }: any) => <div data-testid="carousel-item">{children}</div>
  return { __esModule: true, default: Carousel }
})

vi.mock('../components/MovieCard', () => ({
  __esModule: true,
  default: ({ movie }: { movie: { title: string } }) => (
    <div data-testid="movie-card">{movie.title}</div>
  ),
}))

vi.mock('../components/MovieCarousel', () => ({
  __esModule: true,
  MovieCarousel: ({ movies }: { movies: any[] }) => (
    <div data-testid="movie-carousel">count:{movies.length}</div>
  ),
}))

vi.mock('../components/UpcomingMovies', () => ({
  __esModule: true,
  default: () => <div data-testid="upcoming">Upcoming</div>,
}))

import HomePage from './HomePage'

beforeEach(() => {
  vi.clearAllMocks()
  window.alert = h.alertSpy
})



describe('HomePage', () => {
  test('visar "Laddar filmer..." när isLoading=true', () => {
    h.useFetchValue.isLoading = true
    h.useFetchValue.error = null
    h.useFetchValue.data = []
    render(<HomePage />)
    expect(screen.getByText(/Laddar filmer/i)).toBeInTheDocument()
  })

  test('visar felmeddelande när error finns', () => {
    h.useFetchValue.isLoading = false
    h.useFetchValue.error = 'Boom'
    h.useFetchValue.data = []
    render(<HomePage />)
    expect(screen.getByText(/Något gick fel: Boom/)).toBeInTheDocument()
  })

  test('visar tomt-läge när inga filmer finns', () => {
    h.useFetchValue.isLoading = false
    h.useFetchValue.error = null
    h.useFetchValue.data = []
    render(<HomePage />)
    expect(screen.getByText(/Inga filmer tillgängliga/i)).toBeInTheDocument()
  })

  test('MOBIL: aktiv titel, genres och "Köp biljetter" triggar alert', () => {
    h.isMobile = true
    h.useFetchValue.isLoading = false
    h.useFetchValue.error = null
    h.useFetchValue.data = [
      { id: 1, title: 'Inception', genres: ['Sci-Fi', 'Thriller'] },
      { id: 2, title: 'Dune',      genres: ['Sci-Fi', 'Adventure'] },
    ]

    render(<HomePage />)

    // Titel: använd heading för att undvika dublett-konflikt
    expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument()
    expect(screen.getByText('Sci-Fi')).toBeInTheDocument()
    expect(screen.getByText('Thriller')).toBeInTheDocument()

    expect(screen.getByTestId('carousel')).toBeInTheDocument()
    expect(screen.getAllByTestId('carousel-item')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: /Köp biljetter/i }))
    expect(h.alertSpy).toHaveBeenCalledWith('Köp biljetter för Inception')
  })

  test('DESKTOP: "Nu på bio" + MovieCarousel med alla filmer', () => {
    h.isMobile = false
    h.useFetchValue.isLoading = false
    h.useFetchValue.error = null
    h.useFetchValue.data = [
      { id: 1, title: 'Inception', genres: ['Sci-Fi'] },
      { id: 2, title: 'Dune',      genres: ['Sci-Fi'] },
      { id: 3, title: 'Oldboy',    genres: ['Drama'] },
    ]

    render(<HomePage />)

    expect(screen.getByText('Nu på bio')).toBeInTheDocument()
    expect(screen.getByTestId('movie-carousel')).toHaveTextContent('count:3')
    expect(screen.getByTestId('upcoming')).toBeInTheDocument()

    // ingen mobil-CTA
    expect(screen.queryByRole('button', { name: /Köp biljetter/i })).toBeNull()
    // Vi förlitar oss på count:3 istället för titelrendering här
    
  })
})
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
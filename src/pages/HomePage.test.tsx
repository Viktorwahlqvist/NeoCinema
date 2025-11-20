
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// hoisted shared state
const h = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockIsMobile: true,
  movies: [
    { id: 101, title: "Inception", genres: ["Sci-Fi", "Thriller"] },
    { id: 202, title: "Dune", genres: ["Sci-Fi"] },
  ],
}));

// mock useFetch
vi.mock("../hook/useFetch", () => ({
  __esModule: true,
  default: () => ({
    data: h.movies,
    isLoading: false,
    error: null,
  }),
}));

// mock useIsMobile
vi.mock("../hook/useIsMobile", () => ({
  __esModule: true,
  useIsMobile: () => h.mockIsMobile,
}));

// mock MovieCard
vi.mock("../components/MovieCard", () => ({
  __esModule: true,
  default: ({ movie }: { movie: { title: string } }) => (
    <div data-testid="movie-card">{movie.title}</div>
  ),
}));

// mock UpcomingMovies
vi.mock("../components/UpcomingMovies", () => ({
  __esModule: true,
  default: () => <div data-testid="upcoming">Upcoming</div>,
}));

// mock MovieCarousel
vi.mock("../components/MovieCarousel", () => ({
  __esModule: true,
  MovieCarousel: ({ movies }: { movies: { title: string }[] }) => (
    <div data-testid="movie-carousel">
      {movies.map((m) => (
        <span key={m.title}>{m.title}</span>
      ))}
    </div>
  ),
}));

// mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => h.mockNavigate,
  };
});

// mocka react-bootstrap/Carousel
vi.mock("react-bootstrap/Carousel", () => {
  const React = require("react");
  // Carousel-komponenten
  const Carousel = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel">{children}</div>
  );
  // Item as prop to the function
  (Carousel as any).Item = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="carousel-item">{children}</div>
  );

  return {
    __esModule: true,
    default: Carousel,
  };
});

// importing the page
import HomePage from "./HomePage";

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  h.mockIsMobile = true; // default = mobile
});

describe("HomePage", () => {
  it("MOBIL: visar titel, genres och navigerar vid 'Köp biljetter'", () => {
    h.mockIsMobile = true;
    renderHome();

    // headern
    const heading = screen.getByRole("heading", { name: "Inception" });
    expect(heading).toBeInTheDocument();

    // genres
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
    expect(screen.getByText("Thriller")).toBeInTheDocument();

    // button → should navigate to /movie/101
    const btn = screen.getByRole("button", { name: /köp biljetter/i });
    fireEvent.click(btn);
    expect(h.mockNavigate).toHaveBeenCalledWith("/movie/101");

    // carousel should show in mobile
    expect(screen.getByTestId("carousel")).toBeInTheDocument();
  });

  it("DESKTOP: visar movie-carousel och ingen mobil-knapp", () => {
    h.mockIsMobile = false;
    renderHome();

    // In desktop path so moviecarousel mock should show
    expect(screen.getByTestId("movie-carousel")).toBeInTheDocument();

    // mobile button should not be seen
    expect(
      screen.queryByRole("button", { name: /köp biljetter/i })
    ).toBeNull();

    // upcoming movies is seen
    expect(screen.getByTestId("upcoming")).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NavDesk from './NavDesk';

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
});
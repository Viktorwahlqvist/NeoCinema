import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';

console.log('AllMoviesPage.spec.tsx loaded');

//Mockdata
const h = vi.hoisted(() => ({
  useFetchValue: {
    data: [
      {
        startTime: '2025-10-24T18:00:00',
        auditoriumName: 'Neo Lilla',
        info: { title: 'Oldboy', ageLimit: '15' },
      },
    ],
    isLoading: false,
    error: null,
  },
}));

vi.mock('../hook/useFetch', () => ({
  __esModule: true,
  default: () => h.useFetchValue,
}));

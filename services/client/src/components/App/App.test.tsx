import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '.';

test('renders learn react link', () => {
  render(<App />);
  const el = screen.getByText(/see something funny/i);
  expect(el).toBeInTheDocument();
});

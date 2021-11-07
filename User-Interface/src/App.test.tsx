// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Cloud PAW Management \(Private Preview\)/i);
  expect(linkElement).toBeInTheDocument();
});

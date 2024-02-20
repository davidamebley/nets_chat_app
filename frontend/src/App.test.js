import { render, screen } from '@testing-library/react';
import App from './App';

test('checks for the presence of the connect button', () => {
  render(<App />);
  const connectButton = screen.getByText(/Connect/i);
  expect(connectButton).toBeInTheDocument();
});

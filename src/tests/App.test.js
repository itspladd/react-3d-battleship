import { render, screen } from '@testing-library/react';
import App from '../components/App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('connects to websocket properly', () => {
  render(<App />);
  const socketAttempt = screen.getByText(/connecting to server.../i)
  expect(socketAttempt).toBeInTheDocument();

  const socketSuccess = screen.getByText(/connection established/i)
  expect(socketSuccess).toBeInTheDocument();
})
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithProvider = (ui) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('renders correctly', () => {
    renderWithProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles theme correctly', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Initial state is 'dark' (from ThemeContext.jsx)
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle to 'light'
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');

    // Toggle back to 'dark'
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});

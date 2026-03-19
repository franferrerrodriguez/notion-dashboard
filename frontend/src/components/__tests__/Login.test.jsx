import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '../Login';
import { LanguageProvider } from '../../context/LanguageContext';
import * as AuthModule from '../../context/AuthContext';

// Mock AuthContext
vi.mock('../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      login: vi.fn(),
    })),
  };
});

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('Login Component', () => {
  it('submits correctly with credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce();
    vi.mocked(AuthModule.useAuth).mockReturnValue({
      login: mockLogin,
    });

    renderWithProvider(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/admin@example.com/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('shows error on invalid credentials', async () => {
    const mockLogin = vi.fn().mockRejectedValueOnce(new Error('Invalid credentials'));
    vi.mocked(AuthModule.useAuth).mockReturnValue({
      login: mockLogin,
    });

    renderWithProvider(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/admin@example.com/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});

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

import { ThemeProvider } from '../../context/ThemeContext';

const renderWithProvider = (ui) => {
  return render(
    <LanguageProvider>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </LanguageProvider>
  );
};

describe('Login Component', () => {
  it('submits correctly with credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce();
    vi.mocked(AuthModule.useAuth).mockReturnValue({
      login: mockLogin,
    });

    renderWithProvider(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });

    // The button text is "Entrar" by default in LanguageProvider (Spanish)
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

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

    fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderWithProvider(<Login />);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput.type).toBe('password');
  });
});

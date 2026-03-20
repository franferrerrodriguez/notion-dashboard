import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserDropdown from '../UserDropdown';
import { LanguageProvider } from '../../context/LanguageContext';
import * as AuthModule from '../../context/AuthContext';

// Mock useAuth at the module level
vi.mock('../../context/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { email: 'test@example.com', role: 'admin' },
      logout: vi.fn(),
    })),
  };
});

const renderWithProviders = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('UserDropdown Component', () => {
  it('renders user name correctly', () => {
    // Reset mock for each test
    vi.mocked(AuthModule.useAuth).mockReturnValue({
      user: { email: 'test@example.com', role: 'admin' },
      logout: vi.fn(),
    });

    renderWithProviders(<UserDropdown />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('opens dropdown menu on click', () => {
    renderWithProviders(<UserDropdown />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/Idioma/i)).toBeInTheDocument();
  });

  it('calls onLogout when logout is clicked and confirmed', async () => {
    const mockLogout = vi.fn();
    vi.mocked(AuthModule.useAuth).mockReturnValue({
      user: { email: 'test@example.com', role: 'admin' },
      logout: mockLogout,
    });

    renderWithProviders(<UserDropdown />);
    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    // Click logout
    fireEvent.click(screen.getByText(/Cerrar Sesión/i));
    
    // Check that ConfirmModal is open
    expect(screen.getByText(/¿Cerrar sesión ahora?/i)).toBeInTheDocument();
    
    // Click confirm in modal (the button text is "Cerrar Sesión" as passed from UserDropdown)
    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));
    
    expect(mockLogout).toHaveBeenCalled();
  });
});

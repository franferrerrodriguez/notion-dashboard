import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChangePasswordModal from '../ChangePasswordModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { authService } from '../../services/api';

// Mock authService
vi.mock('../../services/api', () => ({
  authService: {
    updatePassword: vi.fn(),
  },
}));

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('ChangePasswordModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  it('renders correctly when open', () => {
    renderWithProvider(<ChangePasswordModal {...defaultProps} />);
    expect(screen.getByText(/Cambiar Contraseña/i)).toBeInTheDocument();
  });

  it('generates a password when clicking generate', () => {
    renderWithProvider(<ChangePasswordModal {...defaultProps} />);
    const generateButton = screen.getByText(/Generar/i);
    const input = screen.getByPlaceholderText(/••••••••/i);
    
    expect(input.value).toBe('');
    fireEvent.click(generateButton);
    expect(input.value).not.toBe('');
    expect(input.value.length).toBe(12);
  });

  it('calls updatePassword and shows success on valid submit', async () => {
    authService.updatePassword.mockResolvedValueOnce({});
    renderWithProvider(<ChangePasswordModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(input, { target: { value: 'newpassword123' } });

    // The button text is "Actualizar" in Spanish
    const submitButton = screen.getByRole('button', { name: /Actualizar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.updatePassword).toHaveBeenCalledWith('newpassword123');
      expect(screen.getByText(/Contraseña actualizada con éxito/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    authService.updatePassword.mockRejectedValueOnce(new Error('Failed'));
    renderWithProvider(<ChangePasswordModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(/••••••••/i);
    fireEvent.change(input, { target: { value: 'fail' } });

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error al actualizar la contraseña/i)).toBeInTheDocument();
    });
  });
});

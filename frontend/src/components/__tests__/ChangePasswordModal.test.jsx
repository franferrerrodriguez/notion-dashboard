import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChangePasswordModal from '../ChangePasswordModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { userService } from '../../services/api';

// Mock userService
vi.mock('../../services/api', () => ({
  userService: {
    changePassword: vi.fn(),
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
    expect(screen.getByText(/Seguridad de la Cuenta/i)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderWithProvider(<ChangePasswordModal {...defaultProps} />);
    const toggleButtons = screen.getAllByLabelText(/Toggle Visibility/i);

    // Get all password-style inputs
    const inputs = screen.getAllByPlaceholderText(/••••••••/i);
    expect(inputs[0].type).toBe('password');

    fireEvent.click(toggleButtons[0]);
    expect(inputs[0].type).toBe('text');
  });

  it('calls changePassword and shows success on valid submit', async () => {
    userService.changePassword.mockResolvedValueOnce({});
    renderWithProvider(<ChangePasswordModal {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(inputs[0], { target: { value: 'old' } });
    fireEvent.change(inputs[1], { target: { value: 'new' } });
    fireEvent.change(inputs[2], { target: { value: 'new' } });

    // The button text is "Guardar Cambios" in Spanish
    fireEvent.click(screen.getByText(/Guardar Cambios/i));

    await waitFor(() => {
      expect(userService.changePassword).toHaveBeenCalledWith('old', 'new');
      expect(screen.getByText(/Contraseña actualizada con éxito/i)).toBeInTheDocument();
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserModal from '../UserModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { projectService } from '../../services/api';

// Mock projectService
vi.mock('../../services/api', () => ({
  projectService: {
    getClientOptions: vi.fn(),
  },
}));

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('UserModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renders correctly when open and loads options', async () => {
    projectService.getClientOptions.mockResolvedValueOnce([
      { id: '1', name: 'Client 1' },
      { id: '2', name: 'Client 2' },
    ]);

    renderWithProvider(<UserModal {...defaultProps} />);

    // Check loading state first
    expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument();

    // Wait for options to load and form to show
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ejemplo@cliente.com/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Nuevo Usuario/i })).toBeInTheDocument();
  });

  it('shows client selection only when role is CLIENT', async () => {
    projectService.getClientOptions.mockResolvedValueOnce([{ id: '1', name: 'Client 1' }]);
    renderWithProvider(<UserModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ejemplo@cliente.com/i)).toBeInTheDocument();
    });

    // Default role is CLIENT, so "Cliente Notion (Tag)" should be visible
    expect(screen.getByText(/Cliente Notion/i)).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    projectService.getClientOptions.mockResolvedValueOnce([]);
    renderWithProvider(<UserModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ejemplo@cliente.com/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(passwordInput.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(passwordInput.type).toBe('password');
  });

  it('toggles is_active status when editing', async () => {
    projectService.getClientOptions.mockResolvedValueOnce([]);
    const editingUser = { 
      id: 1, 
      email: 'user@example.com', 
      role: 'Client', 
      is_active: 1,
      external_client_id: 'client_1'
    };
    
    renderWithProvider(<UserModal {...defaultProps} editingUser={editingUser} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Estado de la cuenta/i)).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: /Toggle user status/i });
    expect(screen.getByText(/El usuario puede acceder/i)).toBeInTheDocument();
    
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Acceso bloqueado/i)).toBeInTheDocument();
  });
});

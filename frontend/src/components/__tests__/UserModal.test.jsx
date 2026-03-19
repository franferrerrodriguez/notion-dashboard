import { render, screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByTestId('loading-title')).toBeInTheDocument();

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
});

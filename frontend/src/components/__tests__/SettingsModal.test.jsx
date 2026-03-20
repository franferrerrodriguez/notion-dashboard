import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsModal from '../SettingsModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { settingsService } from '../../services/api';

// Mock settingsService
vi.mock('../../services/api', () => ({
  settingsService: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('SettingsModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  it('loads settings on open', async () => {
    settingsService.get.mockResolvedValueOnce({
      notion_integration_token: 'secret_123',
      notion_database_id: 'db_456',
    });

    renderWithProvider(<SettingsModal {...defaultProps} />);

    expect(screen.getByText(/Cargando Configuración/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/secret_\.\.\./i).value).toBe('secret_123');
    });

    expect(screen.getByDisplayValue('db_456')).toBeInTheDocument();
  });

  it('calls save when form is submitted', async () => {
    settingsService.get.mockResolvedValueOnce({
      notion_integration_token: 'secret_123',
      notion_database_id: 'db_456',
    });
    settingsService.save.mockResolvedValueOnce({});

    renderWithProvider(<SettingsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/secret_\.\.\./i)).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(settingsService.save).toHaveBeenCalledWith({
        notion_integration_token: 'secret_123',
        notion_database_id: 'db_456',
      });
      expect(screen.getByText(/Configuración guardada correctamente/i)).toBeInTheDocument();
    });
  });

  it('toggles integration token visibility', async () => {
    settingsService.get.mockResolvedValueOnce({ notion_integration_token: 'secret_123' });
    renderWithProvider(<SettingsModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/secret_\.\.\./i)).toBeInTheDocument();
    });

    const tokenInput = screen.getByPlaceholderText(/secret_\.\.\./i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    expect(tokenInput.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(tokenInput.type).toBe('text');
    fireEvent.click(screen.getByLabelText(/Hide password/i));
    expect(tokenInput.type).toBe('password');
  });
});

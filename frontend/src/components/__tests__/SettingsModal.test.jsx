import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsModal from '../SettingsModal';
import { LanguageProvider } from '../../context/LanguageContext';
import { settingsService } from '../../services/api';

// Mock settingsService
vi.mock('../../services/api', () => ({
  settingsService: {
    get: vi.fn(),
    update: vi.fn(),
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
      notion_token: 'secret_123',
      database_id: 'db_456',
    });

    renderWithProvider(<SettingsModal {...defaultProps} />);

    expect(screen.getByTestId('loading-text')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/secret_\.\.\./i).value).toBe('secret_123');
    });

    expect(screen.getByPlaceholderText(/32 chars ID\.\.\./i).value).toBe('db_456');
  });

  it('toggles token visibility', async () => {
    settingsService.get.mockResolvedValueOnce({ notion_token: 'secret_123' });
    renderWithProvider(<SettingsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/secret_\.\.\./i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/secret_\.\.\./i);
    const toggleBtn = screen.getByLabelText(/Toggle Token Visibility/i);

    expect(input.type).toBe('password');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
  });
});

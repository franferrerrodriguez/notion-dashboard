import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmModal from '../ConfirmModal';
import { LanguageProvider } from '../../context/LanguageContext';

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('ConfirmModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Test Title',
    message: 'Test Message',
  };

  it('renders correctly when open', () => {
    renderWithProvider(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onClose when clicking cancel', () => {
    renderWithProvider(<ConfirmModal {...defaultProps} />);
    // Select by text since translation provides "Cancelar"
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when clicking confirm', () => {
    renderWithProvider(<ConfirmModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/Confirmar/i));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    renderWithProvider(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });
});

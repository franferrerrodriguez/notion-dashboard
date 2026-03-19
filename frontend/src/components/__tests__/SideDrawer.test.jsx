import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SideDrawer from '../SideDrawer';
import { projectService } from '../../services/api';
import { LanguageProvider } from '../../context/LanguageContext';

// Mock projectService
vi.mock('../../services/api', () => ({
  projectService: {
    getById: vi.fn(),
  },
}));

const renderWithProvider = (ui) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('SideDrawer Component', () => {
  const defaultProps = {
    projectId: '1',
    onClose: vi.fn(),
  };

  it('loads and displays project details', async () => {
    projectService.getById.mockResolvedValueOnce({
      id: '1',
      name: 'Test Project',
      phase: 'Proyecto',
      progress: 70,
      billedAmount: 50,
      description: 'Test description',
    });

    renderWithProvider(<SideDrawer {...defaultProps} />);

    // Screen should show loading initially
    expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render if projectId is null', () => {
    renderWithProvider(<SideDrawer projectId={null} onClose={vi.fn()} />);
    expect(screen.queryByText(/ID:/i)).not.toBeInTheDocument();
  });
});

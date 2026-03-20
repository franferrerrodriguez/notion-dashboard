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
      raw_properties: {
        'Nombre del proyecto': { title: [{ plain_text: 'Test Project' }] },
        'Progreso': { rollup: { number: 0.7 } },
        '% Facturado': { formula: { number: 0.5 } },
        'Resumen': { rich_text: [{ plain_text: 'Test description' }] },
        'Cliente': { multi_select: [{ name: 'Client A', color: 'blue' }] },
        'Estado': { status: { name: 'In Progress', color: 'orange' } },
        'Fase': { status: { name: 'Development', color: 'blue' } }
      },
      related_tasks: [],
      page_content: []
    });

    renderWithProvider(<SideDrawer {...defaultProps} />);

    // Screen should show loading initially ("Cargando..." in Spanish)
    expect(screen.getAllByText(/Cargando\.\.\./i)[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render if projectId is null', () => {
    const { container } = renderWithProvider(<SideDrawer projectId={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SideDrawer from '../SideDrawer';
import { projectService } from '../../services/api';

// Mock projectService
vi.mock('../../services/api', () => ({
  projectService: {
    getProjectDetails: vi.fn(),
  },
}));

describe('SideDrawer Component', () => {
  const mockProject = { id: '1', name: 'Test Project' };
  const defaultProps = {
    project: mockProject,
    isOpen: true,
    onClose: vi.fn(),
  };

  it('loads and displays project details', async () => {
    projectService.getProjectDetails.mockResolvedValueOnce({
      id: '1',
      name: 'Test Project',
      status: 'In Progress',
      priority: 'High',
      description: 'Test description',
      date: '2024-03-20',
    });

    render(<SideDrawer {...defaultProps} />);

    expect(screen.getByTestId('loading-text')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render if not open', () => {
    render(<SideDrawer {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
  });
});

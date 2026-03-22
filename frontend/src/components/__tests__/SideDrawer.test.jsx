import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SideDrawer from '../SideDrawer';
import { projectService } from '../../services/api';
import { LanguageProvider } from '../../context/LanguageContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock projectService
vi.mock('../../services/api', () => ({
  projectService: {
    getById: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProvider = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>{ui}</LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('SideDrawer Component', () => {
  const defaultProps = {
    itemId: '1',
    onClose: vi.fn(),
  };

  it('loads and displays project details', async () => {
    projectService.getById.mockResolvedValueOnce({
      project: {
        id: '1',
        identification: {
          name: 'Test Project',
        },
        status: {
          progress: 70,
        },
        financials: {
          billingPercentage: 50,
        },
        metadata: [
          { label: 'Resumen', value: 'Test description' }
        ]
      }
    });

    renderWithProvider(<SideDrawer {...defaultProps} />);

    // Wait for the data to resolve and render the component content
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('does not render if itemId is null', () => {
    const { container } = renderWithProvider(<SideDrawer itemId={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});

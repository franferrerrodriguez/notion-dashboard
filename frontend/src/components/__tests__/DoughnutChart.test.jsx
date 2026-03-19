import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DoughnutChart from '../DoughnutChart';

describe('DoughnutChart Component', () => {
  const defaultProps = {
    progress: 70,
    stats: { notStarted: 10, inProgress: 20, completed: 70 },
    total: 100,
    label: 'Test Label',
  };

  it('renders progress correctly', () => {
    render(<DoughnutChart {...defaultProps} />);
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders label if provided', () => {
    render(<DoughnutChart {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('handles progress overflow', () => {
    render(<DoughnutChart progress={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles missing stats gracefully', () => {
    render(<DoughnutChart progress={50} stats={null} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DoughnutChart from '../DoughnutChart';

describe('DoughnutChart Component', () => {
  const defaultProps = {
    progress: 70,
    stats: { notStarted: 10, inProgress: 20, completed: 70 },
    total: 100,
  };

  it('renders without crashing', () => {
    const { container } = render(<DoughnutChart {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders correctly with zero values', () => {
    const { container } = render(<DoughnutChart progress={0} stats={null} total={0} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

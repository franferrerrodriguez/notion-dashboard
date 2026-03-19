import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar Component', () => {
  it('renders correctly with given value', () => {
    render(<ProgressBar value={50} color="#238636" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
  });

  it('displays the correct percentage text', () => {
    render(<ProgressBar value={75} color="#238636" />);
    // Since ProgressBar might be internal, we check by style or test-id
    // If it uses a div with width, we verify the style
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '75%' });
  });

  it('caps the value at 100%', () => {
    render(<ProgressBar value={120} color="#238636" />);
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });

  it('handles 0% correctly', () => {
    render(<ProgressBar value={0} color="#238636" />);
    const progressFill = screen.getByTestId('progress-fill');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });
});

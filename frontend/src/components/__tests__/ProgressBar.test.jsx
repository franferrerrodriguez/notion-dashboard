import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar Component', () => {
  it('renders correctly with given value', () => {
    const { container } = render(<ProgressBar value={50} color="#238636" />);
    // The previous selector might have been catching the middle div depending on showText
    const actualFill = Array.from(container.querySelectorAll('div')).find(el => el.style.width);
    expect(actualFill).toBeInTheDocument();
    expect(actualFill).toHaveStyle({ width: '50%' });
  });

  it('displays the correct percentage text when showText is true', () => {
    const { getByText } = render(<ProgressBar value={75} color="#238636" showText={true} />);
    expect(getByText('75.0%')).toBeInTheDocument();
  });

  it('caps the value at 100%', () => {
    const { container } = render(<ProgressBar value={120} color="#238636" />);
    const actualFill = Array.from(container.querySelectorAll('div')).find(el => el.style.width);
    expect(actualFill).toHaveStyle({ width: '100%' });
  });

  it('handles 0% correctly', () => {
    const { container } = render(<ProgressBar value={0} color="#238636" />);
    const actualFill = Array.from(container.querySelectorAll('div')).find(el => el.style.width);
    expect(actualFill).toHaveStyle({ width: '0%' });
  });
});

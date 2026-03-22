import { describe, it, expect } from 'vitest';
import { renderTextWithLinks } from '../formatters';
import { render } from '@testing-library/react';

describe('formatters', () => {
  describe('renderTextWithLinks', () => {
    it('returns null if text is falsy', () => {
      expect(renderTextWithLinks(null)).toBeNull();
      expect(renderTextWithLinks('')).toBeNull();
    });

    it('returns array with string if no links present', () => {
      const result = renderTextWithLinks('Hello world');
      expect(result).toEqual(['Hello world']);
    });

    it('returns array with anchor elements for links inline with text', () => {
      const result = renderTextWithLinks('Hello https://notion.so world');
      
      // Render the resulting array of elements/strings into a div
      const { container } = render(<div>{result}</div>);
      
      expect(container.textContent).toBe('Hello https://notion.so world');
      
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor.getAttribute('href')).toBe('https://notion.so');
      expect(anchor.getAttribute('target')).toBe('_blank');
    });
  });
});

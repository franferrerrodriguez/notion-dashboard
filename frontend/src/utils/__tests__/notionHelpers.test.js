import { describe, it, expect } from 'vitest';
import { getMetaValue, resolveRelationNames } from '../notionHelpers';

describe('notionHelpers', () => {
  describe('getMetaValue', () => {
    const mockItem = {
      metadata: [
        { label: 'Status', value: 'Active' },
        { label: 'Priority', value: 'High' }
      ]
    };

    it('should return the correct value when label matches exactly', () => {
      expect(getMetaValue(mockItem, 'Status')).toBe('Active');
    });

    it('should be case-insensitive for labels', () => {
      expect(getMetaValue(mockItem, 'status')).toBe('Active');
      expect(getMetaValue(mockItem, 'PRIORITY')).toBe('High');
    });

    it('should return undefined if label does not exist', () => {
      expect(getMetaValue(mockItem, 'NonExistent')).toBeUndefined();
    });

    it('should return undefined if item or metadata is missing', () => {
      expect(getMetaValue(null, 'Status')).toBeUndefined();
      expect(getMetaValue({}, 'Status')).toBeUndefined();
    });
  });

  describe('resolveRelationNames', () => {
    const mockProjects = [
      { id: 'p1', identification: { name: 'Project Alpha' } },
      { id: 'p2', identification: { name: 'Project Beta' } }
    ];
    
    const mockOffers = [
      { id: 'o1', identification: { name: 'Offer 100' } }
    ];

    it('should return "-" if ids array is empty or undefined', () => {
      expect(resolveRelationNames([], 'project')).toBe('-');
      expect(resolveRelationNames(null, 'project')).toBe('-');
    });

    it('should resolve project names correctly', () => {
      const result = resolveRelationNames(['p1', 'p2'], 'project', mockProjects, mockOffers);
      expect(result).toBe('Project Alpha, Project Beta');
    });

    it('should resolve offer names correctly', () => {
      const result = resolveRelationNames(['o1'], 'offer', mockProjects, mockOffers);
      expect(result).toBe('Offer 100');
    });

    it('should return "..." for unknown ids', () => {
      const result = resolveRelationNames(['px'], 'project', mockProjects, mockOffers);
      expect(result).toBe('...');
    });
  });
});

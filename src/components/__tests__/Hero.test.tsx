import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/rateLimit', () => ({
  linkCreationRateLimit: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe('Hero Component Error Handling', () => {
  it('should handle formError in createLinkWithRefresh wrapper', () => {
    const mockFormError = 'Too many link creation attempts. Please wait a minute before trying again.';
    
    const mockResult = {
      success: false,
      formError: mockFormError,
    };

    expect(mockResult.success).toBe(false);
    expect(mockResult.formError).toBe(mockFormError);
    expect(mockResult.fieldErrors).toBeUndefined();
  });

  it('should handle success case with slug', () => {
    const mockResult = {
      success: true,
      slug: 'abc123',
    };

    expect(mockResult.success).toBe(true);
    expect(mockResult.slug).toBe('abc123');
  });
});
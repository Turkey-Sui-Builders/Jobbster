import { describe, it, expect } from 'vitest';

describe('HomePage - Simple Tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('can do math', () => {
    expect(1 + 1).toBe(2);
  });
});

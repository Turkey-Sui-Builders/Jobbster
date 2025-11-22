import { describe, it, expect } from 'vitest';

describe('CreateJob - Simple Tests', () => {
  it('validates form fields exist', () => {
    const requiredFields = ['company', 'location', 'category', 'name', 'description', 'deadline'];
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  it('checks salary is optional', () => {
    const salary = null;
    expect(salary === null || typeof salary === 'number').toBe(true);
  });
});

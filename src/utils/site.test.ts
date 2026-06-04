import { describe, it, expect } from 'vitest';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './site';

describe('site configuration', () => {
  it('should export a valid SITE_URL', () => {
    expect(SITE_URL).toBeTruthy();
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });

  it('should export SITE_NAME', () => {
    expect(SITE_NAME).toBe('Astro + TailwindCSS');
  });

  it('should export SITE_DESCRIPTION', () => {
    expect(SITE_DESCRIPTION).toBeTruthy();
    expect(SITE_DESCRIPTION.length).toBeGreaterThan(20);
  });

  it('SITE_URL should not have trailing slash', () => {
    expect(SITE_URL).not.toMatch(/\/$/);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the SITE_URL module before importing the route
vi.mock('../../utils/site', () => ({
  SITE_URL: 'https://astro-content-collections.pages.dev',
  SITE_NAME: 'isHistory',
  SITE_DESCRIPTION: 'isHistory is a curated digital archive of the stories behind technology.',
}));

// Import after mock is set up
import { GET } from '../robots.txt';

describe('robots.txt API route', () => {
  let response: Response;
  let body: string;

  beforeEach(async () => {
    response = await GET({} as any);
    body = await response.text();
  });

  it('should return status 200', () => {
    expect(response.status).toBe(200);
  });

  it('should return text/plain content type with utf-8', () => {
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
  });

  it('should allow all user-agents', () => {
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
  });

  it('should include the sitemap URL with SITE_URL', () => {
    expect(body).toContain('Sitemap: https://astro-content-collections.pages.dev/sitemap-index.xml');
  });

  it('should have exactly 3 lines', () => {
    const lines = body.trim().split('\n');
    expect(lines).toHaveLength(3);
  });

  it('should have lines in correct order: User-agent, Allow, Sitemap', () => {
    const lines = body.trim().split('\n');
    expect(lines[0]).toBe('User-agent: *');
    expect(lines[1]).toBe('Allow: /');
    expect(lines[2]).toBe('Sitemap: https://astro-content-collections.pages.dev/sitemap-index.xml');
  });
});

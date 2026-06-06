import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock astro:content — factory must be self-contained (no external variables)
// because vi.mock is hoisted to the top of the file.
vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockResolvedValue([
    {
      id: 'getting-started',
      data: {
        title: 'Getting Started with Content Collections',
        description: 'Learn how to use content collections.',
        pubDate: new Date('2026-01-15'),
        author: 'Astro Team',
        tags: ['astro', 'content'],
        draft: false,
      },
    },
    {
      id: 'tailwindcss-v4',
      data: {
        title: 'TailwindCSS v4 CSS-First Revolution',
        description: 'TailwindCSS v4 changes everything.',
        pubDate: new Date('2026-02-20'),
        author: 'Astro Team',
        tags: ['tailwindcss', 'css'],
        draft: false,
      },
    },
  ]),
}));

// Mock @astrojs/rss — simulate the RSS XML output
vi.mock('@astrojs/rss', () => ({
  default: vi.fn().mockImplementation((opts: any) => {
    const items = opts.items
      .map(
        (item: any) =>
          `    <item>\n      <title>${item.title}</title>\n      <link>${item.link}</link>\n      <description>${item.description}</description>\n      <author>${item.author}</author>\n      <pubDate>${item.pubDate.toISOString()}</pubDate>\n    </item>`
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${opts.title}</title>
    <description>${opts.description}</description>
    <link>${opts.site}</link>
    <language>en-us</language>
${items}
  </channel>
</rss>`;
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }),
}));

import { GET } from '../blog/rss.xml';

describe('RSS feed API route', () => {
  it('should throw if context.site is not defined', async () => {
    const context = { site: undefined };
    await expect(GET(context as any)).rejects.toThrow(
      'RSS feed requires a configured `site` URL in astro.config.mjs'
    );
  });

  describe('with valid site context', () => {
    let response: Response;
    let body: string;

    beforeEach(async () => {
      const context = {
        site: new URL('https://astro-content-collections.pages.dev'),
      };
      response = await GET(context as any);
      body = await response.text();
    });

    it('should return a response', () => {
      expect(response).toBeDefined();
    });

    it('should return XML content', () => {
      expect(body).toContain('<?xml');
      expect(body).toContain('<rss');
    });

    it('should include the feed title', () => {
      expect(body).toContain('isHistory Blog');
    });

    it('should include the feed description', () => {
      expect(body).toContain('Stories behind technology');
    });

    it('should include the site URL as channel link', () => {
      expect(body).toContain('https://astro-content-collections.pages.dev');
    });

    it('should include language element', () => {
      expect(body).toContain('<language>en-us</language>');
    });

    it('should include blog post items', () => {
      expect(body).toContain('Getting Started with Content Collections');
      expect(body).toContain('TailwindCSS v4 CSS-First Revolution');
    });

    it('should include post links as absolute URLs', () => {
      expect(body).toContain('https://astro-content-collections.pages.dev/blog/getting-started/');
      expect(body).toContain('https://astro-content-collections.pages.dev/blog/tailwindcss-v4/');
    });
  });
});

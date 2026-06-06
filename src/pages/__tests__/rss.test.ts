import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock astro:content — factory must be self-contained (no external variables)
// because vi.mock is hoisted to the top of the file.
vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockImplementation((name: string) => {
    if (name === 'blog') {
      return Promise.resolve([
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
      ]);
    }
    if (name === 'projects') {
      return Promise.resolve([
        {
          id: 'minds-and-machines/a1-the-ancient-dream',
          data: {
            title: 'A1 — The Ancient Dream of Artificial Life',
            description: 'Before there were computers, there was the dream.',
            startDate: new Date('2026-03-28'),
            status: 'active',
            track: 'articles',
            techStack: ['A-Series', 'Act I: The Dream'],
            tag: 'Key Article',
          },
        },
        {
          id: 'minds-and-machines/p1-ada-lovelace',
          data: {
            title: 'P1 — Ada Lovelace: The First Programmer',
            description: 'She wrote the first computer program in 1843.',
            startDate: new Date('2026-03-27'),
            status: 'active',
            track: 'profiles',
            techStack: ['P-Series'],
            tag: 'Key Figure',
          },
        },
        {
          id: 'minds-and-machines/a4-ada-lovelace-and-the-first-algorithm',
          data: {
            title: 'A4 — Ada Lovelace & The First Algorithm',
            description: 'The story of the first algorithm.',
            startDate: new Date('2026-04-18'),
            status: 'upcoming',
            track: 'articles',
            techStack: ['A-Series'],
            tag: 'Article',
          },
        },
        {
          id: 'console-wars',
          data: {
            title: 'Console Wars',
            description: 'The fight for your living room.',
            startDate: new Date('2027-01-15'),
            status: 'upcoming',
          },
        },
      ]);
    }
    return Promise.resolve([]);
  }),
}));

// Mock @astrojs/rss — simulate the RSS XML output
vi.mock('@astrojs/rss', () => ({
  default: vi.fn().mockImplementation((opts: Record<string, unknown>) => {
    const items = (opts.items as Array<Record<string, unknown>>)
      .map(
        (item) =>
          `    <item>\n      <title>${item.title}</title>\n      <link>${item.link}</link>\n      <description>${item.description}</description>\n      <author>${item.author}</author>\n      <pubDate>${(item.pubDate as Date).toISOString()}</pubDate>\n    </item>`
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${opts.title as string}</title>
    <description>${opts.description as string}</description>
    <link>${opts.site as string}</link>
    <language>en-us</language>
${items}
  </channel>
</rss>`;
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }),
}));

import { GET } from '../rss.xml';

describe('RSS feed API route (site-wide)', () => {
  it('should throw if context.site is not defined', async () => {
    const context = { site: undefined };
    await expect(GET(context as unknown as Parameters<typeof GET>[0])).rejects.toThrow(
      'RSS feed requires a configured `site` URL in astro.config.mjs'
    );
  });

  describe('with valid site context', () => {
    let response: Response;
    let body: string;

    beforeEach(async () => {
      const context = {
        site: new URL('https://ishistory.dev'),
      };
      response = await GET(context as unknown as Parameters<typeof GET>[0]);
      body = await response.text();
    });

    it('should return a response', () => {
      expect(response).toBeDefined();
    });

    it('should return XML content', () => {
      expect(body).toContain('<?xml');
      expect(body).toContain('<rss');
    });

    it('should include the site-wide feed title', () => {
      expect(body).toContain('isHistory');
    });

    it('should include the site-wide feed description', () => {
      expect(body).toContain('Mapping the digital past');
    });

    it('should include the site URL as channel link', () => {
      expect(body).toContain('https://ishistory.dev');
    });

    it('should include language element', () => {
      expect(body).toContain('<language>en-us</language>');
    });

    it('should include blog post items', () => {
      expect(body).toContain('Getting Started with Content Collections');
      expect(body).toContain('TailwindCSS v4 CSS-First Revolution');
    });

    it('should include series article items', () => {
      expect(body).toContain('A1 — The Ancient Dream of Artificial Life');
      expect(body).toContain('P1 — Ada Lovelace: The First Programmer');
    });

    it('should exclude series index pages (no / in id)', () => {
      // "Console Wars" is a series index page (no / in id), not an article.
      // It should NOT appear in the feed regardless of status.
      expect(body).not.toContain('Console Wars');
    });

    it('should include upcoming series articles (articles with / in id)', () => {
      // Articles with status 'upcoming' but that have content (contain / in id)
      // should still appear in the feed — status is a lifecycle label, not a draft flag.
      expect(body).toContain('A4 — Ada Lovelace & The First Algorithm');
      expect(body).toContain('https://ishistory.dev/series/minds-and-machines/a4-ada-lovelace-and-the-first-algorithm/');
    });

    it('should include blog post links as absolute URLs', () => {
      expect(body).toContain('https://ishistory.dev/blog/getting-started/');
      expect(body).toContain('https://ishistory.dev/blog/tailwindcss-v4/');
    });

    it('should include series article links as absolute URLs', () => {
      expect(body).toContain('https://ishistory.dev/series/minds-and-machines/a1-the-ancient-dream/');
      expect(body).toContain('https://ishistory.dev/series/minds-and-machines/p1-ada-lovelace/');
    });

    it('should sort items by date (newest first)', () => {
      const titlePositions = [
        body.indexOf('TailwindCSS v4'), // 2026-02-20
        body.indexOf('A1 — The Ancient Dream'), // 2026-03-28
      ];
      // Series article (March) should appear before blog post (February)
      // because it's newer
      expect(titlePositions[1]).toBeLessThan(titlePositions[0]);
    });
  });
});

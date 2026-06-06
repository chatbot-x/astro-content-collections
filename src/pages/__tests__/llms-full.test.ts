import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock content collections
const mockBlogPosts = [
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
    body: 'This is the body of the getting started post.',
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
    body: 'This is the body of the tailwindcss post.',
  },
];

const mockSeries = [
  {
    id: 'minds-and-machines',
    data: {
      title: 'Minds & Machines: The Story of AI',
      description: 'A 75-article deep-dive into the full history of Artificial Intelligence.',
      startDate: new Date('2026-01-15'),
      status: 'active',
      featured: true,
      techStack: ['Articles', 'Profiles', 'Events'],
      url: 'https://astro-content-collections.pages.dev/blog/',
    },
    body: 'Minds & Machines is a 75-article deep-dive into the full history of AI.',
  },
];

vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockImplementation((collection: string, filter?: any) => {
    if (collection === 'blog') {
      const posts = mockBlogPosts.filter((p) => (filter ? filter(p) : true));
      return Promise.resolve(posts);
    }
    if (collection === 'projects') {
      return Promise.resolve(mockSeries);
    }
    return Promise.resolve([]);
  }),
}));

vi.mock('../../utils/site', () => ({
  SITE_URL: 'https://astro-content-collections.pages.dev',
  SITE_NAME: 'isHistory',
  SITE_DESCRIPTION: 'isHistory is a curated digital archive of the stories behind technology.',
}));

import { GET } from '../llms-full.txt';

describe('llms-full.txt API route', () => {
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

  it('should include the site name as markdown heading', () => {
    expect(body).toContain('# isHistory');
  });

  it('should include the site description as blockquote', () => {
    expect(body).toContain('> isHistory is a curated digital archive');
  });

  it('should include the site URL', () => {
    expect(body).toContain('Site: https://astro-content-collections.pages.dev');
  });

  it('should include horizontal rule separators', () => {
    expect(body).toContain('---');
  });

  it('should include blog post titles as markdown h2', () => {
    expect(body).toContain('## Getting Started with Content Collections');
    expect(body).toContain('## TailwindCSS v4 CSS-First Revolution');
  });

  it('should include blog post metadata (URL, Published, Author)', () => {
    expect(body).toContain('URL: https://astro-content-collections.pages.dev/blog/getting-started/');
    expect(body).toContain('Published: 2026-01-15');
    expect(body).toContain('Author: Astro Team');
  });

  it('should include blog post tags', () => {
    expect(body).toContain('Tags: astro, content');
  });

  it('should include blog post descriptions as blockquotes', () => {
    expect(body).toContain('> Learn how to use content collections.');
    expect(body).toContain('> TailwindCSS v4 changes everything.');
  });

  it('should include blog post bodies', () => {
    expect(body).toContain('This is the body of the getting started post.');
    expect(body).toContain('This is the body of the tailwindcss post.');
  });

  it('should include series titles as markdown h2', () => {
    expect(body).toContain('## Minds & Machines: The Story of AI');
  });

  it('should include series metadata', () => {
    expect(body).toContain('URL: https://astro-content-collections.pages.dev/series/minds-and-machines/');
    expect(body).toContain('Status: active');
    expect(body).toContain('Featured: Yes');
    expect(body).toContain('Tech Stack: Articles, Profiles, Events');
  });

  it('should not have excessive blank lines (max 2 consecutive newlines)', () => {
    expect(body).not.toMatch(/\n{3,}/);
  });

  it('should end with a newline', () => {
    expect(body.endsWith('\n')).toBe(true);
  });
});

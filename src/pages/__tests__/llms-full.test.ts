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

const mockProjects = [
  {
    id: 'documentation-site-generator',
    data: {
      title: 'Documentation Site Generator',
      description: 'A documentation site built with Astro.',
      startDate: new Date('2026-01-01'),
      status: 'active',
      featured: true,
      techStack: ['Astro', 'Markdown'],
      url: 'https://docs.example.com',
      repo: 'https://github.com/example/docs',
    },
    body: 'This is the body of the documentation project.',
  },
];

vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockImplementation((collection: string, filter?: any) => {
    if (collection === 'blog') {
      const posts = mockBlogPosts.filter((p) => (filter ? filter(p) : true));
      return Promise.resolve(posts);
    }
    if (collection === 'projects') {
      return Promise.resolve(mockProjects);
    }
    return Promise.resolve([]);
  }),
}));

vi.mock('../../utils/site', () => ({
  SITE_URL: 'https://astro-content-collections.pages.dev',
  SITE_NAME: 'Astro + TailwindCSS',
  SITE_DESCRIPTION: 'A modern static site built with Astro v6, TailwindCSS v4.',
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
    expect(body).toContain('# Astro + TailwindCSS');
  });

  it('should include the site description as blockquote', () => {
    expect(body).toContain('> A modern static site built with Astro v6');
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

  it('should include project titles as markdown h2', () => {
    expect(body).toContain('## Documentation Site Generator');
  });

  it('should include project metadata', () => {
    expect(body).toContain('URL: https://astro-content-collections.pages.dev/projects/documentation-site-generator/');
    expect(body).toContain('Status: active');
    expect(body).toContain('Featured: Yes');
    expect(body).toContain('Tech Stack: Astro, Markdown');
    expect(body).toContain('Live URL: https://docs.example.com');
    expect(body).toContain('Repo: https://github.com/example/docs');
  });

  it('should not have excessive blank lines (max 2 consecutive newlines)', () => {
    expect(body).not.toMatch(/\n{3,}/);
  });

  it('should end with a newline', () => {
    expect(body.endsWith('\n')).toBe(true);
  });
});

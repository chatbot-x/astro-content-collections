import { describe, it, expect, vi } from 'vitest';

// Mock content collections
const mockBlogPosts = [
  {
    id: 'getting-started',
    data: {
      title: 'Getting Started with Content Collections',
      description: 'Learn how to use content collections.',
      pubDate: new Date('2026-01-15'),
      draft: false,
    },
  },
  {
    id: 'tailwindcss-v4',
    data: {
      title: 'TailwindCSS v4 CSS-First Revolution',
      description: 'TailwindCSS v4 changes everything.',
      pubDate: new Date('2026-02-20'),
      draft: false,
    },
  },
];

const mockProjects = [
  {
    id: 'documentation-site-generator',
    data: {
      title: 'Documentation Site Generator',
      description: 'A documentation site built with Astro.',
    },
  },
  {
    id: 'astro-project-hub',
    data: {
      title: 'Astro Project Hub',
      description: 'A hub for Astro projects.',
    },
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

// Mock astro-og-canvas
vi.mock('astro-og-canvas', () => ({
  generateOpenGraphImage: vi.fn().mockResolvedValue(Buffer.from('fake-png-data')),
}));

describe('OG Image Routes - Static Paths', () => {
  describe('Blog OG images', () => {
    it('should export getStaticPaths that returns entries for each blog post', async () => {
      const { getStaticPaths } = await import('../og/blog/[...route].ts');
      const paths = await getStaticPaths();
      expect(paths).toHaveLength(2);
      expect(paths[0].params.route).toBe('getting-started.png');
      expect(paths[0].props).toEqual({
        title: 'Getting Started with Content Collections',
        description: 'Learn how to use content collections.',
      });
      expect(paths[1].params.route).toBe('tailwindcss-v4.png');
    });

    it('should include .png extension in route params', async () => {
      const { getStaticPaths } = await import('../og/blog/[...route].ts');
      const paths = await getStaticPaths();
      for (const path of paths) {
        expect(path.params.route).toMatch(/\.png$/);
      }
    });

    it('should not include draft posts in static paths', async () => {
      const { getStaticPaths } = await import('../og/blog/[...route].ts');
      const paths = await getStaticPaths();
      expect(paths).toHaveLength(2);
      const routeSlugs = paths.map((p: any) => p.params.route);
      expect(routeSlugs).not.toContain('draft-post.png');
    });
  });

  describe('Projects OG images', () => {
    it('should export getStaticPaths that returns entries for each project', async () => {
      const { getStaticPaths } = await import('../og/projects/[...route].ts');
      const paths = await getStaticPaths();
      expect(paths).toHaveLength(2);
      expect(paths[0].params.route).toBe('documentation-site-generator.png');
      expect(paths[0].props).toEqual({
        title: 'Documentation Site Generator',
        description: 'A documentation site built with Astro.',
      });
      expect(paths[1].params.route).toBe('astro-project-hub.png');
    });

    it('should include .png extension in route params', async () => {
      const { getStaticPaths } = await import('../og/projects/[...route].ts');
      const paths = await getStaticPaths();
      for (const path of paths) {
        expect(path.params.route).toMatch(/\.png$/);
      }
    });
  });
});

describe('OG Image Routes - GET handler', () => {
  it('should return PNG image with correct content type for blog', async () => {
    const { GET } = await import('../og/blog/[...route].ts');
    const response = await GET({
      props: { title: 'Test Post', description: 'Test description' },
    } as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('should return PNG image with correct content type for projects', async () => {
    const { GET } = await import('../og/projects/[...route].ts');
    const response = await GET({
      props: { title: 'Test Project', description: 'Test description' },
    } as any);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
  });

  it('should call generateOpenGraphImage for blog OG images', async () => {
    const { generateOpenGraphImage } = await import('astro-og-canvas');
    const { GET } = await import('../og/blog/[...route].ts');
    await GET({
      props: { title: 'Test Post', description: 'Test desc' },
    } as any);
    expect(generateOpenGraphImage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Post',
        description: 'Test desc',
      })
    );
  });

  it('should call generateOpenGraphImage for project OG images', async () => {
    const { generateOpenGraphImage } = await import('astro-og-canvas');
    const { GET } = await import('../og/projects/[...route].ts');
    await GET({
      props: { title: 'Test Project', description: 'Test desc' },
    } as any);
    expect(generateOpenGraphImage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Project',
        description: 'Test desc',
      })
    );
  });
});

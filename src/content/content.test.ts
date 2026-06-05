import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Replicate the schemas from content.config.ts for unit testing.
// The actual config uses astro:content which can't be imported in vitest,
// but the Zod schemas are what we're really testing.

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  author: z.string().default('Astro Team'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  articleType: z.enum(['Article', 'BlogPosting', 'TechArticle', 'NewsArticle', 'ScholarlyArticle', 'Report']).default('BlogPosting'),
});

const seriesSchema = z.object({
  title: z.string(),
  description: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  url: z.string().url().optional(),
  repo: z.string().url().optional(),
  techStack: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  heroImage: z.string().optional(),
});

describe('Blog Collection Schema', () => {
  it('should validate a valid blog post', () => {
    const result = blogSchema.safeParse({
      title: 'Test Post',
      description: 'A test description',
      pubDate: '2026-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('should apply defaults for optional fields', () => {
    const result = blogSchema.parse({
      title: 'Test Post',
      description: 'A test description',
      pubDate: '2026-01-01',
    });
    expect(result.author).toBe('Astro Team');
    expect(result.tags).toEqual([]);
    expect(result.draft).toBe(false);
    expect(result.articleType).toBe('BlogPosting');
  });

  it('should reject missing required fields', () => {
    const result = blogSchema.safeParse({
      description: 'A test description',
    });
    expect(result.success).toBe(false);
  });

  it('should coerce date strings to Date objects', () => {
    const result = blogSchema.parse({
      title: 'Test Post',
      description: 'A test description',
      pubDate: '2026-01-01',
    });
    expect(result.pubDate).toBeInstanceOf(Date);
  });

  it('should reject invalid articleType', () => {
    const result = blogSchema.safeParse({
      title: 'Test Post',
      description: 'A test description',
      pubDate: '2026-01-01',
      articleType: 'InvalidType',
    });
    expect(result.success).toBe(false);
  });
});

describe('Series Collection Schema', () => {
  it('should validate a valid series', () => {
    const result = seriesSchema.safeParse({
      title: 'Test Series',
      description: 'A test series',
      startDate: '2026-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('should apply defaults for optional fields', () => {
    const result = seriesSchema.parse({
      title: 'Test Series',
      description: 'A test series',
      startDate: '2026-01-01',
    });
    expect(result.status).toBe('active');
    expect(result.techStack).toEqual([]);
    expect(result.featured).toBe(false);
  });

  it('should reject invalid URL format', () => {
    const result = seriesSchema.safeParse({
      title: 'Test Series',
      description: 'A test series',
      startDate: '2026-01-01',
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid URLs', () => {
    const result = seriesSchema.safeParse({
      title: 'Test Series',
      description: 'A test series',
      startDate: '2026-01-01',
      url: 'https://example.com',
      repo: 'https://github.com/example/repo',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = seriesSchema.safeParse({
      title: 'Test Series',
      description: 'A test series',
      startDate: '2026-01-01',
      status: 'unknown',
    });
    expect(result.success).toBe(false);
  });
});

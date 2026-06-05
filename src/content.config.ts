import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().default('Astro Team'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Phase 2: Schema.org article type
    articleType: z.enum(['Article', 'BlogPosting', 'TechArticle', 'NewsArticle', 'ScholarlyArticle', 'Report']).default('BlogPosting'),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['active', 'completed', 'archived', 'upcoming']).default('active'),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    techStack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    heroImage: z.string().optional(),
    // Series-specific fields
    tagline: z.string().optional(),
    hook: z.string().optional(),
    articleCount: z.number().optional(),
    wordCount: z.string().optional(),
    tracks: z.array(z.object({
      name: z.string(),
      code: z.string(),
      description: z.string(),
    })).optional(),
    acts: z.array(z.object({
      name: z.string(),
      roman: z.string(),
      description: z.string(),
    })).optional(),
    // Article-specific fields (for individual posts inside series subfolders)
    series: z.string().optional(),
    track: z.string().optional(),
    episodeNumber: z.number().optional(),
    roman: z.string().optional(),
    part: z.string().optional(),
    partLabel: z.string().optional(),
    tag: z.string().optional(),
    connectsTo: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, projects };

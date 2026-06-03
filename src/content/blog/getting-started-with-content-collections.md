---
title: "Getting Started with Astro Content Collections"
description: "Learn how to leverage Astro's type-safe content collections to manage your Markdown and MDX content with built-in schema validation."
pubDate: 2026-05-20
author: "Astro Team"
tags: ["astro", "content-collections", "markdown"]
heroImage: ""
draft: false
---

Content Collections are one of Astro's most powerful features, allowing you to organize, validate, and query your content in a type-safe manner. Whether you're building a blog, documentation site, or portfolio, content collections provide the structure you need to scale your project confidently.

## What Are Content Collections?

Content Collections are a way to group related content — like blog posts, documentation pages, or project showcases — into named directories with a shared schema. Each collection lives in `src/content/<collection-name>/` and is validated against a Zod schema defined in your `content.config.ts` file.

This means you get **runtime validation** of your frontmatter fields, **TypeScript autocompletion** in your editor, and **build-time errors** when something is wrong — all without any extra configuration.

## Setting Up Your First Collection

To define a collection, you create a `content.config.ts` file at the root of your `src/` directory. Here's a simple blog collection:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default('Astro Team'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

The `glob()` loader tells Astro to scan the `src/content/blog/` directory for Markdown and MDX files. The `schema` uses Zod to validate the frontmatter of every entry.

## Querying Collections in Pages

Once your collection is defined, you can query it from any `.astro` page using `getCollection()`:

```astro
---
import { getCollection } from 'astro:content';

const allPosts = await getCollection('blog', ({ data }) => {
  return !data.draft;
});
---
```

This returns an array of collection entries, each with a `data` property containing the validated frontmatter and a `body` property with the raw Markdown content. You can render the body using the `<Content />` component or the `render()` function.

## Type Safety Benefits

The real power comes from the generated TypeScript types. When you access `entry.data.title`, TypeScript knows it's a `string` because your schema says so. If you mark a field as optional with `z.string().optional()`, TypeScript will enforce null checks. This catches bugs before they ever reach your users.

Content Collections also support **relations** between collections, allowing you to reference entries from one collection in another — perfect for author profiles, categories, or related posts.

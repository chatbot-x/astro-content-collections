# Astro + TailwindCSS — Content Collections Site

A modern static site built with **Astro v6**, **TailwindCSS v4**, and type-safe **Content Collections**. Features blog posts, project showcases, dark mode, full-text search, and AI-ready SEO with structured data and knowledge graphs.

## Features

- **Astro v6** — Island architecture with zero JavaScript by default
- **TailwindCSS v4** — CSS-first configuration via `@tailwindcss/vite`
- **Content Collections** — Zod-validated frontmatter with TypeScript autocompletion
- **Dark Mode** — 3-mode theme system (Light / Dark / System) with FOUC prevention
- **Full-Text Search** — Powered by Pagefind with keyboard shortcut (Cmd/Ctrl+K)
- **OG Images** — Auto-generated Open Graph images via `astro-og-canvas`
- **SEO** — Schema.org knowledge graph, RSS feed, sitemap, llms.txt, IndexNow
- **CSP** — Content Security Policy with SHA-256 hashing
- **Compression** — Pre-compressed static files (gzip + brotli + zstd)
- **Callouts** — GitHub-style admonitions via `rehype-callouts`
- **Wiki Links** — `[[wiki-link]]` syntax via `@flowershow/remark-wiki-link`

## Project Structure

```
astro-content-collections/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── content/         # Content Collections (Markdown)
│   │   ├── blog/        # Blog posts
│   │   └── projects/    # Project entries
│   ├── layouts/         # Page layouts
│   ├── pages/           # File-based routing
│   ├── styles/          # TailwindCSS v4 + Dark mode
│   ├── utils/           # SEO graph schema builders
│   └── content.config.ts
├── astro.config.mjs     # Astro + integrations
├── tsconfig.json
└── package.json
```

## Commands

| Command               | Action                                           |
| :-------------------- | :----------------------------------------------- |
| `npm install`         | Installs dependencies                            |
| `npm run dev`         | Starts local dev server at `localhost:4321`      |
| `npm run build`       | Build your production site to `./dist/`          |
| `npm run preview`     | Preview your build locally, before deploying     |
| `npm run lint`        | Run ESLint on the project                        |

## Environment Variables

| Variable         | Description                                      | Required |
| :--------------- | :----------------------------------------------- | :------- |
| `INDEXNOW_KEY`   | API key for IndexNow instant search engine indexing | No     |

## Content Collections

### Blog

Blog posts live in `src/content/blog/` and support the following frontmatter:

```yaml
---
title: "Post Title"
description: "Post description"
pubDate: 2026-01-01
updatedDate: 2026-01-15    # optional
heroImage: "/path/to/img"  # optional
author: "Author Name"       # defaults to "Astro Team"
tags: ["astro", "web"]     # optional
draft: false                # optional, defaults to false
articleType: "BlogPosting"  # optional, defaults to "BlogPosting"
---
```

### Projects

Projects live in `src/content/projects/` and support:

```yaml
---
title: "Project Name"
description: "Project description"
startDate: 2026-01-01
endDate: 2026-06-01        # optional
status: "active"            # active | completed | archived
url: "https://example.com" # optional
repo: "https://github.com/..." # optional
techStack: ["Astro", "TypeScript"]
featured: false             # optional, defaults to false
heroImage: "/path/to/img"  # optional
---
```

## License

MIT

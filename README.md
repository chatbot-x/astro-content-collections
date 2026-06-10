# isHistory — Mapping the Digital Past

![](https://raw.githubusercontent.com/chatbot-x/isHistory-CMS-v1.7/main/images/2026/06/22526-mq8pximqicm.png)

> A curated digital archive of the stories behind technology — how ideas sparked, why systems failed or succeeded, and the people who shaped the digital age.

Built with **Astro v6**, **TailwindCSS v4**, and type-safe **Content Collections**. isHistory is not a developer's manual — it's a history book for the digital age, built for anyone who has ever wondered *how did we actually get here?*

***

## Features

### Content & Storytelling

* **Series-based narratives** — Multi-track, multi-act long-form content (e.g., 75-article *Minds & Machines* on AI history)
* **Three-track structure** — Each series is organized into **A-Series** (analytical articles), **P-Series** (people profiles), and **E-Series** (events timeline)
* **Read Alongside** — Curated cross-track links between thematically related articles (e.g., a profile of Minsky connects to an article on the AI Winter)
* **Track-aware navigation** — Previous/Next navigation stays within the same track, so readers follow a coherent narrative path
* **Blog** — Standalone posts on web development, tooling, and content workflows

### Technical

* **Astro v6** — Island architecture with zero JavaScript by default; Content Layer API for type-safe content
* **TailwindCSS v4** — CSS-first configuration via `@tailwindcss/vite`; no JavaScript config file needed
* **Content Collections** — Zod-validated frontmatter with full TypeScript autocompletion and build-time validation
* **Dark Mode** — 3-mode theme system (Light / Dark / System) with FOUC prevention, cross-tab sync, and WAI-ARIA keyboard navigation
* **Full-Text Search** — Pagefind-powered search with `Cmd/Ctrl+K` shortcut, themed for both light and dark modes
* **OG Images** — Auto-generated Open Graph images via `astro-og-canvas`
* **AI-Ready SEO** — Schema.org knowledge graph with JSON-LD, `llms.txt` for LLM discoverability, build-time SEO validators, and IndexNow instant re-indexing
* **Security** — CSP meta tags (pending upstream fix for HTTP header CSP), SRI hash injection, security headers via Cloudflare Pages `_headers`
* **Compression** — Pre-compressed static files (gzip + brotli + zstd) via `astro-compressor`
* **Markdown** — GitHub-style callouts via `rehype-callouts` and `[[wiki-link]]` syntax via `@flowershow/remark-wiki-link`

***

## Project Structure

```
isHistory/
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint, test, build, and preview deploy
├── public/
│   ├── _headers                # Cloudflare Pages security headers
│   ├── favicon.ico             # Site favicon
│   ├── favicon.png
│   ├── favicon.svg
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   └── og-default.jpg          # Default OG image fallback
├── scripts/
│   └── inject-sri.mjs          # Post-build SRI hash injection
├── src/
│   ├── code-examples/          # Raw text files for the About page
│   ├── components/
│   │   ├── FeatureCard.astro   # Feature highlight card
│   │   ├── Features.astro      # Homepage features grid
│   │   ├── Footer.astro        # Site footer
│   │   ├── Hero.astro          # Homepage hero section
│   │   ├── LatestPosts.astro   # Latest blog posts list
│   │   ├── Navbar.astro        # Navigation bar with theme toggle
│   │   ├── SearchModal.astro   # Pagefind search overlay
│   │   ├── ThemeProvider.astro  # Dark mode FOUC prevention script
│   │   └── ThemeToggle.astro   # 3-mode theme toggle button
│   ├── content/
│   │   ├── blog/               # Blog posts (Markdown)
│   │   └── projects/           # Series & articles (Markdown)
│   │       ├── minds-and-machines/
│   │       │   ├── a1-*.md     # A-Series articles
│   │       │   ├── p1-*.md     # P-Series profiles
│   │       │   └── e1-*.md     # E-Series events
│   │       ├── console-wars.md
│   │       └── the-wire.md
│   ├── layouts/
│   │   ├── BlogPost.astro      # Blog post layout
│   │   ├── Layout.astro        # Base layout (head, nav, footer)
│   │   └── ProjectPage.astro   # Series overview layout
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── about.astro         # About page
│   │   ├── 404.astro           # Not found page
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing
│   │   │   ├── [...slug].astro # Blog post page
│   │   │   └── rss.xml.ts      # RSS feed
│   │   ├── series/
│   │   │   ├── index.astro     # Series listing
│   │   │   ├── [slug].astro    # Series overview page
│   │   │   └── [slug]/
│   │   │       └── [...articleSlug].astro  # Article page
│   │   ├── og/                 # Auto-generated OG images
│   │   ├── llms-full.txt.ts    # Full content for LLM consumption
│   │   └── robots.txt.ts       # Robots.txt with AI crawler rules
│   ├── styles/
│   │   └── global.css          # TailwindCSS v4 + dark mode styles
│   ├── utils/
│   │   ├── readingTime.ts      # Reading time calculator
│   │   ├── site.ts             # Site URL from Astro config
│   │   ├── statusColors.ts     # Status badge colors & labels
│   │   └── schema/
│   │       └── index.ts        # Schema.org graph builders
│   ├── content.config.ts       # Content Collection schemas
│   ├── env.d.ts                # Astro type references
│   └── global.d.ts             # Window type declarations
├── astro.config.mjs            # Astro + integrations configuration
├── eslint.config.js            # ESLint flat config
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

***

## Quick Start

### Prerequisites

* **Node.js** >\= 22.12.0 (specified in `.nvmrc`)
* **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/chatbot-x/astro-content-collections.git
cd astro-content-collections

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The site will be available at `http://localhost:4321`.

### Build for Production

```bash
npm run build
```

This runs `astro build` followed by `scripts/inject-sri.mjs` which injects Subresource Integrity hashes into the built HTML. The output goes to `./dist/`.

### Preview the Build

```bash
npm run preview
```

***

## Commands

| Command              | Action                                      |
| :------------------- | :------------------------------------------ |
| `npm install`        | Installs dependencies                       |
| `npm run dev`        | Starts local dev server at `localhost:4321` |
| `npm run build`      | Build production site + inject SRI hashes   |
| `npm run preview`    | Preview the production build locally        |
| `npm run lint`       | Run ESLint on the project                   |
| `npm test`           | Run Vitest test suite                       |
| `npm run test:watch` | Run Vitest in watch mode                    |

***

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

### Series

Series entries live in `src/content/projects/`. Each series has an **index file** at the root (e.g., `minds-and-machines.md`) and **article files** in a subfolder (e.g., `minds-and-machines/a1-the-ancient-dream-of-artificial-life.md`).

**Series index frontmatter:**

```yaml
---
title: "Minds & Machines"
description: "The complete story of artificial intelligence"
startDate: 2025-01-01
status: "active"            # active | completed | archived | upcoming
tagline: "From ancient dreams to modern breakthroughs"
hook: "What if machines could think?"
articleCount: 75
wordCount: "150,000+"
tracks:
  - name: "Articles"
    code: "articles"
    description: "Analytical deep dives"
  - name: "Profiles"
    code: "profiles"
    description: "People who shaped AI"
  - name: "Events"
    code: "events"
    description: "Key moments in AI history"
acts:
  - name: "Act I"
    roman: "I"
    description: "The Ancient Dream"
techStack: ["AI", "History", "Technology"]
---
```

**Article frontmatter:**

```yaml
---
title: "The Ancient Dream of Artificial Life"
description: "From golems to clockwork ducks..."
startDate: 2025-01-01
series: "minds-and-machines"
track: "articles"           # articles | profiles | events
episodeNumber: 1
roman: "I"
part: "1"
partLabel: "Act I"
tag: "origins"
connectsTo:                 # optional — curated cross-track links
  - "p1-ada-lovelace"
  - "e1-the-dartmouth-conference-1956"
---
```

The `connectsTo` field powers the **Read Alongside** feature, which surfaces thematically related articles from other tracks on every article page.

***

## Current Series

| Series               | Status   | Articles | Description                                                                                                   |
| -------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| **Minds & Machines** | Active   | 75+      | The complete story of artificial intelligence — from ancient dreams of artificial life to the race toward AGI |
| **The Wire**         | Upcoming | —        | The history of the internet and global connectivity                                                           |
| **Console Wars**     | Upcoming | —        | The battles that defined the gaming industry                                                                  |

***

## Architecture Decisions

Key architectural decisions are documented in [CONTRIBUTING.md](./CONTRIBUTING.md):

* **ADR-001: Custom Dark Mode** — A custom 3-mode system instead of community integrations, for full WAI-ARIA support and cross-tab sync
* **ADR-002: SITE\_URL Single Source of Truth** — `astro.config.mjs` is the sole source; `src/utils/site.ts` reads via `import.meta.env.SITE`
* **ADR-003: External Code Examples** — Loaded from files via `?raw` imports rather than hardcoded string literals

***

## Environment Variables

| Variable       | Description                                         | Required |
| :------------- | :-------------------------------------------------- | :------- |
| `INDEXNOW_KEY` | API key for IndexNow instant search engine indexing | No       |

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Generate an IndexNow key with:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

***

## Deployment

The project is configured for **Cloudflare Pages** with a GitHub Actions CI pipeline (`.github/workflows/ci.yml`):

1. **Lint & Test** — Runs ESLint and Vitest on every push/PR to `main`
2. **Build** — Builds the production site and uploads artifacts
3. **Preview Deploy** — Deploys to Cloudflare Pages preview on PRs (requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets)

Security headers are configured in `public/_headers` (X-Frame-Options, HSTS, CSP workaround notes, etc.).

***

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for security boundaries, architecture decision records, and code style guidelines.

***

## Tech Stack

| Category    | Technology                                                             |
| :---------- | :--------------------------------------------------------------------- |
| Framework   | [Astro](https://astro.build/) v6.4                                     |
| Styling     | [TailwindCSS](https://tailwindcss.com/) v4.3                           |
| Content     | Astro Content Layer API + Zod schemas                                  |
| Search      | [Pagefind](https://pagefind.app/)                                      |
| SEO         | [@jdevalk/astro-seo-graph](https://github.com/jdevalk/astro-seo-graph) |
| OG Images   | [astro-og-canvas](https://github.com/delucis/astro-og-canvas)          |
| Compression | [astro-compressor](https://github.com/nicokant/astro-compressor)       |
| Markdown    | rehype-callouts, @flowershow/remark-wiki-link                          |
| Testing     | [Vitest](https://vitest.dev/)                                          |
| Linting     | [ESLint](https://eslint.org/) v9                                       |
| CI/CD       | GitHub Actions + Cloudflare Pages                                      |
| Runtime     | Node.js >\= 22.12                                                      |

***

## License

[MIT](./LICENSE)
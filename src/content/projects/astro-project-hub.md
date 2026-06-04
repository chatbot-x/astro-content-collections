---
title: "Astro Project Hub"
description: "A modern content-driven website built with Astro v6 and TailwindCSS v4, featuring type-safe content collections and island architecture."
startDate: 2026-05-15
status: "active"
url: "https://astro-content-collections.pages.dev"
repo: "https://github.com/chatbot-x/astro-content-collections"
techStack: ["Astro", "TailwindCSS", "TypeScript", "Vite"]
featured: true
---

## Project Overview

Astro Project Hub is a content-driven website that demonstrates the power of Astro's island architecture combined with TailwindCSS v4's utility-first approach. The site features blog posts, project showcases, and dynamic content — all managed through Astro's type-safe content collections.

## Key Features

- **Content Collections**: Blog posts and projects managed with Zod-validated schemas, ensuring type safety from frontmatter to rendered output.
- **Zero JavaScript by Default**: Static HTML rendering ensures instant page loads. Interactive components hydrate independently as islands.
- **TailwindCSS v4**: CSS-first configuration with the native Vite plugin. No JavaScript config files needed.
- **Responsive Design**: Fully responsive layout using TailwindCSS utility classes with mobile-first breakpoints.

## Technical Architecture

The project uses Astro's Content Layer API with the `glob()` loader to scan local Markdown files. Each collection has a defined schema that validates frontmatter at build time, catching errors before deployment. The build output is purely static HTML with minimal JavaScript for interactive components.

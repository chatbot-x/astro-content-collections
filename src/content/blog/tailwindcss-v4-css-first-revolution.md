---
title: "TailwindCSS v4: The CSS-First Revolution"
description: "Explore how TailwindCSS v4 eliminates config files, embraces CSS-native patterns, and delivers a faster developer experience with the Vite plugin."
pubDate: 2026-05-28
author: "Astro Team"
tags: ["tailwindcss", "css", "vite"]
draft: false
---

TailwindCSS v4 represents a fundamental shift in how we configure and use utility-first CSS. Gone are the days of maintaining a JavaScript configuration file — v4 embraces a CSS-first approach that feels more natural, requires less boilerplate, and integrates seamlessly with modern build tools like Vite.

## What Changed in v4?

The biggest change is the move from `tailwind.config.js` to CSS-native configuration. Instead of exporting a JavaScript object with your theme overrides, you now use `@theme` directives directly in your CSS:

```css
@import "tailwindcss";

@theme {
  --color-brand: #6366f1;
  --font-display: "Inter", sans-serif;
}
```

This means your configuration lives where your styles live — in CSS files. It's a paradigm shift that makes the relationship between configuration and output more transparent.

## Automatic Content Detection

TailwindCSS v4 eliminates the need for the `content` array in your config. The Vite plugin automatically detects which files to scan based on your project structure. This means:

- **No more configuring globs** for your component directories
- **No more stale caches** when you add new files
- **Faster builds** because the scanner only processes what Vite knows about

## The Vite Plugin

For Astro projects, the integration is beautifully simple. Just add `@tailwindcss/vite` to your Astro config's Vite plugins:

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
```

No PostCSS config, no `tailwind.config.js`, no `postcss.config.js`. Just two lines of code and you're fully set up.

## Performance Improvements

TailwindCSS v4 is built on a new engine called Oxide, written in Rust. This delivers:

- **10x faster full builds** compared to v3
- **100x faster incremental builds** during development
- **Smaller generated CSS** through improved tree-shaking

The performance difference is immediately noticeable, especially in large projects with thousands of utility classes. What used to take seconds now happens in milliseconds.

## Migration Considerations

If you're upgrading from v3, most utility classes work exactly the same. The main breaking changes are around configuration — you'll need to convert your JavaScript config to CSS `@theme` directives. Tailwind provides a migration tool that handles most of this automatically.

The `@apply` directive still works, though the recommended pattern is to use utility classes directly in your HTML. For component-level styling, the `@theme` directive gives you a cleaner way to define reusable design tokens.

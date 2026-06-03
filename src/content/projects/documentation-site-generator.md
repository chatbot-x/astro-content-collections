---
title: "Documentation Site Generator"
description: "A CLI tool and template system for generating beautiful documentation sites from Markdown files with automatic API reference generation."
startDate: 2025-08-01
endDate: 2025-10-30
status: "completed"
url: "https://docs-gen.example.com"
techStack: ["Astro", "MDX", "Shiki", "TailwindCSS", "Node.js"]
featured: false
heroImage: ""
---

## Project Overview

A documentation site generator that transforms a directory of Markdown and MDX files into a polished, searchable documentation website. Built with Astro's Content Collections for organizing documentation sections and MDX for interactive code examples.

## Features

- **Automatic Sidebar Generation**: Content collections drive the sidebar navigation, with nested sections and ordering based on frontmatter.
- **Syntax Highlighting**: Powered by Shiki with custom themes and line highlighting for code blocks.
- **Full-Text Search**: Client-side search index built at compile time using Pagefind, hydrating only when the user focuses the search input.
- **Versioning**: Multiple documentation versions managed as separate content collections, with a version switcher component.

This project demonstrates how Astro's content primitives scale beyond blogs to complex documentation structures with hundreds of pages.

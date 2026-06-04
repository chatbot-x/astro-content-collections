---
title: "Real-Time Dashboard"
description: "An interactive analytics dashboard with real-time data visualization, built with React islands inside an Astro shell."
startDate: 2025-11-01
endDate: 2026-02-15
status: "completed"
url: "https://dashboard-astro-content-collections.pages.dev"
repo: "https://github.com/chatbot-x/astro-content-collections"
techStack: ["Astro", "React", "D3.js", "WebSocket", "TailwindCSS"]
featured: true
---

## Project Overview

A real-time analytics dashboard that combines Astro's static-first approach with React's interactive capabilities. The dashboard shell and navigation are server-rendered for instant loading, while the chart components hydrate as interactive islands.

## Architecture Decisions

The key architectural decision was using Astro as the application shell while embedding React components for the interactive chart panels. This hybrid approach gives us the best of both worlds: fast initial page loads from static HTML, and rich interactivity where it's needed.

Charts are implemented as React components using D3.js for custom visualizations. They connect to a WebSocket server for real-time data updates, but only the chart islands ship JavaScript — the rest of the page remains static.

## Results

- **First Contentful Paint**: 0.8s (compared to 3.2s with a full React SPA)
- **Total JavaScript**: 45KB gzipped (compared to 287KB for the SPA equivalent)
- **Lighthouse Score**: 98/100

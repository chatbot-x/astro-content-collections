import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// OG image generation for blog posts using CanvasKit (via astro-og-canvas)
// We build a simple SVG → PNG pipeline manually since astro-og-canvas
// requires specific setup. This creates a simple but effective OG image.

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { route: post.id },
    props: {
      title: post.data.title,
      description: post.data.description,
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description: string };

  // Generate SVG OG image
  const svg = generateOGSvg(title, description);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

function generateOGSvg(title: string, description: string): string {
  // Truncate title if too long for the image
  const displayTitle = title.length > 70 ? title.slice(0, 67) + '...' : title;
  const displayDesc = description.length > 140 ? description.slice(0, 137) + '...' : description;

  // Escape XML special characters
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b"/>
      <stop offset="50%" style="stop-color:#312e81"/>
      <stop offset="100%" style="stop-color:#1e1b4b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a78bfa"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="8" height="630" fill="url(#accent)"/>
  <rect x="80" y="530" width="200" height="4" rx="2" fill="url(#accent)" opacity="0.6"/>
  <text x="80" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#a5b4fc" font-weight="500">Astro + TailwindCSS</text>
  <text x="80" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="56" fill="#ffffff" font-weight="700" line-height="1.2">
    ${escapeXml(displayTitle)}
  </text>
  <text x="80" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="26" fill="#c7d2fe" font-weight="400" opacity="0.8">
    ${escapeXml(displayDesc)}
  </text>
  <text x="80" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#818cf8" font-weight="500">example.com</text>
</svg>`;
}

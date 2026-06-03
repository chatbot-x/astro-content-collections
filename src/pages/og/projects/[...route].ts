import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// OG image generation for project pages using SVG

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { route: project.id },
    props: {
      title: project.data.title,
      description: project.data.description,
      techStack: project.data.techStack,
      status: project.data.status,
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description, techStack, status } = props as {
    title: string;
    description: string;
    techStack: string[];
    status: string;
  };

  const svg = generateProjectOGSvg(title, description, techStack, status);

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

function generateProjectOGSvg(title: string, description: string, techStack: string[], status: string): string {
  const displayTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const displayDesc = description.length > 120 ? description.slice(0, 117) + '...' : description;
  const displayTech = techStack.slice(0, 5).join(' · ');

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const statusColor = status === 'active' ? '#3fb950' : status === 'completed' ? '#58a6ff' : '#8b949e';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b"/>
      <stop offset="50%" style="stop-color:#312e81"/>
      <stop offset="100%" style="stop-color:#1e1b4b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#a78bfa"/>
      <stop offset="100%" style="stop-color:#6366f1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="8" height="630" fill="url(#accent)"/>
  <rect x="80" y="530" width="200" height="4" rx="2" fill="url(#accent)" opacity="0.6"/>
  <circle cx="104" cy="100" r="12" fill="${statusColor}"/>
  <text x="126" y="108" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#a5b4fc" font-weight="500">${status.charAt(0).toUpperCase() + status.slice(1)} Project</text>
  <text x="80" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="52" fill="#ffffff" font-weight="700">
    ${escapeXml(displayTitle)}
  </text>
  <text x="80" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#c7d2fe" font-weight="400" opacity="0.8">
    ${escapeXml(displayDesc)}
  </text>
  ${displayTech ? `<text x="80" y="470" font-family="monospace" font-size="18" fill="#818cf8" font-weight="500">${escapeXml(displayTech)}</text>` : ''}
  <text x="80" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#818cf8" font-weight="500">example.com/projects</text>
</svg>`;
}

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateOpenGraphImage } from 'astro-og-canvas';

// OG image generation for project pages using astro-og-canvas (PNG)
// Social platforms (Twitter/X, Facebook, LinkedIn, Slack) require PNG/JPEG — SVG is not supported.

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({
    params: { route: project.id },
    props: {
      title: project.data.title,
      description: project.data.description,
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as {
    title: string;
    description: string;
  };

  const image = await generateOpenGraphImage({
    title,
    description,
    bgGradient: [[30, 27, 75], [49, 46, 129], [30, 27, 75]],
    border: {
      color: [167, 139, 250],
      width: 8,
      side: 'inline-start',
    },
    padding: 60,
    font: {
      title: {
        color: [255, 255, 255],
        size: 52,
        weight: 'bold',
        families: ['system-ui', 'sans-serif'],
      },
      description: {
        color: [199, 210, 254],
        size: 24,
        families: ['system-ui', 'sans-serif'],
      },
    },
  });

  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
// FIX: Corrected import path — file is in src/pages/, so only one level up to src/utils/.
import { SITE_URL } from '../utils/site';

export const GET: APIRoute = async () => {
  const [blogPosts, projects] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('projects'),
  ]);

  // Sort blog posts by date descending
  const sortedPosts = blogPosts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const lines: string[] = [
    '# isHistory',
    '',
    '> isHistory is a curated digital archive of the stories behind technology — how ideas sparked, why systems failed or succeeded, and the people who shaped the digital age without ever showing a single line of code. From the first bug to the last-minute Tech breakthrough, we document the How, Why and Who of computing history.',
    '',
    `Site: ${SITE_URL}`,
    '',
    '---',
  ];

  // Blog posts section
  for (const post of sortedPosts) {
    const pubDate = post.data.pubDate.toISOString().split('T')[0];
    const tags = post.data.tags?.join(', ') || '';
    const body = post.body || '';

    // FIX: Filter out empty strings from optional fields instead of pushing
    // them and relying on the regex collapse at the end. Empty strings from
    // optional fields created excessive blank lines and wasted output bytes.
    const metaLines = [
      `URL: ${SITE_URL}/blog/${post.id}/`,
      `Published: ${pubDate}`,
      `Author: ${post.data.author}`,
      tags ? `Tags: ${tags}` : '',
    ].filter(Boolean);

    lines.push(
      '',
      `## ${post.data.title}`,
      '',
      ...metaLines,
      '',
      `> ${post.data.description}`,
      '',
      body,
      '',
      '---',
    );
  }

  // Series section
  for (const project of projects) {
    const startDate = project.data.startDate.toISOString().split('T')[0];
    const techStack = project.data.techStack?.join(', ') || '';
    const body = project.body || '';

    // FIX: Filter out empty strings from optional fields instead of pushing
    // them and relying on the regex collapse at the end.
    const projectMetaLines = [
      `URL: ${SITE_URL}/series/${project.id}/`,
      `Start Date: ${startDate}`,
      `Status: ${project.data.status}`,
      `Featured: ${project.data.featured ? 'Yes' : 'No'}`,
      techStack ? `Tech Stack: ${techStack}` : '',
      project.data.url ? `Live URL: ${project.data.url}` : '',
      project.data.repo ? `Repo: ${project.data.repo}` : '',
    ].filter(Boolean);

    lines.push(
      '',
      `## ${project.data.title}`,
      '',
      ...projectMetaLines,
      '',
      `> ${project.data.description}`,
      '',
      body,
      '',
      '---',
    );
  }

  const content = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return new Response(content + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('RSS feed requires a configured `site` URL in astro.config.mjs');
  }

  // --- Blog posts ---
  const blogPosts = (await getCollection('blog', ({ data }) => !data.draft))
    .map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: post.data.author,
      categories: post.data.tags,
      link: new URL(`/blog/${post.id}/`, context.site!).href,
      // Sort key: pubDate
      sortDate: post.data.pubDate,
    }));

  // --- Series articles (articles inside series subfolders) ---
  const allProjects = await getCollection('projects');
  const seriesArticles = allProjects
    .filter((entry) => entry.id.includes('/')) // only articles, not series index pages
    .filter((entry) => entry.data.status !== 'upcoming') // skip upcoming series articles
    .map((article) => {
      const seriesSlug = article.id.split('/')[0];
      const articleSlug = article.id.split('/').pop();
      const track = article.data.track || 'articles';
      const trackLabels: Record<string, string> = {
        articles: 'A-Series',
        profiles: 'P-Series',
        events: 'E-Series',
      };
      return {
        title: article.data.title,
        pubDate: article.data.startDate,
        description: article.data.description,
        author: 'Ishaan',
        categories: [
          ...(article.data.techStack || []),
          trackLabels[track] || track,
          article.data.tag,
        ].filter(Boolean),
        link: new URL(`/series/${seriesSlug}/${articleSlug}/`, context.site!).href,
        sortDate: article.data.startDate,
      };
    });

  // --- Combine and sort by date (newest first) ---
  const allItems = [...blogPosts, ...seriesArticles]
    .sort((a, b) => b.sortDate.valueOf() - a.sortDate.valueOf());

  return rss({
    title: 'isHistory',
    description: 'Mapping the digital past — articles, profiles, and events from the curated archive of technology history. No code, just the human stories behind the machines.',
    site: context.site,
    items: allItems.map(({ sortDate, ...item }) => item),
    customData: `<language>en-us</language>`,
  });
}

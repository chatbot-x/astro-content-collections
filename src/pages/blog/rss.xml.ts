import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  if (!context.site) {
    throw new Error('RSS feed requires a configured `site` URL in astro.config.mjs');
  }

  return rss({
    title: 'isHistory Blog',
    description: 'Stories behind technology — how ideas sparked, why systems failed or succeeded, and the people who shaped the digital age.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: post.data.author,
      categories: post.data.tags,
      // FIX: Removed non-null assertion (!) — context.site is already narrowed
      // to URL by the guard above that throws if context.site is undefined.
      link: new URL(`/blog/${post.id}/`, context.site).href,
    })),
    customData: `<language>en-us</language>`,
  });
}

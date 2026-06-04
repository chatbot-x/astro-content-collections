import {
  makeIds,
  assembleGraph,
  buildWebSite,
  buildPiece,
  buildWebPage,
  buildArticle,
  buildBreadcrumbList,
  buildImageObject,
  buildSiteNavigationElement,
} from '@jdevalk/seo-graph-core';
import type { GraphEntity } from '@jdevalk/seo-graph-core';
import type { Person, Blog, SoftwareApplication, ItemList } from 'schema-dts';
import { SITE_URL } from '../site';
export const ids = makeIds({ siteUrl: SITE_URL, personUrl: `${SITE_URL}/about/` });
const blogId = `${SITE_URL}/blog/#blog`;

// Helper to cast builder results to GraphEntity (builders always include @type at runtime)
function asGraphEntity(entity: Record<string, unknown>): GraphEntity {
  return entity as unknown as GraphEntity;
}

// Site-wide entities — included on every page
function siteWideEntities(): GraphEntity[] {
  return [
    asGraphEntity(buildWebSite(
      {
        url: `${SITE_URL}/`,
        name: 'Astro + TailwindCSS',
        publisher: { '@id': ids.person },
        inLanguage: 'en-US',
        // SearchAction — enables sitelinks search box in Google
        // FIX: The previous target URL `/blog/?q={search_term_string}` didn't
        // actually handle query parameters — there's no server-side or client-side
        // code that reads `?q=` on the blog page. Updated to use the Pagefind
        // search endpoint pattern. Note: For Google sitelinks search to work,
        // the target URL must actually resolve and display search results.
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/blog/?q={search_term_string}#pagefind`,
          },
          // 'query-input' is a Google-specific extension for sitelinks search.
          // It is not in the schema-dts type definitions, so we build the object
          // separately and cast it to bypass the strict type check.
          ...({
            'query-input': {
              '@type': 'PropertyValueSpecification',
              valueRequired: true,
              valueName: 'search_term_string',
            },
          } as Record<string, unknown>),
        },
      },
      ids,
    )),
    asGraphEntity(buildPiece<Person>({
      '@type': 'Person',
      '@id': ids.person,
      name: 'Astro Team',
      url: `${SITE_URL}/about/`,
      image: { '@id': ids.personImage },
      sameAs: [
        'https://github.com/astroteam',
        'https://twitter.com/astroteam',
      ],
      knowsAbout: ['Web Development', 'Astro', 'TypeScript', 'TailwindCSS', 'SEO'],
      jobTitle: 'Web Developer',
    })),
    asGraphEntity(buildImageObject(
      { id: ids.personImage, url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 675 },
      ids,
    )),
    asGraphEntity(buildSiteNavigationElement(
      {
        name: 'Main navigation',
        isPartOf: { '@id': ids.website },
        items: [
          { name: 'Home', url: `${SITE_URL}/` },
          { name: 'Blog', url: `${SITE_URL}/blog/` },
          { name: 'Projects', url: `${SITE_URL}/projects/` },
          { name: 'About', url: `${SITE_URL}/about/` },
        ],
      },
      ids,
    )),
    // Blog container entity — BlogPosting entries link to this
    asGraphEntity(buildPiece<Blog>({
      '@type': 'Blog',
      '@id': blogId,
      name: 'Blog',
      url: `${SITE_URL}/blog/`,
      publisher: { '@id': ids.person },
      inLanguage: 'en-US',
    })),
  ];
}

// Options type for buildSchemaGraph
export interface SchemaGraphOpts {
  pageType: 'home' | 'blogPost' | 'blogListing' | 'project' | 'projectListing' | 'about' | 'page';
  url: string;
  title: string;
  description: string;
  publishDate?: Date;
  updatedDate?: Date;
  featureImageUrl?: string;
  category?: string;
  wordCount?: number;
  // Blog-specific
  articleType?: 'Article' | 'BlogPosting' | 'TechArticle' | 'NewsArticle' | 'ScholarlyArticle' | 'Report';
  // Project-specific
  techStack?: string[];
  projectUrl?: string;
  repoUrl?: string;
  // Listing-specific
  listingItems?: Array<{ title: string; url: string }>;
}

// Page-specific graph builder
export function buildSchemaGraph(opts: SchemaGraphOpts) {
  const pieces: GraphEntity[] = [...siteWideEntities()];
  const { url, title, description, publishDate, updatedDate, featureImageUrl, category, wordCount } = opts;

  switch (opts.pageType) {
    // FIX: Added explicit 'home' case for proper homepage schema.
    // Previously, the homepage fell through to the generic 'default' case,
    // generating a redundant BreadcrumbList ("Home > Astro + TailwindCSS")
    // which links the homepage to itself — an anti-pattern in Schema.org.
    // The homepage now gets a proper WebPage with representativeOfPage
    // and no self-referential breadcrumb.
    case 'home': {
      // FIX: Build the WebPage first, then merge in representativeOfPage via
      // Object.assign because the WebPageInput type (from @jdevalk/seo-graph-core)
      // does not include representativeOfPage — it's a valid Schema.org property
      // but omitted from the library's TypeScript definitions.
      const homePage = buildWebPage(
        {
          url,
          name: title,
          isPartOf: { '@id': ids.website },
          primaryImage: featureImageUrl ? { '@id': ids.primaryImage(url) } : undefined,
        },
        ids,
      );
      Object.assign(homePage, { representativeOfPage: true });
      pieces.push(asGraphEntity(homePage));
      if (featureImageUrl) {
        pieces.push(
          asGraphEntity(buildImageObject(
            { pageUrl: url, url: featureImageUrl, width: 1200, height: 630 },
            ids,
          )),
        );
      }
      break;
    }

    case 'blogPost': {
      const articleType = opts.articleType || 'BlogPosting';
      pieces.push(
        asGraphEntity(buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
            datePublished: publishDate,
            dateModified: updatedDate,
            primaryImage: featureImageUrl ? { '@id': ids.primaryImage(url) } : undefined,
          },
          ids,
        )),
        // FIX: Use current date as fallback instead of new Date(0) (Jan 1, 1970).
        // A Unix epoch date in Schema.org JSON-LD is clearly wrong and may cause
        // search engines to ignore the structured data. Using the build date is a
        // more sensible fallback when the publish date is unknown.
        asGraphEntity(buildArticle(
          {
            url,
            isPartOf: { '@id': ids.webPage(url) },
            author: { '@id': ids.person },
            publisher: { '@id': ids.person },
            headline: title,
            description,
            datePublished: publishDate ?? new Date(),
            dateModified: updatedDate,
            image: featureImageUrl ? { '@id': ids.primaryImage(url) } : undefined,
            articleSection: category,
            wordCount,
          },
          ids,
          articleType,
        )),
        asGraphEntity(buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Blog', url: `${SITE_URL}/blog/` },
              { name: title, url },
            ],
          },
          ids,
        )),
      );
      if (featureImageUrl) {
        pieces.push(
          asGraphEntity(buildImageObject(
            { pageUrl: url, url: featureImageUrl, width: 1200, height: 630 },
            ids,
          )),
        );
      }
      break;
    }

    case 'blogListing':
      pieces.push(
        asGraphEntity(buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
          'CollectionPage',
        )),
        asGraphEntity(buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Blog', url },
            ],
          },
          ids,
        )),
      );
      // ItemList for blog listing
      if (opts.listingItems && opts.listingItems.length > 0) {
        pieces.push(
          asGraphEntity(buildPiece<ItemList>({
            '@type': 'ItemList',
            '@id': `${url}#itemlist`,
            name: 'Blog Posts',
            numberOfItems: opts.listingItems.length,
            itemListElement: opts.listingItems.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: item.url,
              name: item.title,
            })),
          })),
        );
      }
      break;

    case 'project': {
      pieces.push(
        asGraphEntity(buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
            primaryImage: featureImageUrl ? { '@id': ids.primaryImage(url) } : undefined,
          },
          ids,
        )),
        // SoftwareApplication for project pages
        asGraphEntity(buildPiece<SoftwareApplication>({
          '@type': 'SoftwareApplication',
          '@id': `${url}#software`,
          name: title,
          description,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Any',
          url: opts.projectUrl || url,
          ...(opts.techStack && opts.techStack.length > 0
            ? { programmingLanguage: opts.techStack.join(', ') }
            : {}),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          author: { '@id': ids.person },
        })),
        asGraphEntity(buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Projects', url: `${SITE_URL}/projects/` },
              { name: title, url },
            ],
          },
          ids,
        )),
      );
      if (featureImageUrl) {
        pieces.push(
          asGraphEntity(buildImageObject(
            { pageUrl: url, url: featureImageUrl, width: 1200, height: 630 },
            ids,
          )),
        );
      }
      break;
    }

    case 'projectListing':
      pieces.push(
        asGraphEntity(buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
          'CollectionPage',
        )),
        asGraphEntity(buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Projects', url },
            ],
          },
          ids,
        )),
      );
      // ItemList for project listing
      if (opts.listingItems && opts.listingItems.length > 0) {
        pieces.push(
          asGraphEntity(buildPiece<ItemList>({
            '@type': 'ItemList',
            '@id': `${url}#itemlist`,
            name: 'Projects',
            numberOfItems: opts.listingItems.length,
            itemListElement: opts.listingItems.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: item.url,
              name: item.title,
            })),
          })),
        );
      }
      break;

    case 'about':
      pieces.push(
        asGraphEntity(buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            about: { '@id': ids.person },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
          'ProfilePage',
        )),
        asGraphEntity(buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'About', url },
            ],
          },
          ids,
        )),
      );
      break;

    default:
      pieces.push(
        asGraphEntity(buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
        )),
        asGraphEntity(buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: title, url },
            ],
          },
          ids,
        )),
      );
  }

  return assembleGraph(pieces, { warnOnDanglingReferences: true });
}

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
import type { Person } from 'schema-dts';

const SITE_URL = 'https://example.com';
export const ids = makeIds({ siteUrl: SITE_URL, personUrl: `${SITE_URL}/about/` });

// Site-wide entities — included on every page
function siteWideEntities() {
  return [
    buildWebSite(
      {
        url: `${SITE_URL}/`,
        name: 'Astro + TailwindCSS',
        publisher: { '@id': ids.person },
        inLanguage: 'en-US',
      },
      ids,
    ),
    buildPiece<Person>({
      '@type': 'Person',
      '@id': ids.person,
      name: 'Astro Team',
      url: `${SITE_URL}/about/`,
      image: { '@id': ids.personImage },
    }),
    buildImageObject(
      { id: ids.personImage, url: `${SITE_URL}/favicon.svg`, width: 400, height: 400 },
      ids,
    ),
    buildSiteNavigationElement(
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
    ),
  ];
}

// Page-specific graph builder
export function buildSchemaGraph(opts: {
  pageType: 'home' | 'blogPost' | 'blogListing' | 'project' | 'projectListing' | 'about' | 'page';
  url: string;
  title: string;
  description: string;
  publishDate?: Date;
  updatedDate?: Date;
  featureImageUrl?: string;
  category?: string;
}) {
  const pieces = [...siteWideEntities()];
  const { url, title, description, publishDate, updatedDate, featureImageUrl, category } = opts;

  switch (opts.pageType) {
    case 'blogPost':
      pieces.push(
        buildWebPage(
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
        ),
        buildArticle(
          {
            url,
            isPartOf: { '@id': ids.webPage(url) },
            author: { '@id': ids.person },
            publisher: { '@id': ids.person },
            headline: title,
            description,
            datePublished: publishDate!,
            dateModified: updatedDate,
            image: featureImageUrl ? { '@id': ids.primaryImage(url) } : undefined,
            articleSection: category,
          },
          ids,
        ),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Blog', url: `${SITE_URL}/blog/` },
              { name: title, url },
            ],
          },
          ids,
        ),
      );
      if (featureImageUrl) {
        pieces.push(
          buildImageObject(
            { pageUrl: url, url: featureImageUrl, width: 1200, height: 630 },
            ids,
          ),
        );
      }
      break;

    case 'blogListing':
      pieces.push(
        buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
          'CollectionPage',
        ),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Blog', url },
            ],
          },
          ids,
        ),
      );
      break;

    case 'project':
      pieces.push(
        buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
            primaryImage: featureImageUrl ? { '@id': ids.primaryImage(url) } : undefined,
          },
          ids,
        ),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Projects', url: `${SITE_URL}/projects/` },
              { name: title, url },
            ],
          },
          ids,
        ),
      );
      if (featureImageUrl) {
        pieces.push(
          buildImageObject(
            { pageUrl: url, url: featureImageUrl, width: 1200, height: 630 },
            ids,
          ),
        );
      }
      break;

    case 'projectListing':
      pieces.push(
        buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
          'CollectionPage',
        ),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'Projects', url },
            ],
          },
          ids,
        ),
      );
      break;

    case 'about':
      pieces.push(
        buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            about: { '@id': ids.person },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
          'ProfilePage',
        ),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: 'About', url },
            ],
          },
          ids,
        ),
      );
      break;

    default:
      pieces.push(
        buildWebPage(
          {
            url,
            name: title,
            isPartOf: { '@id': ids.website },
            breadcrumb: { '@id': ids.breadcrumb(url) },
          },
          ids,
        ),
        buildBreadcrumbList(
          {
            url,
            items: [
              { name: 'Home', url: `${SITE_URL}/` },
              { name: title, url },
            ],
          },
          ids,
        ),
      );
  }

  return assembleGraph(pieces);
}

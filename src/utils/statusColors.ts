/**
 * Shared status color mapping for project status badges.
 * Used by both projects/index.astro and layouts/ProjectPage.astro.
 *
 * FIX (QUAL-002): Extracted from duplicated definitions in two files
 * to follow DRY principle and prevent inconsistent styling.
 */

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800',
  completed: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800',
  archived: 'bg-gray-50 text-gray-600 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
};

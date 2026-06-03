import getReadingTime from 'reading-time';

export interface ReadingTimeStats {
  text: string;
  minutes: number;
  words: number;
}

/**
 * Compute reading time from a Markdown body string.
 * Uses the `reading-time` package which handles CJK natively.
 * @param body - Raw Markdown content
 * @param wordsPerMinute - Reading speed (default 200)
 */
export function computeReadingTime(body: string, wordsPerMinute = 200): ReadingTimeStats {
  const stats = getReadingTime(body, { wordsPerMinute });
  return {
    text: stats.text,
    minutes: Math.ceil(stats.minutes),
    words: stats.words.total,
  };
}

/**
 * Format reading time as a human-readable string.
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

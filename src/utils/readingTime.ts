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
    // FIX: reading-time v1.5.0 always returns `words` as a number.
    // The previous fallback casting to `{ total: number }` was incorrect
    // for this version and could mask real errors. Use a straightforward
    // number check with a safe fallback to 0.
    words: typeof stats.words === 'number' ? stats.words : 0,
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

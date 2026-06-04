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
  // FIX: Clamp minutes to at least 1 so we never display "0 min read"
  // for very short content (e.g., a post with just a title and one sentence).
  // The reading-time package can return 0 minutes for content under ~100 words.
  const minutes = Math.max(1, Math.ceil(stats.minutes));
  return {
    text: `${minutes} min read`,
    minutes,
    words: typeof stats.words === 'number' ? stats.words : 0,
  };
}

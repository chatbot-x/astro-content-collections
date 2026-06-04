import { describe, it, expect } from 'vitest';
import { computeReadingTime } from './readingTime';

describe('computeReadingTime', () => {
  it('should return at least 1 minute for very short content', () => {
    const result = computeReadingTime('Hello world');
    expect(result.minutes).toBe(1);
    expect(result.text).toBe('1 min read');
  });

  it('should compute reading time for longer content', () => {
    // Generate ~400 words of content (should be ~2 min at 200 wpm)
    const content = Array(40).fill('word '.repeat(10)).join(' ');
    const result = computeReadingTime(content);
    expect(result.minutes).toBeGreaterThanOrEqual(1);
    expect(result.text).toMatch(/\d+ min read/);
  });

  it('should return the word count', () => {
    const content = 'one two three four five';
    const result = computeReadingTime(content);
    expect(result.words).toBe(5);
  });

  it('should handle empty string', () => {
    const result = computeReadingTime('');
    expect(result.minutes).toBe(1); // Clamped to minimum
    expect(result.words).toBe(0);
  });

  it('should respect custom words per minute', () => {
    const content = Array(30).fill('word '.repeat(10)).join(' ');
    const slowReader = computeReadingTime(content, 100);
    const fastReader = computeReadingTime(content, 400);
    expect(slowReader.minutes).toBeGreaterThanOrEqual(fastReader.minutes);
  });
});

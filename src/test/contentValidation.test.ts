import { describe, it, expect } from 'vitest';
import { validateEnglishContent, WORD_BANK, ALL_ALLOWED_WORDS } from '../data/wordBank';

describe('Content Validation (Anti-Regression)', () => {
  it('all word bank entries should only contain allowed English words', () => {
    for (const entry of WORD_BANK) {
      const result = validateEnglishContent(entry.word);
      expect(result.valid).toBe(true);
    }
  });

  it('sentence patterns should only use allowed words', () => {
    // These are the sentence patterns used in the app
    const patterns = [
      'The shirt is new',
      'The dress is old',
      'The boots is clean',
      'The coat is long',
      'The pants is warm',
      'The shoes is cold',
      'The skirt is new',
      'The socks is clean',
      'The sweater is warm',
      'The shirt is fifty dollar',
      'The dress is thirty dollar',
      'The boots is eighty dollar',
      'The coat is hundred dollar',
    ];

    for (const pattern of patterns) {
      const result = validateEnglishContent(pattern);
      expect(result.valid).toBe(true);
    }
  });

  it('should reject sentences with words not in the word bank', () => {
    const badSentences = [
      'The beautiful shirt is red',
      'I love this amazing dress',
      'The expensive boots are great',
    ];

    for (const sentence of badSentences) {
      const result = validateEnglishContent(sentence);
      expect(result.valid).toBe(false);
    }
  });

  it('structural words (the, is, are, a, an, i, my, e) should be allowed', () => {
    const structuralWords = ['the', 'is', 'are', 'a', 'an', 'i', 'my', 'e'];
    for (const word of structuralWords) {
      expect(ALL_ALLOWED_WORDS.has(word)).toBe(true);
    }
  });

  it('word bank should not have duplicates', () => {
    const words = WORD_BANK.map(w => w.word);
    const unique = new Set(words);
    expect(words.length).toBe(unique.size);
  });

  it('every word bank entry should have consistent emoji (same word = same emoji)', () => {
    const emojiMap = new Map<string, string>();
    for (const entry of WORD_BANK) {
      if (emojiMap.has(entry.word)) {
        expect(emojiMap.get(entry.word)).toBe(entry.emoji);
      } else {
        emojiMap.set(entry.word, entry.emoji);
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import {
  WORD_BANK,
  ALLOWED_ENGLISH_WORDS,
  ALL_ALLOWED_WORDS,
  getWordsByCategory,
  getWordEntry,
  getClothingWords,
  getNumberWords,
  getMagicEWords,
  getHouseWords,
  validateEnglishContent,
  CATEGORIES,
} from '../data/wordBank';

describe('WordBank', () => {
  it('should have all required Magic E words', () => {
    const magicE = getMagicEWords().map(w => w.word);
    expect(magicE).toContain('bake');
    expect(magicE).toContain('game');
    expect(magicE).toContain('home');
    expect(magicE).toContain('nose');
    expect(magicE).toContain('rule');
    expect(magicE).toContain('same');
    expect(magicE).toContain('size');
    expect(magicE).toContain('wake up');
  });

  it('should have all required Clothing words', () => {
    const clothing = getClothingWords().map(w => w.word);
    expect(clothing).toContain('boots');
    expect(clothing).toContain('clothes');
    expect(clothing).toContain('coat');
    expect(clothing).toContain('dress');
    expect(clothing).toContain('pants');
    expect(clothing).toContain('shirt');
    expect(clothing).toContain('shoes');
    expect(clothing).toContain('skirt');
    expect(clothing).toContain('socks');
    expect(clothing).toContain('sweater');
  });

  it('should have all required Number words', () => {
    const numbers = getNumberWords().map(w => w.word);
    expect(numbers).toContain('thirty');
    expect(numbers).toContain('forty');
    expect(numbers).toContain('fifty');
    expect(numbers).toContain('sixty');
    expect(numbers).toContain('seventy');
    expect(numbers).toContain('eighty');
    expect(numbers).toContain('ninety');
    expect(numbers).toContain('hundred');
  });

  it('should have all required House words', () => {
    const house = getHouseWords().map(w => w.word);
    const required = ['bathroom', 'bedroom', 'living room', 'kitchen', 'room', 'mirror',
      'store', 'online', 'clean', 'close', 'cold', 'long', 'new', 'old', 'warm',
      'wear', 'write', 'door', 'face', 'flute', 'late', 'more', 'smile', 'think'];
    for (const word of required) {
      expect(house).toContain(word);
    }
  });

  it('every word should have an emoji', () => {
    for (const entry of WORD_BANK) {
      expect(entry.emoji).toBeTruthy();
      expect(entry.emoji.length).toBeGreaterThan(0);
    }
  });

  it('every word should have a hebrew translation', () => {
    for (const entry of WORD_BANK) {
      expect(entry.hebrew).toBeTruthy();
    }
  });

  it('every word should have a category', () => {
    for (const entry of WORD_BANK) {
      expect(Object.keys(CATEGORIES)).toContain(entry.category);
    }
  });

  it('getWordEntry should find words', () => {
    expect(getWordEntry('bake')).toBeDefined();
    expect(getWordEntry('bake')?.emoji).toBe('🧁');
    expect(getWordEntry('nonexistent')).toBeUndefined();
  });

  it('validateEnglishContent should detect invalid words', () => {
    const valid = validateEnglishContent('The shirt is new');
    expect(valid.valid).toBe(true);

    const invalid = validateEnglishContent('The beautiful shirt is amazing');
    expect(invalid.valid).toBe(false);
    expect(invalid.invalidWords).toContain('beautiful');
    expect(invalid.invalidWords).toContain('amazing');
  });

  it('should allow structural words', () => {
    expect(ALL_ALLOWED_WORDS.has('the')).toBe(true);
    expect(ALL_ALLOWED_WORDS.has('is')).toBe(true);
    expect(ALL_ALLOWED_WORDS.has('are')).toBe(true);
    expect(ALL_ALLOWED_WORDS.has('e')).toBe(true);
  });
});

export type WordCategory = 'magic-e' | 'clothing' | 'numbers' | 'house';

export interface WordEntry {
  word: string;
  hebrew: string;
  emoji: string;
  category: WordCategory;
  /** SVG icon hint for visual vocabulary */
  svgHint: string;
}

export const CATEGORIES: Record<WordCategory, { name: string; emoji: string; color: string }> = {
  'magic-e': { name: 'Magic E', emoji: '✨', color: '#8B5CF6' },
  'clothing': { name: 'בגדים וצבעים', emoji: '👕', color: '#EC4899' },
  'numbers': { name: 'מחירים', emoji: '💰', color: '#F59E0B' },
  'house': { name: 'בית ומילים כלליות', emoji: '🏠', color: '#10B981' },
};

export const WORD_BANK: WordEntry[] = [
  // Magic E Words
  { word: 'bake', hebrew: 'לאפות', emoji: '🧁', category: 'magic-e', svgHint: 'oven' },
  { word: 'game', hebrew: 'משחק', emoji: '🎮', category: 'magic-e', svgHint: 'controller' },
  { word: 'home', hebrew: 'בית', emoji: '🏡', category: 'magic-e', svgHint: 'house' },
  { word: 'nose', hebrew: 'אף', emoji: '👃', category: 'magic-e', svgHint: 'nose' },
  { word: 'rule', hebrew: 'כלל', emoji: '📏', category: 'magic-e', svgHint: 'ruler' },
  { word: 'same', hebrew: 'אותו דבר', emoji: '🟰', category: 'magic-e', svgHint: 'equals' },
  { word: 'size', hebrew: 'גודל', emoji: '📐', category: 'magic-e', svgHint: 'measure' },
  { word: 'wake up', hebrew: 'להתעורר', emoji: '⏰', category: 'magic-e', svgHint: 'alarm' },

  // Clothing & Colors
  { word: 'boots', hebrew: 'מגפיים', emoji: '🥾', category: 'clothing', svgHint: 'boots' },
  { word: 'clothes', hebrew: 'בגדים', emoji: '👔', category: 'clothing', svgHint: 'clothes' },
  { word: 'coat', hebrew: 'מעיל', emoji: '🧥', category: 'clothing', svgHint: 'coat' },
  { word: 'dress', hebrew: 'שמלה', emoji: '👗', category: 'clothing', svgHint: 'dress' },
  { word: 'pants', hebrew: 'מכנסיים', emoji: '👖', category: 'clothing', svgHint: 'pants' },
  { word: 'shirt', hebrew: 'חולצה', emoji: '👕', category: 'clothing', svgHint: 'shirt' },
  { word: 'shoes', hebrew: 'נעליים', emoji: '👟', category: 'clothing', svgHint: 'shoes' },
  { word: 'skirt', hebrew: 'חצאית', emoji: '🩳', category: 'clothing', svgHint: 'skirt' },
  { word: 'socks', hebrew: 'גרביים', emoji: '🧦', category: 'clothing', svgHint: 'socks' },
  { word: 'sweater', hebrew: 'סוודר', emoji: '🧶', category: 'clothing', svgHint: 'sweater' },

  // Numbers (Prices)
  { word: 'thirty', hebrew: '30', emoji: '3️⃣', category: 'numbers', svgHint: '30' },
  { word: 'forty', hebrew: '40', emoji: '4️⃣', category: 'numbers', svgHint: '40' },
  { word: 'fifty', hebrew: '50', emoji: '5️⃣', category: 'numbers', svgHint: '50' },
  { word: 'sixty', hebrew: '60', emoji: '6️⃣', category: 'numbers', svgHint: '60' },
  { word: 'seventy', hebrew: '70', emoji: '7️⃣', category: 'numbers', svgHint: '70' },
  { word: 'eighty', hebrew: '80', emoji: '8️⃣', category: 'numbers', svgHint: '80' },
  { word: 'ninety', hebrew: '90', emoji: '9️⃣', category: 'numbers', svgHint: '90' },
  { word: 'hundred', hebrew: '100', emoji: '💯', category: 'numbers', svgHint: '100' },
  { word: 'dollar', hebrew: 'דולר', emoji: '💵', category: 'numbers', svgHint: 'dollar' },

  // House & General
  { word: 'bathroom', hebrew: 'חדר אמבטיה', emoji: '🛁', category: 'house', svgHint: 'bath' },
  { word: 'bedroom', hebrew: 'חדר שינה', emoji: '🛏️', category: 'house', svgHint: 'bed' },
  { word: 'living room', hebrew: 'סלון', emoji: '🛋️', category: 'house', svgHint: 'sofa' },
  { word: 'kitchen', hebrew: 'מטבח', emoji: '🍳', category: 'house', svgHint: 'kitchen' },
  { word: 'room', hebrew: 'חדר', emoji: '🚪', category: 'house', svgHint: 'room' },
  { word: 'mirror', hebrew: 'מראה', emoji: '🪞', category: 'house', svgHint: 'mirror' },
  { word: 'store', hebrew: 'חנות', emoji: '🏪', category: 'house', svgHint: 'store' },
  { word: 'online', hebrew: 'אונליין', emoji: '🌐', category: 'house', svgHint: 'globe' },
  { word: 'clean', hebrew: 'נקי', emoji: '✨', category: 'house', svgHint: 'sparkle' },
  { word: 'close', hebrew: 'לסגור', emoji: '🚫', category: 'house', svgHint: 'close' },
  { word: 'cold', hebrew: 'קר', emoji: '🥶', category: 'house', svgHint: 'cold' },
  { word: 'long', hebrew: 'ארוך', emoji: '📏', category: 'house', svgHint: 'long' },
  { word: 'new', hebrew: 'חדש', emoji: '🆕', category: 'house', svgHint: 'new' },
  { word: 'old', hebrew: 'ישן', emoji: '🏚️', category: 'house', svgHint: 'old' },
  { word: 'warm', hebrew: 'חם', emoji: '🔥', category: 'house', svgHint: 'warm' },
  { word: 'wear', hebrew: 'ללבוש', emoji: '👗', category: 'house', svgHint: 'wear' },
  { word: 'write', hebrew: 'לכתוב', emoji: '✍️', category: 'house', svgHint: 'write' },
  { word: 'door', hebrew: 'דלת', emoji: '🚪', category: 'house', svgHint: 'door' },
  { word: 'face', hebrew: 'פנים', emoji: '😊', category: 'house', svgHint: 'face' },
  { word: 'flute', hebrew: 'חליל', emoji: '🎵', category: 'house', svgHint: 'flute' },
  { word: 'late', hebrew: 'מאוחר', emoji: '⏰', category: 'house', svgHint: 'clock' },
  { word: 'more', hebrew: 'יותר', emoji: '➕', category: 'house', svgHint: 'plus' },
  { word: 'smile', hebrew: 'חיוך', emoji: '😊', category: 'house', svgHint: 'smile' },
  { word: 'think', hebrew: 'לחשוב', emoji: '🤔', category: 'house', svgHint: 'think' },
];

/** Set of all allowed English words (lowercase) for content validation */
export const ALLOWED_ENGLISH_WORDS: Set<string> = new Set(
  WORD_BANK.map(w => w.word.toLowerCase())
);

/** Also allow these structural English words that appear in sentence patterns */
const STRUCTURAL_WORDS = ['the', 'is', 'are', 'a', 'an', 'i', 'my', 'e'];

/** Individual word parts from multi-word entries (e.g., "wake up" -> "wake", "up") */
const MULTI_WORD_PARTS: string[] = WORD_BANK
  .filter(w => w.word.includes(' '))
  .flatMap(w => w.word.split(' '));

export const ALL_ALLOWED_WORDS: Set<string> = new Set([
  ...ALLOWED_ENGLISH_WORDS,
  ...STRUCTURAL_WORDS,
  ...MULTI_WORD_PARTS,
]);

export function getWordsByCategory(category: WordCategory): WordEntry[] {
  return WORD_BANK.filter(w => w.category === category);
}

export function getWordEntry(word: string): WordEntry | undefined {
  return WORD_BANK.find(w => w.word.toLowerCase() === word.toLowerCase());
}

export function getClothingWords(): WordEntry[] {
  return getWordsByCategory('clothing');
}

export function getNumberWords(): WordEntry[] {
  return getWordsByCategory('numbers').filter(w => w.word !== 'dollar');
}

export function getMagicEWords(): WordEntry[] {
  return getWordsByCategory('magic-e');
}

export function getHouseWords(): WordEntry[] {
  return getWordsByCategory('house');
}

/** Validate that a string contains only allowed English words */
export function validateEnglishContent(text: string): { valid: boolean; invalidWords: string[] } {
  const englishWordRegex = /[a-zA-Z]+/g;
  const matches = text.match(englishWordRegex) || [];
  const invalidWords = matches.filter(w => !ALL_ALLOWED_WORDS.has(w.toLowerCase()));
  return { valid: invalidWords.length === 0, invalidWords };
}

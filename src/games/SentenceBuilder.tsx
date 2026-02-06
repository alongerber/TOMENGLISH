import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useGameStore } from '../store/gameStore';
import { useConfetti } from '../hooks/useConfetti';
import { useTimer } from '../hooks/useTimer';
import { getClothingWords } from '../data/wordBank';
import type { WordEntry } from '../data/wordBank';

const CLOTHING = getClothingWords();
const ADJECTIVES = [
  { word: 'new', hebrew: 'חדש', emoji: '🆕' },
  { word: 'old', hebrew: 'ישן', emoji: '🏚️' },
  { word: 'clean', hebrew: 'נקי', emoji: '✨' },
  { word: 'long', hebrew: 'ארוך', emoji: '📏' },
  { word: 'warm', hebrew: 'חם', emoji: '🔥' },
  { word: 'cold', hebrew: 'קר', emoji: '🥶' },
];

// Visual colors (no English color words)
const VISUAL_COLORS = [
  { hex: '#EF4444', name: 'אדום' },
  { hex: '#3B82F6', name: 'כחול' },
  { hex: '#10B981', name: 'ירוק' },
  { hex: '#F59E0B', name: 'צהוב' },
  { hex: '#8B5CF6', name: 'סגול' },
  { hex: '#EC4899', name: 'ורוד' },
];

const TOTAL_ROUNDS = 8;

interface SentenceRound {
  type: 'color' | 'adjective';
  item: WordEntry;
  adjective?: typeof ADJECTIVES[number];
  color?: typeof VISUAL_COLORS[number];
  /** The correct answer parts in order */
  correctOrder: string[];
  /** All draggable parts (shuffled) */
  parts: string[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRounds(): SentenceRound[] {
  const rounds: SentenceRound[] = [];
  const items = shuffle(CLOTHING);

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const item = items[i % items.length];
    const useColor = i % 2 === 0;

    if (useColor) {
      const color = VISUAL_COLORS[Math.floor(Math.random() * VISUAL_COLORS.length)];
      // "The [item] is [color-block]" — but the color is visual, so we use "is" + color visual
      const correctOrder = ['The', item.word, 'is'];
      const parts = shuffle([...correctOrder]);
      rounds.push({ type: 'color', item, color, correctOrder, parts });
    } else {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const correctOrder = ['The', item.word, 'is', adj.word];
      const parts = shuffle([...correctOrder]);
      rounds.push({ type: 'adjective', item, adjective: adj, correctOrder, parts });
    }
  }

  return rounds;
}

export function SentenceBuilder() {
  const navigate = useNavigate();
  const { recordAnswer, adaptive } = useGameStore();
  const { fireSuccess } = useConfetti();
  const { start, getResponseTime } = useTimer();

  const [rounds] = useState<SentenceRound[]>(generateRounds);
  const [currentRound, setCurrentRound] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message?: string }>({ show: false, correct: false });
  const [showComplete, setShowComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const round = rounds[currentRound];

  useEffect(() => {
    start();
    setPlaced([]);
    setAttemptCount(0);
  }, [currentRound, start]);

  const remainingParts = useMemo(() => {
    return round ? round.parts.filter((p, i) => {
      // Count how many times this part appears in placed
      const placedCount = placed.filter(pl => pl === p).length;
      const totalCount = round.parts.slice(0, i + 1).filter(pp => pp === p).length;
      return placedCount < totalCount;
    }) : [];
  }, [round, placed]);

  // Actually let's simplify: track which indices are used
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    setUsedIndices(new Set());
    setPlaced([]);
  }, [currentRound]);

  const handleAddPart = useCallback((part: string, index: number) => {
    if (usedIndices.has(index)) return;

    const newPlaced = [...placed, part];
    const newUsed = new Set(usedIndices);
    newUsed.add(index);
    setPlaced(newPlaced);
    setUsedIndices(newUsed);

    // Check if complete
    if (newPlaced.length === round.correctOrder.length) {
      const isCorrect = newPlaced.every((p, i) => p === round.correctOrder[i]);
      const time = getResponseTime();
      recordAnswer(round.item.word, 'clothing', isCorrect, time);

      if (isCorrect) {
        setFeedback({ show: true, correct: true, message: 'מושלם! 🎉' });
        setAttemptCount(0);
        fireSuccess();
      } else {
        setFeedback({ show: true, correct: false, message: 'לא בדיוק... נסה שוב!' });
        setAttemptCount(c => c + 1);
      }

      setTimeout(() => {
        setFeedback({ show: false, correct: false });
        if (isCorrect) {
          if (currentRound + 1 < rounds.length) {
            setCurrentRound(c => c + 1);
          } else {
            setShowComplete(true);
          }
        } else {
          // Reset for retry
          setPlaced([]);
          setUsedIndices(new Set());
        }
      }, 1200);
    }
  }, [placed, usedIndices, round, getResponseTime, recordAnswer, fireSuccess, currentRound, rounds.length]);

  const handleRemoveLast = useCallback(() => {
    if (placed.length === 0) return;
    const lastPart = placed[placed.length - 1];
    // Find the index in parts that was last added
    const indices = Array.from(usedIndices);
    const lastIndex = indices.find(i => round.parts[i] === lastPart);
    if (lastIndex !== undefined) {
      const newUsed = new Set(usedIndices);
      newUsed.delete(lastIndex);
      setUsedIndices(newUsed);
    }
    setPlaced(placed.slice(0, -1));
  }, [placed, usedIndices, round]);

  if (showComplete) {
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-3d p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold mb-2">סיימת!</h2>
          <p className="text-gray-500 mb-6">בניית משפטים הושלמה</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setCurrentRound(0); setShowComplete(false); }} className="btn-3d btn-3d-primary">
              עוד סיבוב 🔄
            </button>
            <button onClick={() => navigate('/home')} className="btn-3d btn-3d-secondary">
              חזרה 🏠
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="game-background min-h-screen p-4">
      <GameHeader
        title="בונה משפטים"
        emoji="🧩"
        color="#EC4899"
        onBack={() => navigate('/home')}
        progress={currentRound / rounds.length}
      />

      <div className="max-w-lg mx-auto">
        {/* Target display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">{round.item.emoji}</span>
            {round.type === 'color' && round.color && (
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                style={{ background: round.color.hex }}
                title={round.color.name}
              />
            )}
            {round.type === 'adjective' && round.adjective && (
              <span className="text-xl">{round.adjective.emoji} {round.adjective.hebrew}</span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {round.type === 'color'
              ? `👆 בנה משפט על ${round.item.hebrew} ב${round.color?.name}`
              : `👆 בנה משפט: ${round.item.hebrew} ${round.adjective?.hebrew}`}
          </p>
        </div>

        {/* Sentence building area */}
        <div className="card-3d p-6 mb-6">
          <div className="min-h-[60px] flex flex-wrap gap-2 justify-center items-center mb-4" dir="ltr">
            <AnimatePresence>
              {placed.map((part, i) => (
                <motion.span
                  key={`${part}-${i}`}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-lg"
                >
                  {part}
                </motion.span>
              ))}
              {placed.length < round.correctOrder.length && (
                <span className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-300">
                  ...
                </span>
              )}
            </AnimatePresence>

            {/* Color block at end for color type */}
            {round.type === 'color' && round.color && placed.length >= round.correctOrder.length && (
              <div
                className="w-8 h-8 rounded-lg border-2 border-white shadow"
                style={{ background: round.color.hex }}
              />
            )}
          </div>

          {placed.length > 0 && (
            <button onClick={handleRemoveLast} className="text-sm text-gray-400 hover:text-gray-600">
              ↩️ בטל אחרון
            </button>
          )}
        </div>

        {/* Available parts */}
        <div className="flex flex-wrap gap-3 justify-center mb-6" dir="ltr">
          {round.parts.map((part, i) => (
            <motion.button
              key={`${part}-${i}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddPart(part, i)}
              disabled={usedIndices.has(i)}
              className={`word-chip text-lg ${usedIndices.has(i) ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {part}
            </motion.button>
          ))}
        </div>

        <AICoachStrip
          module="sentenceBuilder"
          currentWord={round.item.word}
          isCorrect={feedback.show ? feedback.correct : null}
          attemptCount={attemptCount}
          streak={adaptive.combo}
          gameComplete={showComplete}
        />
      </div>

      <FeedbackOverlay show={feedback.show} correct={feedback.correct} message={feedback.message} />
    </div>
  );
}

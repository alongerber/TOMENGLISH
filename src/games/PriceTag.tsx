import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useGameStore } from '../store/gameStore';
import { useConfetti } from '../hooks/useConfetti';
import { useTimer } from '../hooks/useTimer';
import { getClothingWords, getNumberWords } from '../data/wordBank';
import type { WordEntry } from '../data/wordBank';

const CLOTHING = getClothingWords();
const NUMBERS = getNumberWords();
const TOTAL_ROUNDS = 8;

interface PriceRound {
  item: WordEntry;
  number: WordEntry;
  /** The numeric value for display */
  numericValue: string;
  /** Correct match: item + number + dollar */
  sentence: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRounds(): PriceRound[] {
  const items = shuffle(CLOTHING);
  const nums = shuffle(NUMBERS);
  const rounds: PriceRound[] = [];

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const item = items[i % items.length];
    const num = nums[i % nums.length];
    rounds.push({
      item,
      number: num,
      numericValue: num.hebrew, // "30", "40", etc.
      sentence: `The ${item.word} is ${num.word} dollar`,
    });
  }

  return rounds;
}

export function PriceTag() {
  const navigate = useNavigate();
  const { recordAnswer, adaptive } = useGameStore();
  const { fireSuccess } = useConfetti();
  const { start, getResponseTime } = useTimer();

  const [rounds] = useState<PriceRound[]>(generateRounds);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [selectedDollar, setSelectedDollar] = useState(false);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message?: string }>({ show: false, correct: false });
  const [showComplete, setShowComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const round = rounds[currentRound];

  // Generate distractors for items and numbers
  const itemOptions = shuffle([
    round?.item,
    ...shuffle(CLOTHING.filter(c => c.word !== round?.item.word)).slice(0, 2),
  ].filter(Boolean)) as WordEntry[];

  const numberOptions = shuffle([
    round?.number,
    ...shuffle(NUMBERS.filter(n => n.word !== round?.number.word)).slice(0, 2),
  ].filter(Boolean)) as WordEntry[];

  useEffect(() => {
    start();
    setSelectedItem(null);
    setSelectedNumber(null);
    setSelectedDollar(false);
    setAttemptCount(0);
  }, [currentRound, start]);

  const checkAnswer = useCallback(() => {
    if (!selectedItem || !selectedNumber || !selectedDollar) return;

    const isCorrect = selectedItem === round.item.word && selectedNumber === round.number.word;
    const time = getResponseTime();
    recordAnswer(round.item.word, 'numbers', isCorrect, time);

    if (isCorrect) {
      setFeedback({ show: true, correct: true, message: 'מחיר נכון! 💰' });
      fireSuccess();
      setAttemptCount(0);
    } else {
      setFeedback({ show: true, correct: false, message: 'לא מדויק... 🤔' });
      setAttemptCount(prev => prev + 1);
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
        setSelectedItem(null);
        setSelectedNumber(null);
        setSelectedDollar(false);
      }
    }, 1200);
  }, [selectedItem, selectedNumber, selectedDollar, round, getResponseTime, recordAnswer, fireSuccess, currentRound, rounds.length]);

  if (showComplete) {
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-3d p-8 text-center max-w-md">
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-2xl font-bold mb-2">קניות הושלמו!</h2>
          <p className="text-gray-500 mb-6">כל תגי המחיר תואמו בהצלחה</p>
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
        title="תג מחיר"
        emoji="💰"
        color="#F59E0B"
        onBack={() => navigate('/home')}
        progress={currentRound / rounds.length}
      />

      <div className="max-w-xl mx-auto">
        {/* Price display — GIANT */}
        <div className="card-game-giant p-8 mb-6 text-center">
          <div className="text-lg text-gray-500 mb-3">🏷️ המחיר:</div>
          <div className="text-6xl font-black text-amber-600 mb-3" dir="ltr">
            ${round.numericValue}
          </div>
          <p className="text-sm text-gray-400 font-bold">
            👆 בחר: פריט + מספר + dollar
          </p>
        </div>

        {/* 3-way match */}
        <div className="space-y-4 mb-6">
          {/* Item selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-2">🛍️ פריט:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {itemOptions.map((item) => (
                <motion.button
                  key={item.word}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedItem(item.word)}
                  className={`word-chip ${selectedItem === item.word ? 'selected' : ''}`}
                >
                  <span>{item.emoji}</span>
                  <span dir="ltr">{item.word}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Number selection */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-2">🔢 מספר:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {numberOptions.map((num) => (
                <motion.button
                  key={num.word}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedNumber(num.word)}
                  className={`word-chip ${selectedNumber === num.word ? 'selected' : ''}`}
                >
                  <span>{num.emoji}</span>
                  <span dir="ltr">{num.word}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Dollar chip */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-2">💵 מטבע:</h3>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDollar(!selectedDollar)}
                className={`word-chip ${selectedDollar ? 'selected' : ''}`}
              >
                <span>💵</span>
                <span dir="ltr">dollar</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Preview sentence */}
        <AnimatePresence>
          {(selectedItem || selectedNumber || selectedDollar) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card-3d p-4 mb-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-lg font-mono" dir="ltr">
                <span className="text-gray-400">The</span>
                <span className={selectedItem ? 'text-pink-500 font-bold' : 'text-gray-300'}>
                  {selectedItem || '___'}
                </span>
                <span className="text-gray-400">is</span>
                <span className={selectedNumber ? 'text-amber-500 font-bold' : 'text-gray-300'}>
                  {selectedNumber || '___'}
                </span>
                <span className={selectedDollar ? 'text-green-500 font-bold' : 'text-gray-300'}>
                  {selectedDollar ? 'dollar' : '___'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        {selectedItem && selectedNumber && selectedDollar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <button onClick={checkAnswer} className="btn-3d btn-3d-success text-xl">
              ✓ בדיקה
            </button>
          </motion.div>
        )}

        <AICoachStrip
          module="priceTag"
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

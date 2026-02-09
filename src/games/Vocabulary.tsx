import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useGameStore } from '../store/gameStore';
import { useConfetti } from '../hooks/useConfetti';
import { useTimer } from '../hooks/useTimer';
import { WORD_BANK } from '../data/wordBank';
import type { WordEntry } from '../data/wordBank';

type GameMode = 'memory' | 'speed' | 'spotlight';
const GAME_MODES: { id: GameMode; name: string; emoji: string; description: string }[] = [
  { id: 'memory', name: 'זיכרון', emoji: '🧠', description: 'מצא זוגות!' },
  { id: 'speed', name: 'מהירות', emoji: '⚡', description: 'לחץ מהר על המילה הנכונה!' },
  { id: 'spotlight', name: 'זרקור', emoji: '🔦', description: 'מה מסתתר בתמונה?' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Vocabulary() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  if (!selectedMode) {
    return (
      <div className="game-background min-h-screen p-4">
        <GameHeader
          title="אוצר מילים חזותי"
          emoji="🎯"
          color="#10B981"
          onBack={() => navigate('/home')}
          showScore={false}
        />
        <div className="max-w-xl mx-auto">
          <p className="text-center text-gray-500 mb-6">בחר מצב משחק:</p>
          <div className="grid gap-4">
            {GAME_MODES.map((mode, i) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedMode(mode.id)}
                className="card-3d p-5 text-right flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl shrink-0">
                  {mode.emoji}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{mode.name}</h2>
                  <p className="text-sm text-gray-500">{mode.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {selectedMode === 'memory' && <MemoryGame onBack={() => setSelectedMode(null)} />}
      {selectedMode === 'speed' && <SpeedMatchGame onBack={() => setSelectedMode(null)} />}
      {selectedMode === 'spotlight' && <SpotlightGame onBack={() => setSelectedMode(null)} />}
    </div>
  );
}

// --- Memory Game ---
interface MemoryCard {
  id: number;
  entry: WordEntry;
  type: 'emoji' | 'word';
  flipped: boolean;
  matched: boolean;
}

function MemoryGame({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { recordAnswer } = useGameStore();
  const { fireSuccess } = useConfetti();

  const words = shuffle(WORD_BANK).slice(0, 6);
  const [cards, setCards] = useState<MemoryCard[]>(() => {
    const pairs: MemoryCard[] = [];
    words.forEach((entry, i) => {
      pairs.push({ id: i * 2, entry, type: 'emoji', flipped: false, matched: false });
      pairs.push({ id: i * 2 + 1, entry, type: 'word', flipped: false, matched: false });
    });
    return shuffle(pairs);
  });
  const [selected, setSelected] = useState<number[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const lockRef = useRef(false);

  const handleFlip = useCallback((id: number) => {
    if (lockRef.current) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      lockRef.current = true;
      const [first, second] = newSelected.map(sid => newCards.find(c => c.id === sid)!);

      if (first.entry.word === second.entry.word && first.type !== second.type) {
        // Match!
        setTimeout(() => {
          recordAnswer(first.entry.word, first.entry.category, true, 1000);
          fireSuccess();
          setCards(prev => prev.map(c =>
            c.entry.word === first.entry.word ? { ...c, matched: true } : c
          ));
          setSelected([]);
          lockRef.current = false;

          // Check completion
          const allMatched = newCards.filter(c => !c.matched).length <= 2; // these 2 are being matched now
          if (allMatched) {
            setTimeout(() => setShowComplete(true), 500);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          recordAnswer(first.entry.word, first.entry.category, false, 1000);
          setCards(prev => prev.map(c =>
            newSelected.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setSelected([]);
          lockRef.current = false;
        }, 800);
      }
    }
  }, [cards, selected, recordAnswer, fireSuccess]);

  if (showComplete) {
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-3d p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-2">זיכרון מעולה!</h2>
          <p className="text-gray-500 mb-6">מצאת את כל הזוגות</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onBack} className="btn-3d btn-3d-primary">עוד משחק 🔄</button>
            <button onClick={() => navigate('/home')} className="btn-3d btn-3d-secondary">חזרה 🏠</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="game-background min-h-screen p-4">
      <GameHeader title="זיכרון" emoji="🧠" color="#10B981" onBack={onBack} />
      <div className="max-w-xl mx-auto">
        <p className="text-center text-gray-500 text-sm mb-4">👆 מצא זוגות: אימוג'י ↔ מילה</p>
        <div className="grid grid-cols-3 gap-3">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-xl text-center flex items-center justify-center text-lg font-bold transition-all ${
                card.matched
                  ? 'bg-green-100 border-2 border-green-300'
                  : card.flipped
                  ? 'bg-indigo-50 border-2 border-indigo-300'
                  : 'bg-white border-2 border-gray-200 hover:border-indigo-200'
              }`}
            >
              {card.flipped || card.matched ? (
                <div className="animate-pop-in">
                  {card.type === 'emoji' ? (
                    <span className="text-3xl">{card.entry.emoji}</span>
                  ) : (
                    <span className="text-sm font-mono" dir="ltr">{card.entry.word}</span>
                  )}
                </div>
              ) : (
                <span className="text-2xl">❓</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Speed Match Game ---
function SpeedMatchGame({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { recordAnswer, adaptive } = useGameStore();
  const { fireSuccess } = useConfetti();
  const { start, getResponseTime } = useTimer();

  const TOTAL = 10;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetWord, setTargetWord] = useState<WordEntry | null>(null);
  const [options, setOptions] = useState<WordEntry[]>([]);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const [showComplete, setShowComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | undefined>(undefined);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const setupRound = useCallback(() => {
    const words = shuffle(WORD_BANK);
    const target = words[0];
    const distractors = words.slice(1, 4);
    setTargetWord(target);
    setOptions(shuffle([target, ...distractors]));
    setAttemptCount(0);
    setLastAnswer(undefined);
    setLastCorrect(null);
    start();
  }, [start]);

  useEffect(() => {
    setupRound();
  }, [currentIdx, setupRound]);

  const handleChoice = useCallback((word: WordEntry) => {
    if (!targetWord) return;
    const correct = word.word === targetWord.word;
    const time = getResponseTime();
    recordAnswer(targetWord.word, targetWord.category, correct, time);

    setAttemptCount(c => c + 1);
    setLastAnswer(word.word);
    setLastCorrect(correct);

    if (correct) {
      fireSuccess();
      setCorrectCount(c => c + 1);
    }
    setFeedback({ show: true, correct });

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentIdx + 1 < TOTAL) {
        setCurrentIdx(c => c + 1);
      } else {
        setShowComplete(true);
      }
    }, 800);
  }, [targetWord, getResponseTime, recordAnswer, fireSuccess, currentIdx]);

  if (showComplete) {
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-3d p-8 text-center max-w-md">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-2">סיום!</h2>
          <p className="text-gray-500 mb-2">{correctCount}/{TOTAL} תשובות נכונות</p>
          <AICoachStrip
            module="vocabulary"
            currentWord={targetWord?.word}
            attemptCount={attemptCount}
            streak={adaptive.combo}
            gameComplete={true}
          />
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => { setCurrentIdx(0); setCorrectCount(0); setShowComplete(false); }} className="btn-3d btn-3d-primary">עוד סיבוב 🔄</button>
            <button onClick={onBack} className="btn-3d btn-3d-secondary">בחר משחק</button>
            <button onClick={() => navigate('/home')} className="btn-3d btn-3d-secondary">חזרה 🏠</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!targetWord) return null;

  return (
    <div className="game-background min-h-screen p-4">
      <GameHeader title="מהירות" emoji="⚡" color="#10B981" onBack={onBack} progress={currentIdx / TOTAL} />
      <div className="max-w-xl mx-auto">
        <div className="card-game-giant p-8 text-center mb-6">
          <div className="text-7xl mb-4">{targetWord.emoji}</div>
          <p className="text-lg text-gray-500 font-bold">{targetWord.hebrew}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <motion.button
              key={opt.word}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleChoice(opt)}
              className="card-3d p-4 text-center text-lg font-mono font-bold"
              dir="ltr"
            >
              {opt.word}
            </motion.button>
          ))}
        </div>

        <AICoachStrip
          module="vocabulary"
          currentWord={targetWord.word}
          childAnswer={lastAnswer}
          isCorrect={lastCorrect}
          attemptCount={attemptCount}
          streak={adaptive.combo}
        />
      </div>
      <FeedbackOverlay show={feedback.show} correct={feedback.correct} />
    </div>
  );
}

// --- Spotlight Game ---
function SpotlightGame({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { recordAnswer, adaptive } = useGameStore();
  const { fireSuccess } = useConfetti();
  const { start, getResponseTime } = useTimer();

  const TOTAL = 8;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetWord, setTargetWord] = useState<WordEntry | null>(null);
  const [options, setOptions] = useState<WordEntry[]>([]);
  const [blur, setBlur] = useState(20);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const [showComplete, setShowComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | undefined>(undefined);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const setupRound = useCallback(() => {
    const words = shuffle(WORD_BANK);
    const target = words[0];
    const distractors = words.slice(1, 4);
    setTargetWord(target);
    setOptions(shuffle([target, ...distractors]));
    setBlur(20);
    setAttemptCount(0);
    setLastAnswer(undefined);
    setLastCorrect(null);
    start();
  }, [start]);

  useEffect(() => {
    setupRound();
  }, [currentIdx, setupRound]);

  // Gradually reduce blur
  useEffect(() => {
    if (blur <= 0) return;
    const timer = setInterval(() => {
      setBlur(b => Math.max(0, b - 1));
    }, 200);
    return () => clearInterval(timer);
  }, [blur, currentIdx]);

  const handleChoice = useCallback((word: WordEntry) => {
    if (!targetWord) return;
    const correct = word.word === targetWord.word;
    const time = getResponseTime();
    recordAnswer(targetWord.word, targetWord.category, correct, time);

    setAttemptCount(c => c + 1);
    setLastAnswer(word.word);
    setLastCorrect(correct);

    if (correct) fireSuccess();
    setFeedback({ show: true, correct });

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentIdx + 1 < TOTAL) {
        setCurrentIdx(c => c + 1);
      } else {
        setShowComplete(true);
      }
    }, correct ? 1000 : 600);
  }, [targetWord, getResponseTime, recordAnswer, fireSuccess, currentIdx]);

  if (showComplete) {
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-3d p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔦</div>
          <h2 className="text-2xl font-bold mb-2">כל הכבוד!</h2>
          <AICoachStrip
            module="vocabulary"
            currentWord={targetWord?.word}
            attemptCount={attemptCount}
            streak={adaptive.combo}
            gameComplete={true}
          />
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => { setCurrentIdx(0); setShowComplete(false); }} className="btn-3d btn-3d-primary">עוד סיבוב 🔄</button>
            <button onClick={onBack} className="btn-3d btn-3d-secondary">בחר משחק</button>
            <button onClick={() => navigate('/home')} className="btn-3d btn-3d-secondary">חזרה 🏠</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!targetWord) return null;

  return (
    <div className="game-background min-h-screen p-4">
      <GameHeader title="זרקור" emoji="🔦" color="#10B981" onBack={onBack} progress={currentIdx / TOTAL} />
      <div className="max-w-xl mx-auto">
        <div className="card-game-giant p-8 text-center mb-6">
          <div
            className="text-8xl mb-4 transition-all duration-200"
            style={{ filter: `blur(${blur}px)` }}
          >
            {targetWord.emoji}
          </div>
          <p className="text-base text-gray-400 font-bold">
            {blur > 10 ? '🔦 התמונה מתבהרת...' : blur > 0 ? '🔦 כמעט רואים!' : '👀 ברור!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {options.map((opt) => (
            <motion.button
              key={opt.word}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleChoice(opt)}
              className="card-3d p-4 text-center"
            >
              <span className="text-lg font-mono font-bold" dir="ltr">{opt.word}</span>
              <br />
              <span className="text-sm text-gray-500">{opt.hebrew}</span>
            </motion.button>
          ))}
        </div>

        <AICoachStrip
          module="vocabulary"
          currentWord={targetWord.word}
          childAnswer={lastAnswer}
          isCorrect={lastCorrect}
          attemptCount={attemptCount}
          streak={adaptive.combo}
        />
      </div>
      <FeedbackOverlay show={feedback.show} correct={feedback.correct} />
    </div>
  );
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { Hearts } from '../components/ui/Hearts';
import { StarRating } from '../components/ui/StarRating';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useGameStore } from '../store/gameStore';
import { useConfetti } from '../hooks/useConfetti';
import { formatTime } from '../hooks/useTimer';
import { getWordsByCategory, getClothingWords, getNumberWords, WORD_BANK } from '../data/wordBank';
import type { WordCategory, WordEntry } from '../data/wordBank';

const BOSS_TIME_LIMIT = 90_000; // 90 seconds
const MAX_HEARTS = 3;
const QUESTIONS_PER_BOSS = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface BossQuestion {
  type: 'pick-word' | 'pick-emoji' | 'pick-hebrew';
  target: WordEntry;
  options: WordEntry[];
  prompt: string;
  promptEmoji: string;
}

function generateBossQuestions(category: WordCategory): BossQuestion[] {
  const words = category === 'numbers'
    ? getNumberWords()
    : category === 'clothing'
    ? getClothingWords()
    : getWordsByCategory(category);

  const questions: BossQuestion[] = [];
  const shuffledWords = shuffle(words);

  for (let i = 0; i < QUESTIONS_PER_BOSS; i++) {
    const target = shuffledWords[i % shuffledWords.length];
    const others = shuffle(words.filter(w => w.word !== target.word)).slice(0, 3);
    const options = shuffle([target, ...others]);
    const questionType = ['pick-word', 'pick-emoji', 'pick-hebrew'][i % 3] as BossQuestion['type'];

    let prompt = '';
    let promptEmoji = '';

    switch (questionType) {
      case 'pick-word':
        prompt = `מה המילה של ${target.hebrew}?`;
        promptEmoji = target.emoji;
        break;
      case 'pick-emoji':
        prompt = 'באיזה אימוג\'י מדובר?';
        promptEmoji = '❓';
        break;
      case 'pick-hebrew':
        prompt = `מה המשמעות?`;
        promptEmoji = target.emoji;
        break;
    }

    questions.push({ type: questionType, target, options, prompt, promptEmoji });
  }

  return questions;
}

export function BossLevel() {
  const { category } = useParams<{ category: WordCategory }>();
  const navigate = useNavigate();
  const { recordAnswer, completeBoss: completeBossStore } = useGameStore();
  const { fireBoss } = useConfetti();

  const [questions] = useState<BossQuestion[]>(() => generateBossQuestions(category as WordCategory));
  const [currentQ, setCurrentQ] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [timeLeft, setTimeLeft] = useState(BOSS_TIME_LIMIT);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message?: string }>({ show: false, correct: false });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTime.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, BOSS_TIME_LIMIT - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setGameOver(true);
        setWon(false);
      }
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (gameOver && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameOver]);

  const handleAnswer = useCallback((selected: WordEntry) => {
    const q = questions[currentQ];
    const correct = selected.word === q.target.word;

    recordAnswer(q.target.word, category as WordCategory, correct, 1000);

    if (correct) {
      setCorrectCount(c => c + 1);
      setAttemptCount(0);
      setFeedback({ show: true, correct: true, message: '👍' });
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setAttemptCount(c => c + 1);
      setFeedback({ show: true, correct: false, message: `❤️ ${newHearts}` });

      if (newHearts <= 0) {
        setTimeout(() => {
          setGameOver(true);
          setWon(false);
          setFeedback({ show: false, correct: false });
        }, 800);
        return;
      }
    }

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
      } else {
        // Completed all questions!
        const stars = hearts === MAX_HEARTS ? 3 : hearts >= 2 ? 2 : 1;
        completeBossStore(category as WordCategory, stars);
        fireBoss();
        setWon(true);
        setGameOver(true);
      }
    }, 600);
  }, [currentQ, questions, hearts, category, recordAnswer, completeBossStore, fireBoss]);

  if (gameOver) {
    const stars = won ? (hearts === MAX_HEARTS ? 3 : hearts >= 2 ? 2 : 1) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="card-premium p-8 text-center max-w-md"
        >
          <div className="text-5xl mb-4">{won ? '🏆' : '💪'}</div>
          <h2 className="text-2xl font-bold mb-2">{won ? 'ניצחת את הבוס!' : 'לא נורא, נסה שוב!'}</h2>
          {won && <StarRating stars={stars} />}
          <p className="text-gray-500 mt-3 mb-6">
            {correctCount}/{questions.length} תשובות נכונות
          </p>
          {!won && (
            <p className="text-sm text-gray-400 mb-4">
              💡 טיפ: חזור לתרגל ונסה שוב
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/home')} className="btn-game btn-game-primary">
              חזרה 🏠
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  const timePercent = timeLeft / BOSS_TIME_LIMIT;

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        title={`👾 בוס - ${category === 'magic-e' ? 'Magic E' : category === 'clothing' ? 'בגדים' : category === 'numbers' ? 'מחירים' : 'בית'}`}
        emoji="👾"
        color="#EF4444"
        onBack={() => navigate('/home')}
        progress={currentQ / questions.length}
      />

      <div className="max-w-lg mx-auto">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-4">
          <Hearts total={MAX_HEARTS} remaining={hearts} />
          <div className={`text-lg font-mono font-bold ${timePercent < 0.25 ? 'text-red-500' : 'text-gray-600'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 rounded-full bg-gray-200 mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${timePercent * 100}%`,
              background: timePercent > 0.5 ? '#10B981' : timePercent > 0.25 ? '#F59E0B' : '#EF4444',
            }}
          />
        </div>

        {/* Question */}
        <div className="card-premium p-6 mb-6 text-center">
          <div className="text-4xl mb-3">{q.promptEmoji}</div>
          {q.type === 'pick-word' && (
            <div>
              <p className="text-lg font-bold mb-1">{q.prompt}</p>
              <p className="text-3xl">{q.target.emoji}</p>
            </div>
          )}
          {q.type === 'pick-emoji' && (
            <div>
              <p className="text-lg font-bold mb-1">?{q.target.word} =</p>
            </div>
          )}
          {q.type === 'pick-hebrew' && (
            <div>
              <p className="text-lg font-bold mb-1" dir="ltr">{q.target.word} {q.target.emoji}</p>
              <p className="text-gray-500">מה המשמעות?</p>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt) => (
            <motion.button
              key={opt.word}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnswer(opt)}
              className="card-premium p-4 text-center"
            >
              {q.type === 'pick-word' && (
                <span className="text-lg font-mono font-bold" dir="ltr">{opt.word}</span>
              )}
              {q.type === 'pick-emoji' && (
                <span className="text-3xl">{opt.emoji}</span>
              )}
              {q.type === 'pick-hebrew' && (
                <span className="text-lg font-bold">{opt.hebrew}</span>
              )}
            </motion.button>
          ))}
        </div>

        <AICoachStrip
          module="boss"
          currentWord={q.target.word}
          isCorrect={feedback.show ? feedback.correct : null}
          attemptCount={attemptCount}
          streak={correctCount}
          gameComplete={gameOver && won}
        />
      </div>

      <FeedbackOverlay show={feedback.show} correct={feedback.correct} message={feedback.message} />
    </div>
  );
}

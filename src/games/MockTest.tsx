import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { StarRating } from '../components/ui/StarRating';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useGameStore } from '../store/gameStore';
import { useConfetti } from '../hooks/useConfetti';
import { formatTime } from '../hooks/useTimer';
import { getMagicEWords, getClothingWords, getNumberWords, getHouseWords, WORD_BANK } from '../data/wordBank';
import type { WordEntry } from '../data/wordBank';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ADJECTIVES_FOR_SENTENCES = ['new', 'old', 'clean', 'long', 'warm'];

interface TestQuestion {
  id: number;
  section: string;
  sectionEmoji: string;
  type: 'magic-e-identify' | 'sentence-complete' | 'price-match' | 'vocab-match';
  prompt: string;
  promptEmoji: string;
  options: { text: string; emoji?: string; correct: boolean }[];
  relatedWord: string;
}

function generateTestQuestions(): TestQuestion[] {
  const questions: TestQuestion[] = [];
  let id = 0;

  // Section A: Magic E (5 questions)
  const magicWords = shuffle(getMagicEWords()).slice(0, 5);
  for (const w of magicWords) {
    const others = shuffle(getMagicEWords().filter(o => o.word !== w.word)).slice(0, 3);
    questions.push({
      id: id++,
      section: 'Magic E',
      sectionEmoji: '✨',
      type: 'magic-e-identify',
      prompt: `${w.emoji} ${w.hebrew} =`,
      promptEmoji: w.emoji,
      options: shuffle([
        { text: w.word, emoji: w.emoji, correct: true },
        ...others.map(o => ({ text: o.word, emoji: o.emoji, correct: false })),
      ]),
      relatedWord: w.word,
    });
  }

  // Section B: Sentence Builder (5 questions)
  const clothingForSentences = shuffle(getClothingWords()).slice(0, 5);
  for (const item of clothingForSentences) {
    const adj = ADJECTIVES_FOR_SENTENCES[Math.floor(Math.random() * ADJECTIVES_FOR_SENTENCES.length)];
    const wrongAdjs = shuffle(ADJECTIVES_FOR_SENTENCES.filter(a => a !== adj)).slice(0, 3);
    questions.push({
      id: id++,
      section: 'משפטים',
      sectionEmoji: '🧩',
      type: 'sentence-complete',
      prompt: `The ${item.word} is ___`,
      promptEmoji: item.emoji,
      options: shuffle([
        { text: adj, correct: true },
        ...wrongAdjs.map(w => ({ text: w, correct: false })),
      ]),
      relatedWord: item.word,
    });
  }

  // Section C: Price Tag (5 questions)
  const numbers = shuffle(getNumberWords()).slice(0, 5);
  const clothingForPrices = shuffle(getClothingWords());
  for (let i = 0; i < 5; i++) {
    const num = numbers[i];
    const item = clothingForPrices[i % clothingForPrices.length];
    const wrongNums = shuffle(getNumberWords().filter(n => n.word !== num.word)).slice(0, 3);
    questions.push({
      id: id++,
      section: 'מחירים',
      sectionEmoji: '💰',
      type: 'price-match',
      prompt: `The ${item.word} is ___ dollar ($${num.hebrew})`,
      promptEmoji: '💵',
      options: shuffle([
        { text: num.word, correct: true },
        ...wrongNums.map(n => ({ text: n.word, correct: false })),
      ]),
      relatedWord: num.word,
    });
  }

  // Section D: Visual Vocabulary (5 questions)
  const vocabWords = shuffle(WORD_BANK).slice(0, 5);
  for (const w of vocabWords) {
    const others = shuffle(WORD_BANK.filter(o => o.word !== w.word)).slice(0, 3);
    questions.push({
      id: id++,
      section: 'אוצר מילים',
      sectionEmoji: '🎯',
      type: 'vocab-match',
      prompt: `${w.emoji} =`,
      promptEmoji: w.emoji,
      options: shuffle([
        { text: w.word, correct: true },
        ...others.map(o => ({ text: o.word, correct: false })),
      ]),
      relatedWord: w.word,
    });
  }

  return questions;
}

export function MockTest() {
  const navigate = useNavigate();
  const { completeMockTest } = useGameStore();
  const { fireBoss } = useConfetti();

  const [questions] = useState<TestQuestion[]>(generateTestQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => new Array(questions.length).fill(null));
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  const [showResults, setShowResults] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTime.current);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAnswer = useCallback((optionIdx: number) => {
    const q = questions[currentQ];
    const correct = q.options[optionIdx].correct;
    const newAnswers = [...answers];
    newAnswers[currentQ] = correct;
    setAnswers(newAnswers);

    setFeedback({ show: true, correct });
    if (correct) {
      setAttemptCount(0);
    } else {
      setAttemptCount(c => c + 1);
    }

    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentQ + 1 < questions.length) {
        setCurrentQ(c => c + 1);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        const score = Math.round(
          (newAnswers.filter(a => a === true).length / questions.length) * 100
        );
        completeMockTest(score);
        if (score >= 70) fireBoss();
        setShowResults(true);
      }
    }, 800);
  }, [currentQ, questions, answers, completeMockTest, fireBoss]);

  if (showResults) {
    const correctCount = answers.filter(a => a === true).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

    // Identify weak sections
    const sectionResults: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!sectionResults[q.section]) sectionResults[q.section] = { correct: 0, total: 0 };
      sectionResults[q.section].total++;
      if (answers[i]) sectionResults[q.section].correct++;
    });

    const weakSections = Object.entries(sectionResults)
      .filter(([, r]) => r.correct / r.total < 0.6)
      .map(([name]) => name);

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="card-premium p-8 text-center max-w-lg w-full"
        >
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">תוצאות המבחן</h2>

          <div className="text-5xl font-bold mb-2" style={{
            color: score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444',
          }}>
            {score}%
          </div>

          <StarRating stars={stars} size="lg" />

          <div className="mt-4 mb-6 space-y-2 text-right">
            <p className="text-gray-600">✅ {correctCount}/{questions.length} תשובות נכונות</p>
            <p className="text-gray-600">⏱️ זמן: {formatTime(elapsed)}</p>
            <p className="text-gray-600">❌ {questions.length - correctCount} טעויות</p>
          </div>

          {/* Section breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-right">
            <h3 className="font-bold mb-3">📊 פירוט לפי נושא:</h3>
            {Object.entries(sectionResults).map(([name, r]) => (
              <div key={name} className="flex items-center justify-between mb-2">
                <span className="text-sm">{name}</span>
                <span className={`text-sm font-bold ${r.correct / r.total >= 0.6 ? 'text-green-600' : 'text-red-500'}`}>
                  {r.correct}/{r.total}
                </span>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-right">
            <h3 className="font-bold mb-2">💡 מה לעשות עכשיו:</h3>
            {weakSections.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-1">1. חזור לתרגל: {weakSections.join(', ')}</p>
                <p className="text-sm text-gray-600">2. נסה שוב את המבחן אחרי תרגול</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-1">1. כל הכבוד! אתה מוכן למבחן! 🌟</p>
                <p className="text-sm text-gray-600">2. תרגל עוד פעם למען הביטחון</p>
              </>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => { setCurrentQ(0); setAnswers(new Array(questions.length).fill(null)); setShowResults(false); startTime.current = Date.now(); }} className="btn-game btn-game-primary">
              נסה שוב 🔄
            </button>
            <button onClick={() => navigate('/home')} className="btn-game btn-game-secondary">
              חזרה 🏠
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];
  const currentSection = q.section;
  const sectionStart = questions.findIndex(qq => qq.section === currentSection);
  const sectionEnd = questions.filter(qq => qq.section === currentSection).length;
  const sectionIdx = currentQ - sectionStart;

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        title="מבחן דמה"
        emoji="📝"
        color="#6366F1"
        onBack={() => navigate('/home')}
        progress={currentQ / questions.length}
        showScore={false}
      />

      <div className="max-w-lg mx-auto">
        {/* Section indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{q.sectionEmoji}</span>
            <span className="font-bold text-gray-600">{q.section}</span>
            <span className="text-sm text-gray-400">({sectionIdx + 1}/{sectionEnd})</span>
          </div>
          <div className="text-sm font-mono text-gray-500">
            ⏱️ {formatTime(elapsed)}
          </div>
        </div>

        {/* Question card */}
        <div className="card-premium p-6 mb-6 text-center">
          <div className="text-4xl mb-3">{q.promptEmoji}</div>
          <p className="text-xl font-bold" dir="ltr">{q.prompt}</p>
          <p className="text-sm text-gray-400 mt-2">שאלה {currentQ + 1} מתוך {questions.length}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, idx) => (
            <motion.button
              key={`${q.id}-${idx}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnswer(idx)}
              className="card-premium p-4 text-center"
            >
              {opt.emoji && <span className="text-xl mr-2">{opt.emoji}</span>}
              <span className="text-lg font-bold font-mono" dir="ltr">{opt.text}</span>
            </motion.button>
          ))}
        </div>

        <AICoachStrip
          module="mockTest"
          currentWord={q.relatedWord}
          isCorrect={feedback.show ? feedback.correct : null}
          attemptCount={attemptCount}
          gameComplete={showResults}
        />
      </div>

      <FeedbackOverlay show={feedback.show} correct={feedback.correct} />
    </div>
  );
}

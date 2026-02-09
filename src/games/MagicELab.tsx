import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { AICoachStrip } from '../components/ui/AICoachStrip';
import { useGameStore } from '../store/gameStore';
import { useConfetti } from '../hooks/useConfetti';
import { useTimer } from '../hooks/useTimer';
import { getMagicEWords } from '../data/wordBank';
import { pickAdaptiveWords } from '../engine/adaptive';

const MAGIC_E_WORDS = getMagicEWords();
const TOTAL_ROUNDS = 8;

type GameMode = 'drag-e' | 'sound-slider';

interface Round {
  word: string;
  emoji: string;
  hebrew: string;
  mode: GameMode;
}

function generateRounds(state: ReturnType<typeof useGameStore.getState>['adaptive']): Round[] {
  const words = pickAdaptiveWords(state, MAGIC_E_WORDS.map(w => w.word), TOTAL_ROUNDS);
  return words.map((word, i) => {
    const entry = MAGIC_E_WORDS.find(w => w.word === word)!;
    return {
      word: entry.word,
      emoji: entry.emoji,
      hebrew: entry.hebrew,
      mode: i % 2 === 0 ? 'drag-e' : 'sound-slider',
    };
  });
}

export function MagicELab() {
  const navigate = useNavigate();
  const { adaptive, recordAnswer } = useGameStore();
  const { fireSuccess } = useConfetti();
  const { start, getResponseTime } = useTimer();

  const [rounds] = useState<Round[]>(() => generateRounds(adaptive));
  const [currentRound, setCurrentRound] = useState(0);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; message?: string }>({ show: false, correct: false });
  const [eDropped, setEDropped] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [answered, setAnswered] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const round = rounds[currentRound];

  useEffect(() => {
    start();
    setAttemptCount(0);
  }, [currentRound, start]);

  const handleCorrect = useCallback(() => {
    const time = getResponseTime();
    recordAnswer(round.word, 'magic-e', true, time);
    setFeedback({ show: true, correct: true, message: 'מעולה! 🎉' });
    fireSuccess();
    setAnswered(true);
    setAttemptCount(0);
    setTimeout(() => {
      setFeedback({ show: false, correct: false });
      if (currentRound + 1 < rounds.length) {
        setCurrentRound(c => c + 1);
        setEDropped(false);
        setSliderPos(50);
        setAnswered(false);
      } else {
        setShowComplete(true);
      }
    }, 1200);
  }, [currentRound, fireSuccess, getResponseTime, recordAnswer, round, rounds.length]);

  const handleWrong = useCallback(() => {
    const time = getResponseTime();
    recordAnswer(round.word, 'magic-e', false, time);
    setFeedback({ show: true, correct: false, message: 'נסה שוב!' });
    setAttemptCount(prev => prev + 1);
    setTimeout(() => {
      setFeedback({ show: false, correct: false });
    }, 800);
  }, [getResponseTime, recordAnswer, round]);

  if (showComplete) {
    return (
      <div className="game-background min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="card-3d p-8 text-center max-w-md w-full"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8 }}
          >✨</motion.div>
          <h2 className="text-2xl font-extrabold mb-2">כל הכבוד!</h2>
          <p className="text-gray-500 mb-6 font-bold">סיימת את מעבדת Magic E</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setCurrentRound(0); setEDropped(false); setSliderPos(50); setAnswered(false); setShowComplete(false); }} className="btn-3d btn-3d-primary">
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

  const baseWord = round.word === 'wake up' ? 'wak' : round.word.slice(0, -1);
  const hasE = round.word !== 'wake up';

  return (
    <div className="game-background min-h-screen p-4">
      <GameHeader
        title="מעבדת Magic E"
        emoji="✨"
        color="#8B5CF6"
        onBack={() => navigate('/home')}
        progress={currentRound / rounds.length}
      />

      <div className="max-w-xl mx-auto">
        {/* Emoji + Hebrew */}
        <div className="text-center mb-4">
          <span className="text-4xl mb-1 block">{round.emoji}</span>
          <span className="text-lg text-gray-600 font-bold">{round.hebrew}</span>
        </div>

        {/* GIANT GAME CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRound}-${round.mode}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="card-game-giant p-8 mb-6"
          >
            {round.mode === 'drag-e' ? (
              <DragEGame
                baseWord={baseWord}
                fullWord={round.word}
                hasE={hasE}
                eDropped={eDropped}
                onDrop={() => {
                  setEDropped(true);
                  handleCorrect();
                }}
              />
            ) : (
              <SoundSliderGame
                word={round.word}
                sliderPos={sliderPos}
                setSliderPos={setSliderPos}
                answered={answered}
                onSubmit={(correct) => {
                  if (correct) handleCorrect();
                  else handleWrong();
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Instruction hint */}
        <p className="text-center text-gray-400 text-sm mb-4">
          {round.mode === 'drag-e' ? '👆 גרור את ה-e או לחץ עליו' : '🎯 הזז את הסרגל לאזור הסגול'}
        </p>

        {/* Coach */}
        <AICoachStrip
          module="magicE"
          currentWord={round.word}
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

// Drag E sub-game — HUGE word + HUGE e button
function DragEGame({ baseWord, fullWord, hasE, eDropped, onDrop }: {
  baseWord: string;
  fullWord: string;
  hasE: boolean;
  eDropped: boolean;
  onDrop: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  if (!hasE) {
    return (
      <div className="text-center">
        <div className="text-7xl font-mono font-black tracking-widest mb-8" dir="ltr">
          {eDropped ? fullWord : 'wak_ up'}
        </div>
        {!eDropped && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDrop}
            className="btn-3d btn-3d-purple !w-24 !h-24 !p-0 !rounded-3xl !text-5xl animate-pulse-purple cursor-grab active:cursor-grabbing mx-auto"
          >
            e
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Word display — HUGE */}
      <div className="text-7xl font-mono font-black tracking-widest mb-8 flex items-center justify-center gap-1" dir="ltr">
        {baseWord.split('').map((char, i) => (
          <motion.span key={i} className="inline-block">{char}</motion.span>
        ))}
        {eDropped ? (
          <motion.span
            initial={{ scale: 0, y: -30 }}
            animate={{ scale: 1, y: 0 }}
            className="inline-block text-purple-600"
          >
            e
          </motion.span>
        ) : (
          <span className="inline-block w-14 h-20 border-b-4 border-dashed border-purple-300 mx-1" />
        )}
      </div>

      {/* E button — HUGE with pulse glow */}
      {!eDropped && (
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => {
            setDragging(false);
            onDrop();
          }}
          whileHover={{ scale: 1.1 }}
          className={`btn-3d btn-3d-purple !w-24 !h-24 !p-0 !rounded-3xl !text-5xl animate-pulse-purple mx-auto ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          e
        </motion.div>
      )}
    </div>
  );
}

// Sound slider sub-game
function SoundSliderGame({ word, sliderPos, setSliderPos, answered, onSubmit }: {
  word: string;
  sliderPos: number;
  setSliderPos: (v: number) => void;
  answered: boolean;
  onSubmit: (correct: boolean) => void;
}) {
  const correctZone = { min: 55, max: 85 };
  const isInZone = sliderPos >= correctZone.min && sliderPos <= correctZone.max;

  return (
    <div className="w-full px-4">
      {/* Word — HUGE */}
      <div className="text-6xl font-mono font-black tracking-widest mb-8 text-center" dir="ltr">
        {word}
      </div>

      <div className="mb-6">
        <div className="relative h-10 rounded-full bg-gray-100 mx-2 mb-3">
          {/* Correct zone */}
          <div
            className="absolute h-full rounded-full bg-purple-100 border-2 border-purple-300"
            style={{
              left: `${correctZone.min}%`,
              width: `${correctZone.max - correctZone.min}%`,
            }}
          />

          {/* Slider input */}
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            disabled={answered}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            dir="ltr"
          />

          {/* Visual thumb */}
          <motion.div
            className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-3 shadow-lg ${
              isInZone ? 'bg-purple-500 border-purple-600' : 'bg-white border-gray-300'
            }`}
            style={{ left: `calc(${sliderPos}% - 20px)` }}
            animate={{ scale: isInZone ? 1.15 : 1 }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-400 px-4" dir="ltr">
          <span>🔈</span>
          <span className="text-purple-500 font-bold">✨ Magic E ✨</span>
          <span>🔊</span>
        </div>
      </div>

      {!answered && (
        <div className="text-center">
          <button
            onClick={() => onSubmit(isInZone)}
            className="btn-3d btn-3d-success text-xl"
          >
            ✓ בדיקה
          </button>
        </div>
      )}
    </div>
  );
}

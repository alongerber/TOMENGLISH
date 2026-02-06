import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../components/ui/GameHeader';
import { FeedbackOverlay } from '../components/ui/FeedbackOverlay';
import { CoachButton } from '../components/ui/CoachButton';
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

  const round = rounds[currentRound];

  useEffect(() => {
    start();
  }, [currentRound, start]);

  const handleCorrect = useCallback(() => {
    const time = getResponseTime();
    recordAnswer(round.word, 'magic-e', true, time);
    setFeedback({ show: true, correct: true, message: 'מעולה! 🎉' });
    fireSuccess();
    setAnswered(true);
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
    setTimeout(() => {
      setFeedback({ show: false, correct: false });
    }, 800);
  }, [getResponseTime, recordAnswer, round]);

  if (showComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card-premium p-8 text-center max-w-md">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-2">כל הכבוד!</h2>
          <p className="text-gray-500 mb-6">סיימת את מעבדת Magic E</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setCurrentRound(0); setEDropped(false); setSliderPos(50); setAnswered(false); setShowComplete(false); }} className="btn-game btn-game-primary">
              עוד סיבוב 🔄
            </button>
            <button onClick={() => navigate('/home')} className="btn-game btn-game-secondary">
              חזרה 🏠
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!round) return null;

  // Remove trailing 'e' for display in drag mode
  const baseWord = round.word === 'wake up' ? 'wak' : round.word.slice(0, -1);
  const hasE = round.word !== 'wake up'; // wake up is special

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        title="מעבדת Magic E"
        emoji="✨"
        color="#8B5CF6"
        onBack={() => navigate('/home')}
        progress={currentRound / rounds.length}
      />

      <div className="max-w-lg mx-auto">
        {/* Instruction */}
        <div className="text-center mb-6">
          <span className="text-3xl mb-2 block">{round.emoji}</span>
          <p className="text-gray-500 text-sm">
            {round.mode === 'drag-e' ? '👆 גרור את ה-e למקום הנכון' : '🎯 הזז את הסרגל לצליל הנכון'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRound}-${round.mode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-premium p-8 text-center mb-6"
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

        {/* Hebrew translation */}
        <div className="text-center mb-4">
          <span className="text-lg text-gray-600">{round.hebrew}</span>
        </div>

        {/* Coach */}
        <div className="flex justify-center">
          <CoachButton taskType="magic-e" word={round.word} />
        </div>
      </div>

      <FeedbackOverlay show={feedback.show} correct={feedback.correct} message={feedback.message} />
    </div>
  );
}

// Drag E sub-game
function DragEGame({ baseWord, fullWord, hasE, eDropped, onDrop }: {
  baseWord: string;
  fullWord: string;
  hasE: boolean;
  eDropped: boolean;
  onDrop: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  if (!hasE) {
    // wake up special: show as-is and tap to reveal
    return (
      <div>
        <div className="text-5xl font-mono font-bold tracking-widest mb-6" dir="ltr">
          {eDropped ? fullWord : 'wak_ up'}
        </div>
        {!eDropped && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDrop}
            className="mx-auto block w-16 h-16 rounded-2xl bg-purple-100 border-2 border-purple-300 text-3xl font-bold text-purple-600 cursor-grab active:cursor-grabbing"
          >
            e
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-5xl font-mono font-bold tracking-widest mb-6 flex items-center justify-center gap-1" dir="ltr">
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
          <span className="inline-block w-10 h-14 border-b-4 border-dashed border-purple-300 mx-1" />
        )}
      </div>

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
          className={`mx-auto w-16 h-16 rounded-2xl bg-purple-100 border-2 border-purple-300 text-3xl font-bold text-purple-600 flex items-center justify-center ${
            dragging ? 'cursor-grabbing shadow-xl' : 'cursor-grab'
          }`}
        >
          e
        </motion.div>
      )}

      {!eDropped && (
        <p className="text-xs text-gray-400 mt-3">💡 גרור או לחץ על ה-e</p>
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
  // The "correct zone" is 60-80 on the slider (representing the Magic E sound)
  const correctZone = { min: 55, max: 85 };
  const isInZone = sliderPos >= correctZone.min && sliderPos <= correctZone.max;

  return (
    <div>
      <div className="text-4xl font-mono font-bold tracking-widest mb-6" dir="ltr">
        {word}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-3">🎯 הזז את הסרגל לאזור הצליל של Magic E</p>

        <div className="relative h-8 rounded-full bg-gray-100 mx-4 mb-2">
          {/* Correct zone indicator */}
          <div
            className="absolute h-full rounded-full bg-purple-100 border border-purple-200"
            style={{
              left: `${correctZone.min}%`,
              width: `${correctZone.max - correctZone.min}%`,
            }}
          />

          {/* Slider */}
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

          {/* Visual indicator */}
          <motion.div
            className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-3 shadow-md ${
              isInZone ? 'bg-purple-500 border-purple-600' : 'bg-white border-gray-300'
            }`}
            style={{ left: `calc(${sliderPos}% - 16px)` }}
            animate={{ scale: isInZone ? 1.1 : 1 }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400 px-4" dir="ltr">
          <span>🔈</span>
          <span className="text-purple-400 font-bold">✨ Magic E ✨</span>
          <span>🔊</span>
        </div>
      </div>

      {!answered && (
        <button
          onClick={() => onSubmit(isInZone)}
          className="btn-game btn-game-primary mx-auto block"
        >
          ✓ בדיקה
        </button>
      )}
    </div>
  );
}

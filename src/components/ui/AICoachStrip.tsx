import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotImage } from './MascotImage';
import type { MascotState } from './MascotImage';
import type { HintTrigger, ModuleType } from '../../services/localHints';
import { getLocalHint } from '../../services/localHints';
import { getCoachHint } from '../../services/claudeCoach';

interface AICoachStripProps {
  module: ModuleType;
  currentWord?: string;
  childAnswer?: string;
  isCorrect?: boolean | null;
  attemptCount?: number;
  streak?: number;
  gameComplete?: boolean;
}

export function AICoachStrip({
  module,
  currentWord = '',
  childAnswer,
  isCorrect,
  attemptCount = 0,
  streak = 0,
  gameComplete = false,
}: AICoachStripProps) {
  const [message, setMessage] = useState('');
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [moreHint, setMoreHint] = useState('');
  const [moreLoading, setMoreLoading] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTriggerRef = useRef<string>('');
  const idleSentRef = useRef(false);

  const showMessage = useCallback((text: string, mascot: MascotState = 'idle') => {
    setMessage(text);
    setMascotState(mascot);
    setIsActive(true);
    setShowMore(false);
    setMoreHint('');
    setTimeout(() => setIsActive(false), 3000);
  }, []);

  // Determine trigger and show message
  useEffect(() => {
    let trigger: HintTrigger | null = null;
    let mascot: MascotState = 'idle';

    if (gameComplete) {
      trigger = 'complete';
      mascot = 'celebrate';
    } else if (streak >= 3) {
      trigger = 'streak';
      mascot = 'celebrate';
    } else if (isCorrect === false) {
      if (attemptCount >= 3) {
        trigger = 'wrong_3';
        mascot = 'encourage';
      } else if (attemptCount >= 2) {
        trigger = 'wrong_2';
        mascot = 'encourage';
      } else {
        trigger = 'wrong_1';
        mascot = 'encourage';
      }
    } else if (isCorrect === true) {
      // Don't show message for every correct — only streaks
      return;
    }

    if (trigger) {
      const key = `${trigger}-${attemptCount}-${currentWord}-${streak}`;
      if (key === lastTriggerRef.current) return;
      lastTriggerRef.current = key;

      const hint = getLocalHint(module, trigger);
      showMessage(hint, mascot);
    }
  }, [isCorrect, attemptCount, streak, gameComplete, module, currentWord, showMessage]);

  // Start message on mount
  useEffect(() => {
    const hint = getLocalHint(module, 'start');
    showMessage(hint, 'idle');
  }, [module, showMessage]);

  // Idle timer: 15 seconds of no interaction
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleSentRef.current = false;

    idleTimerRef.current = setTimeout(() => {
      if (!idleSentRef.current) {
        idleSentRef.current = true;
        const hint = getLocalHint(module, 'idle');
        showMessage(hint, 'idle');
      }
    }, 15000);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isCorrect, attemptCount, currentWord, module, showMessage]);

  const handleMoreHint = async () => {
    if (moreLoading) return;
    setMoreLoading(true);
    try {
      const result = await getCoachHint({
        taskType: module,
        word: currentWord,
        childChoice: childAnswer,
        recentErrors: [],
        attemptCount,
      });
      setMoreHint(result.hint);
      setShowMore(true);
    } finally {
      setMoreLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className={`coach-strip ${isActive ? 'active' : ''}`}
        >
          <div className="shrink-0">
            <MascotImage state={mascotState} size="sm" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed text-gray-700">{message}</p>
            <AnimatePresence>
              {showMore && moreHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-indigo-600 mt-1"
                >
                  💡 {moreHint}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleMoreHint}
            disabled={moreLoading}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {moreLoading ? '⏳' : '💡 עוד'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

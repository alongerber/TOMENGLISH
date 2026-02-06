import { motion } from 'framer-motion';
import type { WordEntry } from '../../data/wordBank';

interface WordCardProps {
  entry: WordEntry;
  showWord?: boolean;
  showHebrew?: boolean;
  onClick?: () => void;
  selected?: boolean;
  state?: 'default' | 'correct' | 'incorrect';
  size?: 'sm' | 'md' | 'lg';
}

export function WordCard({
  entry,
  showWord = true,
  showHebrew = false,
  onClick,
  selected = false,
  state = 'default',
  size = 'md',
}: WordCardProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const stateClasses = {
    default: selected
      ? 'border-indigo-500 bg-indigo-50 shadow-[0_0_0_3px_rgba(99,102,241,0.2)]'
      : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50',
    correct: 'border-green-400 bg-green-50',
    incorrect: 'border-red-400 bg-red-50 animate-shake',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold border-2 cursor-pointer select-none transition-all ${sizeClasses[size]} ${stateClasses[state]}`}
      dir="ltr"
    >
      <span className="text-xl">{entry.emoji}</span>
      {showWord && <span className="font-mono tracking-wide">{entry.word}</span>}
      {showHebrew && <span className="text-gray-500 text-sm">({entry.hebrew})</span>}
    </motion.button>
  );
}

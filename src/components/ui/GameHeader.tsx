import { useGameStore } from '../../store/gameStore';

interface GameHeaderProps {
  title: string;
  emoji: string;
  color?: string;
  onBack: () => void;
  progress?: number; // 0-1
  showScore?: boolean;
}

export function GameHeader({ title, emoji, color = '#6366F1', onBack, progress, showScore = true }: GameHeaderProps) {
  const { adaptive, playerName } = useGameStore();

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-lg"
          aria-label="חזרה"
        >
          <span className="text-xl">→</span>
          <span>חזרה</span>
        </button>
        {showScore && (
          <div className="flex items-center gap-3">
            {adaptive.combo > 1 && (
              <span className="text-sm font-bold text-amber-500 animate-pop-in">
                🔥 x{adaptive.combo}
              </span>
            )}
            <span className="text-sm font-semibold text-gray-600">
              ⭐ {adaptive.totalScore}
            </span>
            {playerName && (
              <span className="text-sm text-gray-400">{playerName}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl" style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}>{emoji}</span>
        <h1 className="text-2xl font-bold" style={{ color }}>{title}</h1>
      </div>

      {progress !== undefined && (
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progress * 100, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          />
        </div>
      )}
    </div>
  );
}

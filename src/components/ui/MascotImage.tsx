export type MascotState = 'idle' | 'celebrate' | 'encourage';

interface MascotImageProps {
  state: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const FALLBACK_EMOJIS: Record<MascotState, string> = {
  idle: '🦊',
  celebrate: '🥳',
  encourage: '💪',
};

const SIZE_MAP = {
  sm: { container: 'w-12 h-12', emoji: 'text-2xl' },
  md: { container: 'w-20 h-20', emoji: 'text-4xl' },
  lg: { container: 'w-28 h-28', emoji: 'text-6xl' },
  xl: { container: 'w-40 h-40', emoji: 'text-8xl' },
};

export function MascotImage({ state, size = 'md', className = '' }: MascotImageProps) {
  const sizeClasses = SIZE_MAP[size];

  return (
    <div className={`mascot-bubble ${sizeClasses.container} ${className}`}>
      <span className={sizeClasses.emoji}>{FALLBACK_EMOJIS[state]}</span>
    </div>
  );
}

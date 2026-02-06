import { useState } from 'react';

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
  sm: { container: 'w-12 h-12', emoji: 'text-2xl', bubble: true },
  md: { container: 'w-20 h-20', emoji: 'text-4xl', bubble: true },
  lg: { container: 'w-28 h-28', emoji: 'text-6xl', bubble: true },
  xl: { container: 'w-40 h-40', emoji: 'text-8xl', bubble: true },
};

export function MascotImage({ state, size = 'md', className = '' }: MascotImageProps) {
  const [hasImage, setHasImage] = useState(true);
  const src = `/assets/mascot-${state}.png`;
  const sizeClasses = SIZE_MAP[size];

  if (!hasImage) {
    return (
      <div className={`mascot-bubble ${sizeClasses.container} ${className}`}>
        <span className={sizeClasses.emoji}>{FALLBACK_EMOJIS[state]}</span>
      </div>
    );
  }

  return (
    <div className={`mascot-container ${sizeClasses.container} ${className}`}>
      <img
        src={src}
        onError={() => setHasImage(false)}
        alt="מלווה"
        className="mascot-img"
        loading="eager"
      />
    </div>
  );
}

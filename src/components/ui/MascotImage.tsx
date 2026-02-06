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
  sm: { container: 'w-10 h-10', emoji: 'text-2xl' },
  md: { container: 'w-16 h-16', emoji: 'text-4xl' },
  lg: { container: 'w-24 h-24', emoji: 'text-6xl' },
  xl: { container: 'w-36 h-36', emoji: 'text-8xl' },
};

export function MascotImage({ state, size = 'md', className = '' }: MascotImageProps) {
  const [hasImage, setHasImage] = useState(true);
  const src = `/assets/mascot-${state}.png`;
  const sizeClasses = SIZE_MAP[size];

  if (!hasImage) {
    return (
      <div className={`mascot-emoji ${sizeClasses.container} ${sizeClasses.emoji} ${className}`}>
        {FALLBACK_EMOJIS[state]}
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

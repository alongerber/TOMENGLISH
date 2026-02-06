import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';

export function useConfetti() {
  const quietMode = useGameStore((s) => s.quietMode);

  const fireSuccess = () => {
    if (quietMode) return;
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981'],
      disableForReducedMotion: true,
    });
  };

  const fireBoss = () => {
    if (quietMode) return;
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366F1', '#EC4899', '#F59E0B'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366F1', '#EC4899', '#F59E0B'],
        disableForReducedMotion: true,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  return { fireSuccess, fireBoss };
}
